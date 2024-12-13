import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

export const incrementUnreadCount = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.id("conversations"))
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!member) {
      throw new Error("Unauthorized");
    }

    let otherMembers;
    let existingUnreadRecordId : Id<"unread_messages">
    let unreadMessageId : Id<"unread_messages">

    if (args.channelId) {
      // For channel messages, find all members in the workspace
      otherMembers = await ctx.db
        .query("members")
        .withIndex("by_workspace_id", (q) =>
          q.eq("workspaceId", args.workspaceId)
        )
        .filter((q) => q.neq(q.field("_id"), member._id))
        .collect();

      if (otherMembers && otherMembers.length > 0) {
        for (const member of otherMembers) {
          const existingUnreadRecord = await ctx.db
            .query("unread_messages")
            .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
            .filter((q) =>             
                q.and(
                  q.eq(q.field("memberId"), member._id),
                  q.eq(q.field("channelId"), args.channelId)
                )
            )
            .unique();

          if (existingUnreadRecord) {
            await ctx.db.patch(existingUnreadRecord._id, {
              unreadCount: existingUnreadRecord.unreadCount + 1,
            });
            existingUnreadRecordId =  existingUnreadRecord._id;
          } else {
            const unreadMessageIdData = await ctx.db.insert("unread_messages", {
              memberId: member._id,
              workspaceId: args.workspaceId,
              channelId: args.channelId,
              unreadCount: 1,
              lastReadMessageId: undefined,
            });
            unreadMessageId =  unreadMessageIdData;
          }
        }
        
      }

      return args.channelId;
    } else if (args.conversationId) {  
        const conversation = await ctx.db.get(args.conversationId);

        if(!conversation){
          throw new Error("Invalid Operation")
        };

        let otherMemberId : Id<"members"> = conversation.memberOneId === member._id
        ? conversation.memberTwoId
        : conversation.memberOneId

        const existingUnreadRecord = await ctx.db
        .query("unread_messages")
        .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
        .filter((q) =>
          q.and(
            q.eq(q.field("memberId"), otherMemberId),
            q.eq(q.field("conversationId"), args.conversationId)
          )
        )
        .unique();

        if(existingUnreadRecord){
          await ctx.db.patch(existingUnreadRecord._id, {
            unreadCount: existingUnreadRecord.unreadCount + 1,
          });
          return existingUnreadRecord._id;
        }

    }

    
  },
});

export const markAsRead = mutation({
  args: {
    memberId: v.id("members"),
    workspaceId: v.id("workspaces"),
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.id("conversations")),
    lastMessageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!member) {
      throw new Error("Unauthorized");
    }

    const existingUnreadRecord = await ctx.db
      .query("unread_messages")
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .filter((q) =>
        q.or(
          q.and(
            q.eq(q.field("memberId"), member._id),
            q.eq(q.field("conversationId"), args.conversationId)
          ),
          q.and(
            q.eq(q.field("memberId"), member._id),
            q.eq(q.field("channelId"), args.channelId)
          )
        )
      )
      .unique();

    if (!existingUnreadRecord) {
      throw new Error("Unread Record Not Found");
    }

    if (existingUnreadRecord) {
      await ctx.db.patch(existingUnreadRecord._id, {
        unreadCount: 0,
        lastReadMessageId: args.lastMessageId,
      });
      return existingUnreadRecord._id;
    }
  },
});

export const getUnreadCounts = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return null;
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!member) {
      return null;
    }

    const unreadCounts = await ctx.db
      .query("unread_messages")
      .withIndex("by_workspace_id_member_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("memberId", member._id)
      )
      .collect();

    return unreadCounts;
  },
});

export const getUnreadCountsById = query({
  args: {
    workspaceId: v.id("workspaces"),
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.id("conversations")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return null;
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!member) {
      return null;
    }

    if (args.channelId && !args.conversationId) {
      const unreadCounts = await ctx.db
        .query("unread_messages")
        .withIndex("by_workspace_id_member_id_channel_id", (q) =>
          q
            .eq("workspaceId", args.workspaceId)
            .eq("memberId", member._id)
            .eq("channelId", args.channelId)
        )
        .unique();

      return unreadCounts;
    }

    if (!args.channelId && args.conversationId) {
      const unreadCounts = await ctx.db
        .query("unread_messages")
        .withIndex("by_workspace_id_member_id_conversation_id", (q) =>
          q
            .eq("workspaceId", args.workspaceId)
            .eq("memberId", member._id)
            .eq("conversationId", args.conversationId)
        )
        .unique();

      return unreadCounts;
    }
  },
});
