import { useRef, useState } from "react"
import { toast } from "sonner";

import { useCreateMessage } from "@/features/messages/api/use-create-message";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";

import { useWorkspaceId } from "@/hooks/use-workspace-id";

import { Id } from "../../../../../../convex/_generated/dataModel";

import Quill from "quill"
import dynamic from "next/dynamic"
import { useIncrementUnreadCounter } from "@/features/unread/api/use-increment-unread-counter";

const Editor = dynamic(() => import("@/components/editor"), {ssr: false})

interface ChatInputProps{
    placeholder: string;
    conversationId: Id<"conversations">
}
type CreateMessageValues = {
    conversationId: Id<"conversations">;
    workspaceId: Id<"workspaces">;
    body: string;
    image?: Id<"_storage"> | undefined;
}

export const ChatInput = ({placeholder, conversationId}: ChatInputProps) =>{
    const [editorKey, setEditorKey] = useState(0)
    const [isPending, setIsPending] = useState(false)

    const editorRef = useRef<Quill | null>(null);

    const workspaceId = useWorkspaceId();

    const {mutate: createMessage} = useCreateMessage();
    const {mutate: generateUploadUrl} = useGenerateUploadUrl();
    const {mutate: incrementUnreadCount} = useIncrementUnreadCounter();

    const handleSubmit = async({
        body,
        image
    }: {
        body: string;
        image: File | null;
    }) => {
        try {
            setIsPending(true)
            editorRef?.current?.enable(false);

            const values : CreateMessageValues = {
                conversationId,
                workspaceId,
                body,
                image: undefined
            }

            if(image) {
                const url = await generateUploadUrl({}, {throwError: true});

                if(!url){
                    throw new Error("Url not Found")
                }

                const result = await fetch(url, {
                    method: 'POST',
                    headers:{"Content-Type": image.type},
                    body:image
                })

                if(!result.ok){
                    throw new Error("Failed to upload image")
                }

                const {storageId} = await result.json();

                values.image = storageId;
            }

        await createMessage(values, {throwError: true});
        await incrementUnreadCount({workspaceId, conversationId}, {throwError: true});

        setEditorKey((prevKey) => prevKey + 1);
    }
    catch(error){
        toast.error("Failed to send message!")
        console.log("Error while sending message ==> ", error);
        
    }
    finally{
        setIsPending(false);
        editorRef?.current?.enable(false);
    }

    }

    return (
        <div className="px-5 w-full bg-white rounded-b-3xl">
            <Editor 
            key={editorKey}
            placeholder={placeholder}
            onSubmit={handleSubmit}
            disabled={isPending}
            innerRef={editorRef}
            />
        </div>
    )
}