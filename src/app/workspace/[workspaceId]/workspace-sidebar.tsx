import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { UseGetChannels } from "@/features/channels/api/use-get-channels";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useCreateChannelModal } from "@/features/channels/store/use-create-channel-modal";

import { useWorkspaceId } from "@/hooks/use-workspace-id"

import { AlertTriangle, HashIcon, Loader, MessageSquareText, SendHorizontal } from "lucide-react";

import { WorkspaceHeader } from "./workspace-header";
import { SidebarItem } from "./sidebar-item";
import WorkspaceSection from "./workspace-section";
import { UserItem } from "./user-item";
import { useChannelId } from "@/hooks/use-channel-id";
import { useMemberId } from "@/hooks/use-member-id";

export const WorkspaceSidebar = () => {
  const memberId = useMemberId();
  const channelId = useChannelId();
  const workspaceId = useWorkspaceId();

  const [_open, setOpen] = useCreateChannelModal();

  const {data: member, isLoading: memberLoading} = useCurrentMember({workspaceId});
  const {data: workspace, isLoading: workspaceLoading} = useGetWorkspace({id: workspaceId});
  const {data: channels, isLoading:channelsLoading} = UseGetChannels({workspaceId});
  const {data: members, isLoading: membersLoading} = useGetMembers({workspaceId});



  if(workspaceLoading || memberLoading || channelsLoading || membersLoading){
    return (
      <div className="flex flex-col bg-hirect-channelbar h-full items-center justify-center">
        <Loader className="size-5 animate-spin text-white"/>
      </div>
    )
  }

  if(!workspace || !member){
    return (
      <div className="flex flex-col gap-y-2 bg-hirect-channelbar h-full items-center justify-center">
        <AlertTriangle className="size-5 text-white"/>
        <p className="text-white text-sm">Workspace Not Found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col bg-hirect-channelbar h-full">
      <WorkspaceHeader workspace={workspace} isAdmin={member.role === "admin"}/>
      {/* <div className="flex flex-col px-2 mt-3">
        <SidebarItem 
        label="Threads"
        icon={MessageSquareText}
        id="threads"
        />
        <SidebarItem 
        label="Drafts & Sent"
        icon={SendHorizontal}
        id="threads"
        />
        </div> */}
        
        <WorkspaceSection
        label="Channels"
        hint="New channel"
        onNew={member.role === "admin" ?()=>setOpen(true) : undefined}
        >
        {channels?.map((item) => (
          <SidebarItem 
          key={item._id}
          icon={HashIcon}
          label={item.name}
          id={item._id}
          variant={channelId == item._id ? "active" : "default"}
          channelId={item._id}
          />
        ))}
        </WorkspaceSection>

        <WorkspaceSection
        label="Direct Messages"
        hint="New direct message"
        onNew={()=>{}}
        >
        {members?.map((item) => (
          <UserItem 
          key={item._id}
          id={item._id}
          label={item.user.name}
          image={item.user.image}
          variant={item._id === memberId ? "active" : "default"}
          />
        ))}
        </WorkspaceSection>
      
    </div>
  )
}