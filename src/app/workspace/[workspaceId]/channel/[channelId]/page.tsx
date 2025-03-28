"use client"

import React, { useEffect } from 'react'

import { UseGetChannel } from '@/features/channels/api/use-get-channel';
import { useGetMessages } from '@/features/messages/api/use-get-messages';

import { useChannelId } from '@/hooks/use-channel-id'

import { Loader, TriangleAlert } from 'lucide-react';

import { Header } from './Header';
import { ChatInput } from './chat-input';
import { MessageList } from '@/components/message-list';
import { useCurrentMember } from '@/features/members/api/use-current-member';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { useMarkAsRead } from '@/features/unread/api/use-mark-as-read';

const ChannelIdPage = () => {
  const channelId = useChannelId();
  const workspaceId = useWorkspaceId(); // Add this
  const { data: currentMember } = useCurrentMember({ workspaceId });

  const {results, status, loadMore} = useGetMessages({channelId});
  const {data: channel, isLoading: channelLoading} = UseGetChannel({id: channelId})
  const {mutate: markAsRead} = useMarkAsRead();

  // console.log("Results: ", results);

  useEffect(() => {
    channelId &&
    markAsRead({
      workspaceId,
      channelId,
    },
  {throwError: false}
  )
  }, [workspaceId, channelId]);
  

  if(channelLoading || status === "LoadingFirstPage") {
    return (
      <div className='h-full flex-1 flex items-center justify-center '>
        <Loader className='animate-spin size-5 text-muted-foreground'/>
      </div>
    )
  }

  if(!channel) {
    return (
      <div className='h-full flex-1 flex flex-col gap-y-2 items-center justify-center '>
        <TriangleAlert className='size-5 text-muted-foreground'/>
        <span className='text-sm text-muted-foreground'>Channel Not Found</span>
      </div>
    )
  }


  return (
    <div className="flex flex-col h-[93%] rounded-2xl bg-white mt-[5px] mb-[20px] mr-[20px]" >
        <Header title={channel.name}
        isCreator={channel.creatorId === currentMember?._id} 
        type={channel.type}
        />
      <MessageList
      channelName={channel.name}
      channelCreationTime={channel._creationTime}
      data={results}
      loadMore={loadMore}
      isLoadingMore={status === "LoadingMore"}
      canLoadMore={status === "CanLoadMore"}
      />
        <ChatInput placeholder={`Message # ${channel.name}`}/>
    </div>
  )
}

export default ChannelIdPage