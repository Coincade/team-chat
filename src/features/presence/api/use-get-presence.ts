import { useQuery} from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetPresenceProps{
    memberId: Id<"members">;
    workspaceId: Id<"workspaces">
}

export const UseGetPresence = ({memberId, workspaceId}: UseGetPresenceProps) =>{
    const data = useQuery(api.presence.getByMemberId,{memberId, workspaceId})
    const isLoading = data === undefined

    return {data, isLoading};
}