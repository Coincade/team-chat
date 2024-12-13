import { useQuery} from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetConversationProps{
    memberId: Id<"members">;
    workspaceId: Id<"workspaces">;
}

export const UseGetConversation = ({memberId, workspaceId}: UseGetConversationProps) =>{
    const data = useQuery(api.conversations.get,{memberId, workspaceId})
    const isLoading = data === undefined

    return {data, isLoading};
}