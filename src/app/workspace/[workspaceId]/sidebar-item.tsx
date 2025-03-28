import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import React, { useEffect } from "react";
import { IconType } from "react-icons/lib";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useGetUnreadCounts } from "@/features/unread/api/use-get-unread-counts";
import { Id } from "../../../../convex/_generated/dataModel";

const sidebarItemVariants = cva(
  "flex items-center gap-1.5 justify-start font-normal h-7 px-[8px] pt-[7px] pb-[7px] text-sm overflow-hidden",
  {
    variants: {
      variant: {
        default: "text-[#f9edffcc] hover:bg-white/30 ",
        active: "text-white bg-[#308BBF] hover:bg-[#308BBF]",
        clicked: "text-white bg-[#66AFCC]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface SidebarItemProps {
  label: string;
  id: string;
  // icon: LucideIcon | IconType;
  image?: string;
  variant?: VariantProps<typeof sidebarItemVariants>["variant"];
  channelId: Id<"channels">;
  onClick: () => void;
}

export const SidebarItem = ({
  label,
  id,
  // icon: Icon,
  image,
  variant,
  channelId,
  onClick,
}: SidebarItemProps) => {
  const workspaceId = useWorkspaceId();
  const avatarFallback = label.charAt(0).toUpperCase();
  const { data: unreadCounts, isLoading: unreadCountLoading } =
    useGetUnreadCounts({ workspaceId });

  const getUnreadCount = (
    id: Id<"channels"> | Id<"conversations">,
    type: "channel" | "conversation"
  ) => {
    return (
      unreadCounts?.find((count) =>
        type === "channel"
          ? count.channelId === id
          : count.conversationId === id
      )?.unreadCount || 0
    );
  };

  useEffect(() => {
    const unreadCount = getUnreadCount(channelId, "channel");
    const showNotification = () => {
      const notification = new Notification("New Message", {
        body: `You have ${unreadCount} unread message${unreadCount > 1 ? "s" : ""} in #${label}`,
        icon: "/logo.png",
        tag: `channel-${channelId}`, // Prevents duplicate notifications
        silent: true,
      });

      notification.onclick = (event) => {
        event.preventDefault();
        // Focus on the window if minimized
        window.focus();
        // Navigate to the channel
        window.location.href = `/workspace/${workspaceId}/channel/${id}`;
        // Close the notification
        notification.close();
      };
    };

    if (unreadCount > 0) {
      if (Notification.permission !== "granted") {
        Notification.requestPermission();
      }

      if (Notification.permission === "granted") {
        const audio = new Audio("/ping.mp3"); // Make sure this path is correct

        // Try to play sound, show notification regardless of sound success
        audio
          .play()
          .catch((error) => console.log("Error playing sound:", error))
          .finally(() => showNotification());
      } else if (Notification.permission !== "denied") {
        // Request permission if not denied
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            showNotification();
          }
        });
      }
    }
  }, [unreadCounts, channelId, label, workspaceId, id]);

  return (
    <Button
      variant="transparent"
      size="sm"
      className={cn(sidebarItemVariants({ variant: variant }))}
      asChild
      onClick={() => {
        onClick();
      }}
    >
      <Link
        href={`/workspace/${workspaceId}/channel/${id}`}
        className="flex justify-between "
      >
        {/* <div className="flex items-center ">
          <Icon className="size-3.5 mr-[8px] shrink-0 " />
          <span className="text-sm truncate">{label}</span>
        </div> */}

        <div className="flex truncate ">
          <div className="relative  mr-[8px] ">
            <Avatar className="size-5 rounded-md mr-1  ">
              <AvatarImage className="rounded-md " src={image} />
              <AvatarFallback className="rounded-md bg-sky-500 text-white text-xs">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          </div>
          <span className="text-sm truncate ">{label}</span>
        </div>

        {getUnreadCount(channelId, "channel") > 0 && (
          <span className="bg-[#bae6fd] text-[#0c4a6e] font-bold rounded-full px-2 text-center">
            {getUnreadCount(channelId, "channel") <= 9
              ? getUnreadCount(channelId, "channel")
              : "9+"}
          </span>
        )}
      </Link>
    </Button>
  );
};
