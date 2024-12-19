import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


import { Id } from '../../../../convex/_generated/dataModel'
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { UseGetConversation } from '@/features/conversations/api/use-get-conversation';
import { UseGetUnreadCount } from '@/features/unread/api/use-get-unread-count';
import { useEffect } from 'react';

const userItemVariants = cva(
    "flex items-center gap-1.5 justify-start font-normal h-7 px-4 text-sm overflow-hidden",{
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

interface UserItemProps{
    id:Id<"members">;
    label?: string;
    image?: string;
    variant?: VariantProps<typeof userItemVariants>["variant"];
    otherMemberId:Id<"members">
    onClick: () => void;
}

export const UserItem = ({
    id,
    label = "Member",
    image,
    variant,
    otherMemberId,
    onClick
}: UserItemProps) => {
    const workspaceId = useWorkspaceId();
    const avatarFallback = label.charAt(0).toUpperCase();

    const {data: conversationId, isLoading: conversationIdLoading} = UseGetConversation({memberId:otherMemberId, workspaceId});
    const {
      data: unreadCount, 
      isLoading: unreadCountLoading
    } = UseGetUnreadCount({
      workspaceId, 
      conversationId: conversationId ?? undefined, 
    });
    
    useEffect(() => {
      if (unreadCount?.unreadCount && unreadCount.unreadCount > 0) {
          if (Notification.permission !== 'granted') {
              Notification.requestPermission();
          }
          
          if (Notification.permission === 'granted') {
              const notification = new Notification('New Direct Message', {
                  body: `You have ${unreadCount.unreadCount} unread message${unreadCount.unreadCount > 1 ? 's' : ''} from ${label}`,
                  icon: image || '/your-app-icon.png', // Uses user's avatar if available
                  tag: `conversation-${conversationId}`, // Prevents duplicate notifications
              });
  
              notification.onclick = (event) => {
                  event.preventDefault();
                  window.focus();
                  window.location.href = `/workspace/${workspaceId}/member/${id}`;
                  notification.close();
              };
          }
      }
    }, [unreadCount, conversationId, label, workspaceId, id, image]);

    if(unreadCountLoading || conversationIdLoading) {
      return null;
    }

  return (
    <Button
    variant="transparent"
    className={cn(userItemVariants({variant: variant}))}
    size="sm"
    asChild
    onClick={() => onClick()}
    >
        <Link href={`/workspace/${workspaceId}/member/${id}`} className='flex justify-between'>
        <div className='flex'>
            <Avatar className='size-5 rounded-md mr-1'>
                <AvatarImage className='rounded-md' src={image}/>
                <AvatarFallback className='rounded-md bg-sky-500 text-white text-xs'>
                    {avatarFallback}
                </AvatarFallback>
            </Avatar>
            <span className='text-sm truncate'>{label}</span>
            </div>
            {conversationId && unreadCount &&(
            <span className=" bg-rose-500 text-white rounded-full px-2 text-center">
              {unreadCount.unreadCount > 0 && unreadCount.unreadCount}
            </span>
          )}
        </Link>

    </Button>
  )
}

