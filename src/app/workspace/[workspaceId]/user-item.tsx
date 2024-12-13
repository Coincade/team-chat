import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


import { Id } from '../../../../convex/_generated/dataModel'
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { UseGetConversation } from '@/features/conversations/api/use-get-conversation';
import { UseGetUnreadCount } from '@/features/unread/api/use-get-unread-count';

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
}

export const UserItem = ({
    id,
    label = "Member",
    image,
    variant,
    otherMemberId
}: UserItemProps) => {
    const workspaceId = useWorkspaceId();
    const avatarFallback = label.charAt(0).toUpperCase();

    const{data: unreadCount, isLoading: unreadCountLoading} = UseGetUnreadCount({workspaceId});
    const {data: conversationId, isLoading: conversationIdLoading} = UseGetConversation({memberId:otherMemberId, workspaceId});

    // const getUnreadCount = (id: Id<"channels"> | Id<"conversations">, type: 'channel' | 'conversation') => {
    //   return unreadCounts?.find(count => 
    //     type === 'channel' 
    //       ? count.channelId === id 
    //       : count.conversationId === id
    //   )?.unreadCount || 0;
    // };

    if(unreadCountLoading || conversationIdLoading) {
      return null;
    }

  return (
    <Button
    variant="transparent"
    className={cn(userItemVariants({variant: variant}))}
    size="sm"
    asChild
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
            {conversationId && (
            <span className=" bg-rose-500 text-white rounded-full px-2 text-center">
              {unreadCount?.unreadCount}
            </span>
          )}
        </Link>

    </Button>
  )
}

