import { useState } from "react";
import { useRouter } from "next/navigation";

import { Id } from "../../../../convex/_generated/dataModel";

import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { UseGetChannels } from "@/features/channels/api/use-get-channels";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { UserButton } from "@/features/auth/components/user-button";

import { Info, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

export const Toolbar = () => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();
  const { data } = useGetWorkspace({ id: workspaceId });
  const { data: channels } = UseGetChannels({ workspaceId });
  const { data: members } = useGetMembers({ workspaceId });

  const [open, setOpen] = useState(false);

  const onChannelClick = (channelId: Id<"channels"> | undefined) => {
    setOpen(false);
    router.push(`/workspace/${workspaceId}/channel/${channelId}`);
  };
  const onMemberClick = (memberId: string) => {
    setOpen(false);
    router.push(`/workspace/${workspaceId}/member/${memberId}`);
  };

  return (
    <nav className="bg-hirect-sidebar flex items-center text-center justify-between h-12 p-1.5   ">
      <div className=" ml-4 flex text-white font-bold items-center  ">
        <h1 className=" mr-[20px] text-2xl">Jibbr</h1>
        <WorkspaceSwitcher />
      </div>

      <div className="ml-auto flex items-center    ">
        <div className="  mr-[20px] min-w-[280px] max-w-[642px] ">
          <Button
            onClick={() => setOpen(true)}
            size="sm"
            className="bg-[#0369a1] hover:bg-accent-25 w-full justify-start h-8 px-2 rounded-full"
          >
            <Search className=" size-6 text-white mr-2  " />
            <span className=" text-gray-300  text-xs">Search...</span>
          </Button>
          <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Channels">
                {channels?.map((channel) => (
                  <CommandItem
                    key={channel?._id}
                    onSelect={() => onChannelClick(channel?._id)}
                  >
                    {channel?.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Members">
                {members?.map((member) => (
                  <CommandItem
                    key={member?._id}
                    onSelect={() => onMemberClick(member?._id)}
                  >
                    {member.user.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </CommandDialog>
        </div>

        {/* <Button variant="transparent" size="iconSm" className="ml-2">
        <Info className="size-5 text-white" />
      </Button> */}
        <div className=" mr-[20px] flex items-center  ">
          <UserButton />
        </div>
      </div>
    </nav>
  );
};
