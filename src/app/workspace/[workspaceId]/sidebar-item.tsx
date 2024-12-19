import { Button } from '@/components/ui/button';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect } from 'react'
import { IconType } from 'react-icons/lib';

import { cva, type VariantProps} from "class-variance-authority";
import { cn } from '@/lib/utils';
import { useGetUnreadCounts } from '@/features/unread/api/use-get-unread-counts';
import { Id } from '../../../../convex/_generated/dataModel';

const sidebarItemVariants = cva(
    "flex items-center gap-1.5 justify-start font-normal h-7 px-[18px] text-sm overflow-hidden",{
        variants:{
            variant:{
                default: "text-[#f9edffcc]",
                active: "text-[#481349] bg-white/90 hover:bg-white/90",

            }
        },
        defaultVariants:{
            variant:"default"
        }
    }
)

interface SidebarItemProps{
    label: string;
    id:string;
    icon: LucideIcon | IconType;
    variant?: VariantProps<typeof sidebarItemVariants>["variant"];
    channelId: Id<"channels">;
    onClick: () => void;
}

export const SidebarItem = ({
    label,
    id,
    icon: Icon,
    variant,
    channelId,
    onClick
}: SidebarItemProps) => {

    const workspaceId = useWorkspaceId();
    const{data: unreadCounts, isLoading: unreadCountLoading} = useGetUnreadCounts({workspaceId});

    const getUnreadCount = (id: Id<"channels"> | Id<"conversations">, type: 'channel' | 'conversation') => {
      return unreadCounts?.find(count => 
        type === 'channel' 
          ? count.channelId === id 
          : count.conversationId === id
      )?.unreadCount || 0;
    };

    useEffect(() => {
      const unreadCount = getUnreadCount(channelId, 'channel');
      
      if (unreadCount > 0) {
          if (Notification.permission !== 'granted') {
              Notification.requestPermission();
          }
          
          if (Notification.permission === 'granted') {
              const notification = new Notification('New Message', {
                  body: `You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''} in #${label}`,
                  icon: '/your-app-icon.png',
                  tag: `channel-${channelId}`, // Prevents duplicate notifications
              });
  
              // Add click handler to the notification
              notification.onclick = (event) => {
                  event.preventDefault();
                  // Focus on the window if minimized
                  window.focus();
                  // Navigate to the channel
                  window.location.href = `/workspace/${workspaceId}/channel/${id}`;
                  // Close the notification
                  notification.close();
              };
          }
      }
  }, [unreadCounts, channelId, label, workspaceId, id]);

  return (
    <Button
    variant="transparent"
    size="sm"
    className={cn(sidebarItemVariants({variant: variant}))}
    asChild
    onClick={() =>{onClick()}
    }
    >
        <Link href={`/workspace/${workspaceId}/channel/${id}`} className='flex justify-between'>
        <div className='flex items-center'>
            <Icon className='size-3.5 mr-1 shrink-0'/>
            <span className='text-sm truncate'>{label}</span>
            </div>
            {getUnreadCount(channelId, 'channel') > 0 && (
            <span className=" bg-rose-500 text-white rounded-full px-2 text-center">
              {getUnreadCount(channelId, 'channel')}
            </span>
          )}
        </Link>
    </Button>
  )
}