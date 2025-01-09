import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const update = mutation({
  args: {
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
        q
          .eq("workspaceId", args.workspaceId)
          .eq("userId", userId)
      )
      .unique();

    if (!member) {
      throw new Error("Unauthorized");
    }

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_workspace_id_member_id", (q) => 
        q
          .eq("workspaceId", args.workspaceId)
          .eq("memberId", member._id)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastSeen: Date.now(),
      });
      return existing._id;
    }

    const presenceId = await ctx.db.insert("presence", {
      memberId: member._id,
      workspaceId: args.workspaceId,
      lastSeen: Date.now(),
    });

    return presenceId;
  },
});

export const get = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return [];
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) => 
        q
          .eq("workspaceId", args.workspaceId)
          .eq("userId", userId)
      )
      .unique();

    if (!member) {
      return [];
    }

    const twoMinutesAgo = Date.now() - 2 * 60 * 1000;

    const onlineMembers = await ctx.db
      .query("presence")
      .withIndex("by_workspace_id", (q) => 
        q.eq("workspaceId", args.workspaceId)
      )
      .filter((q) => q.gte(q.field("lastSeen"), twoMinutesAgo))
      .collect();

    return onlineMembers;
  },
});

export const getByMemberId = query({
  args: {
    memberId: v.id("members"),
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
        q
          .eq("workspaceId", args.workspaceId)
          .eq("userId", userId)
      )
      .unique();

    if (!member) {
      return null;
    }

    const twoMinutesAgo = Date.now() - 2 * 60 * 1000;

    const presence = await ctx.db
      .query("presence")
      .withIndex("by_workspace_id_member_id", (q) => 
        q
          .eq("workspaceId", args.workspaceId)
          .eq("memberId", args.memberId)
      )
      .filter((q) => q.gte(q.field("lastSeen"), twoMinutesAgo))
      .unique();

    return presence;
  },
});