"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader } from "lucide-react";

import { useCreateOrGetConversation } from "@/features/conversations/api/use-create-or-get-conversation";

import { useMemberId } from "@/hooks/use-member-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

import { Id } from "../../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Conversation } from "./conversation";
import { useMarkAsRead } from "@/features/unread/api/use-mark-as-read";

const MemberIdPage = () => {
  const memberId = useMemberId();
  const workspaceId = useWorkspaceId();

  const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(null);

  const { data, mutate, isPending } = useCreateOrGetConversation();
  const {mutate: markAsRead} = useMarkAsRead();

  useEffect(() => {
    mutate({
      workspaceId,
      memberId,
    },{
      onSuccess(data){
        setConversationId(data)
      },
      onError(){
        toast.error("Failed to create ot get a conversation");
      }
    });
    conversationId &&
    markAsRead({
      workspaceId,
      conversationId,
    },
  {throwError: false}
  )
  }, [memberId, workspaceId, conversationId, mutate]);

  if (isPending) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-10 animate-spin text-muted foreground" />
      </div>
    );
  }
  if (!conversationId) {
    return (
      <div className="h-full flex flex-col gap-y-2 items-center justify-center">
        <AlertTriangle className="size-10 text-muted foreground" />
        <span className="text-sm text-muted-foreground">Conversation Not Found</span>
      </div>
    );
  }

  return <Conversation id={conversationId}/>


};

export default MemberIdPage;
