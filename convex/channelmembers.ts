import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    channelId: v.id("channels"),
    memberId: v.id("members"),
    workspaceId: v.id("workspaces"),
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

      const channel = await ctx.db.get(args.channelId);

    if (!member || member._id !== channel?.creatorId) {
      throw new Error("Unauthorized");
    }

    const channelMemberId = await ctx.db.insert("channel_members", {
        channelId: args.channelId,
        memberId: args.memberId,
        workspaceId: args.workspaceId,
    })

    return channelMemberId;
  },
});

export const get = query({
    args:{
        channelId: v.id("channels"),
        workspaceId: v.id("workspaces"),
    },
    handler: async(ctx, args) =>{
        const userId = await getAuthUserId(ctx)

        if(!userId){
            return [];
        }

        const member = await ctx.db
        .query("members")
        .withIndex("by_workspace_id_user_id", (q) => 
            q.eq("workspaceId", args.workspaceId).eq("userId", userId)
        )
        .unique();

        if(!member){
            return []
        }

        const channelmembers = await ctx.db
        .query("channel_members")
        .withIndex("by_channel_id", (q) =>
        q.eq("channelId", args.channelId)
        )
        .collect()

        return channelmembers;

    }
})

export const remove = mutation({
  args: {
    channelId: v.id("channels"),
    memberId: v.id("members"),
    workspaceId: v.id("workspaces"),
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

      const channel = await ctx.db.get(args.channelId);

    if (!member || member._id !== channel?.creatorId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.memberId)

    return args.memberId;
  },
});
