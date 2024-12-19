import { useQuery} from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetChannelMembersProps{
    workspaceId: Id<"workspaces">;
    channelId: Id<"channels">;
}

export const UseGetChannelMembers = ({workspaceId, channelId}: UseGetChannelMembersProps) =>{
    const data = useQuery(api.channelmembers.get,{workspaceId, channelId})
    const isLoading = data === undefined

    return {data, isLoading};
}