import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import { TrashIcon } from "lucide-react";
import { FaChevronDown } from "react-icons/fa";
import { useUpdateChannel } from "@/features/channels/api/use-update-channel";
import { useChannelId } from "@/hooks/use-channel-id";
import { toast } from "sonner";
import { useRemoveChannel } from "@/features/channels/api/use-remove-channel";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateChannelMember } from "@/features/channelmembers/api/use-create-channel-member";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { UseGetChannelMembers } from "@/features/channelmembers/api/use-get-channel-members";

interface HeaderProps {
  title: string;
  isCreator?: boolean;
}

export const Header = ({ title, isCreator }: HeaderProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete This channel?",
    "You are about to delete this channel. This action is irreversible"
  );

  const [value, setValue] = useState(title);
  const [selectedMemberId, setSelectedMemberId] = useState<Id<"members"> | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const { data: member } = useCurrentMember({ workspaceId });
  const { mutate: updateChannel, isPending: isUpdatingChannel } =
    useUpdateChannel();
  const { mutate: removeChannel, isPending: isRemovingChannel } =
    useRemoveChannel();
    const { mutate: createChannelMember, isPending: isCreatingChannelMember } = useCreateChannelMember();

    const { data: members } = useGetMembers({ workspaceId });
    const { data: channelMembers } = UseGetChannelMembers({ workspaceId, channelId });

    

  const handleEditOpen = (value: boolean) => {
    if (member?.role !== "admin") return;
    setEditOpen(value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, "-").toLowerCase();
    setValue(value);
  };

  const handleDelete = async () => {
    const ok = await window.confirm(
      "Are you sure you want to delete this channel?"
    );
    if (!ok) return;

    removeChannel(
      { id: channelId },
      {
        onSuccess: () => {
          toast.success("Channel Deleted");
          router.push(`/workspace/${workspaceId}`);
        },
        onError: () => {
          toast.error("Failed to delete channel");
        },
      }
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    updateChannel(
      { id: channelId, name: value },
      {
        onSuccess: () => {
          toast.success("Channel Updated");
          setEditOpen(false);
        },
        onError: () => {
          toast.error("Failed to Update Channel");
        },
      }
    );
  };

  const handleMemberSelect = (memberId: Id<"members">) => {

    createChannelMember({
      channelId,
      workspaceId,
      memberId,
    },
    {
      onSuccess: () => {
        toast.success("Member Added");
        setEditOpen(false);
      },
      onError: () => {
        toast.error("Failed to Add Member");
      },
    }
  );
  };

  return (
    <div className="bg-white border-b h-[49px] flex items-center px-4 overflow-hidden">
      <ConfirmDialog />
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="text-lg font-semibold px-2 overflow-hidden w-auto"
            size="sm"
          >
            <span className="truncate"># {title}</span>
            <FaChevronDown className="size-2.5 ml-2" />
          </Button>
        </DialogTrigger>
        <DialogContent className="p-0 bg-gray-50 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-white">
            <DialogTitle># {title}</DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-4 flex flex-col gap-y-2">
            <Dialog open={editOpen} onOpenChange={handleEditOpen}>
              <DialogTrigger asChild>
                <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Channel Name</p>
                    {member?.role === "admin" && (
                      <p className="text-sm text-[#1264a3] hover:underline font-semibold">
                        Edit
                      </p>
                    )}
                  </div>
                  <p className="text-sm"># {title}</p>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rename This Channel</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    value={value}
                    disabled={isUpdatingChannel}
                    onChange={handleChange}
                    required
                    autoFocus
                    minLength={3}
                    maxLength={80}
                    placeholder="e.g. plan-budget"
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" disabled={isUpdatingChannel}>
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button disabled={isUpdatingChannel}>Save</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            {
              isCreator &&
              //TODO: COndition to check if user is channel admin
              (<Dialog open={editOpen} onOpenChange={handleEditOpen}>
              <DialogTrigger asChild>
                <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Add a member</p>
                      <p className="text-sm text-[#1264a3] hover:underline font-semibold">
                        Add
                      </p>
                  </div>
                  <p className="text-sm"># {title}</p>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                <Select onValueChange={(value) => setSelectedMemberId(value as Id<"members">)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a member" />
                    </SelectTrigger>
                    <SelectContent>
                      {members?.filter(member => 
                        !channelMembers?.some(channelMember => 
                          channelMember.memberId === member._id
                        )
                      ).map((member) => (
                        <SelectItem key={member._id} value={member._id}>
                          {member.user.name || member.user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" disabled={isCreatingChannelMember}>
                        Cancel
                      </Button>
                    </DialogClose>
                    {selectedMemberId === null ? 
                    <Button disabled={true} className="cursor-none">Add Member</Button>
                    :
                    <Button 
                    onClick={() => handleMemberSelect(selectedMemberId)}
                    disabled={isCreatingChannelMember}>Add Member</Button>
                  }
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>)
            }

            {member?.role === "admin" && (
              <button
                onClick={handleDelete}
                disabled={isRemovingChannel}
                className="flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg cursor-pointer border  hover:bg-gray-50 text-rose-600"
              >
                <TrashIcon className="size-4" />
                <p className="text-sm font-semibold">Delete channel</p>
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
