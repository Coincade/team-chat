import { useQuery} from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetUnreadCountProps{
    workspaceId: Id<"workspaces">;
    channelId?: Id<"channels">;
    conversationId?: Id<"conversations">
}

export const UseGetUnreadCount = ({workspaceId,channelId,conversationId}: UseGetUnreadCountProps) =>{
    const data = useQuery(api.unread.getUnreadCountsById,{workspaceId,channelId,conversationId})
    const isLoading = data === undefined

    return {data, isLoading};
}