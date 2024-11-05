"use client";

import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

const WorkspaceIdPage = () => {
  const workspaceId = useWorkspaceId()
  const {data} = useGetWorkspace({id:workspaceId})
  return (
    <div>
        {/* Data : {JSON.stringify(data)} */}
        Workspace Id Page
    </div>
  )
}

export default WorkspaceIdPage