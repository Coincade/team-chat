"use client";

import { useEffect, useMemo, useCallback } from "react";

import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useCreateWorkspaceModal } from "@/features/workspaces/store/use-create-workspace-modal";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { useJoin } from "@/features/workspaces/api/use-join";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

export default function Home() {
  const default_workspace_id = process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID;
  const default_workspace_joincode = process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_JOINCODE;

  const router = useRouter();
  const [open, setOpen] = useCreateWorkspaceModal();

  const {data, isLoading} = useGetWorkspaces();
  const { mutate, isPending } = useJoin();

  const workspaceId = useMemo(()=>data?.[0]?._id,[data])

  const handleJoin = (workspaceId:Id<"workspaces">, value: string) => {
    mutate(
      { workspaceId, joinCode: value },
      {
        onSuccess: (id) => {
          router.replace(`/workspace/${id}`);
          toast.success("Workspace Joined");
        },
        onError:() => {
          toast.error("Failed to join workspace")
        }
      }
    );
  };

  const requestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      toast.error("This browser does not support notifications");
      return;
    }

    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        toast.success("Notifications enabled");
      }
    }
  }, []);


  useEffect(()=>{
    requestNotificationPermission();
    if(isLoading || isPending) return;

    if(workspaceId){
      router.replace(`/workspace/${workspaceId}`)
    }
    // else if(!open){
    //   setOpen(true);      
    // }
    else{
      handleJoin(default_workspace_id as Id<"workspaces">, default_workspace_joincode as string);
    }
  },[requestNotificationPermission,workspaceId, isLoading, isPending, open, setOpen, router]);


  return (
    <div className="h-full flex items-center justify-center">
        <Loader className="size-10 animate-spin text-muted foreground" />
      </div>
  );
}