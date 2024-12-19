import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const remove = mutation({
    args: {
        id: v.id("channels")
    },
    handler: async(ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if(!userId){
            throw new Error("Unauthorized");
        }

        const channel = await ctx.db.get(args.id);

        if(!channel){
            throw new Error("Channel not found");
        }

        const member = await ctx.db
        .query("members")
        .withIndex("by_workspace_id_user_id", (q) => q.eq("workspaceId", channel.workspaceId).eq("userId", userId))
        .unique();

        if(!member || channel.creatorId !== member._id){
            throw new Error("Unauthorized");
        }

        const [messages] = await Promise.all([
            ctx.db
            .query("messages")
            .withIndex("by_channel_id", (q) => q.eq("channelId", args.id))
            .collect()
        ]);

        for(const message of messages){
            await ctx.db.delete(message._id)
        }
        
        await ctx.db.delete(args.id);

        return args.id;
    }
})

export const update = mutation({
    args: {
        id: v.id("channels"),
        name:v.string(),
    },
    handler: async(ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if(!userId){
            throw new Error("Unauthorized");
        }

        const channel = await ctx.db.get(args.id);

        if(!channel){
            throw new Error("Channel not found");
        }

        const member = await ctx.db
        .query("members")
        .withIndex("by_workspace_id_user_id", (q) => q.eq("workspaceId", channel.workspaceId).eq("userId", userId))
        .unique();

        if(!member || channel.creatorId !== member._id){
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(args.id, {
            name: args.name,
        });

        return args.id;
    }
})

export const create = mutation({
    args: {
        name: v.string(),
        workspaceId: v.id("workspaces"),
        type:v.union(v.literal("public"), v.literal("private")),
    },
    handler: async (ctx, args)=> {
        const userId = await getAuthUserId(ctx);

        if(!userId){
            throw new Error("Unauthorized");
        }

        const member = await ctx.db
        .query("members")
        .withIndex("by_workspace_id_user_id", (q) => q.eq("workspaceId", args.workspaceId).eq("userId", userId))
        .unique();

        if(!member){
            throw new Error("Unauthorized");
        }

        const parsedName = args.name.replace(/\s+/g,"-").toLowerCase();

        const channelId = await ctx.db.insert("channels", {
            name: parsedName,
            workspaceId: args.workspaceId,
            type: args.type,
            creatorId: member._id,
        })

        await ctx.db.insert("channel_members", {
            channelId,
            memberId: member._id,
            workspaceId: args.workspaceId,
        })

        return  channelId;
    },
})

export const getById = query({
    args: {
        id: v.id("channels"),
    },
    handler: async(ctx, args) =>{
        const userId = await getAuthUserId(ctx)

        if(!userId){
            return null;
        }

        const channel = await ctx.db.get(args.id);

        if(!channel){
            return null;
        }

        const member = await ctx.db
        .query("members")
        .withIndex("by_workspace_id_user_id", (q) => q.eq("workspaceId", channel.workspaceId).eq("userId", userId))
        .unique();

        if(!member){
            return null;
        }

        return channel;
    }
})

export const get = query({
    args: {
        workspaceId: v.id("workspaces")
    },
    handler: async(ctx, args) => {
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

        // Get all public channels in the workspace
        const publicChannels = await ctx.db
            .query("channels")
            .withIndex("by_workspace_id", (q) => 
                q.eq("workspaceId", args.workspaceId)
            )
            .filter((q) => q.eq(q.field("type"), "public"))
            .collect();

        // Get private channels where the user is a member
        const privateChannelMemberships = await ctx.db
            .query("channel_members")
            .withIndex("by_member_id", (q) => 
                q.eq("memberId", member._id)
            )
            .collect();

        const privateChannelIds = privateChannelMemberships.map(
            membership => membership.channelId
        );

        const privateChannels = await Promise.all(
            privateChannelIds.map(id => ctx.db.get(id))
        ).then(channels => channels.filter(channel => 
            channel && channel.type === "private"  // Only include private channels
        ));
        
        return [...publicChannels, ...privateChannels];
    }
})

export const hasAccess = query({
    args: {
        channelId: v.id("channels")
    },
    handler: async(ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if(!userId){
            return false;
        }

        const channel = await ctx.db.get(args.channelId);
        if(!channel){
            return false;
        }

        // Get the member record for this user
        const member = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) => 
                q.eq("workspaceId", channel.workspaceId)
                .eq("userId", userId)
            )
            .unique();

        if(!member){
            return false;
        }

        // If it's a public channel, user has access
        if(channel.type === "public"){
            return true;
        }

        // For private channels, check channel_members table
        const channelMembership = await ctx.db
            .query("channel_members")
            .withIndex("by_channel_id_member_id", (q) => 
                q.eq("channelId", args.channelId)
                .eq("memberId", member._id)
            )
            .unique();

        // User has access if they're a member or if they created the channel
        return Boolean(channelMembership || channel.creatorId === member._id);
    }
});