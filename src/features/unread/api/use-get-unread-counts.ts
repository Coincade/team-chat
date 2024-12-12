import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Id } from "../../../../convex/_generated/dataModel"

interface useGetUnreadCountsProps {
    workspaceId: Id<"workspaces">
}

export const useGetUnreadCounts = ({workspaceId}: useGetUnreadCountsProps) => {
    const data = useQuery(api.unread.getUnreadCounts, {workspaceId});
    const isLoading = data === undefined;

    return {data, isLoading}
}