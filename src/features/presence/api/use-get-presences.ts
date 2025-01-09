import { useQuery} from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UsePresencesProps{
    workspaceId: Id<"workspaces">;
}

export const UseGetPresences = ({workspaceId}: UsePresencesProps) =>{
    const data = useQuery(api.presence.get,{workspaceId})
    const isLoading = data === undefined

    return {data, isLoading};
}