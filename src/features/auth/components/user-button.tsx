"use client";

import { Loader, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "../api/use-current-user";
import { useAuthActions } from "@convex-dev/auth/react";

export const UserButton = () => {
    const {signOut} = useAuthActions();
    const {data, isLoading} = useCurrentUser();

    if(isLoading){
        return <Loader className="size-4 animate-spin text-muted-foreground"/>
    }

    if(!data){
        return null;
    }

    const {image, name} = data;
    console.log(data);
    
    const avatarFallback = name!.charAt(0).toUpperCase()
    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="outline-none relative rounded-full ">
                <Avatar className="rounded-full size-10 hover:opacity-75 transition">
                    <AvatarImage alt={name} src={image} className="rounded-full"/>
                    <AvatarFallback className="rounded-full bg-sky-600 text-white">
                        {avatarFallback}
                    </AvatarFallback>
                </Avatar>

            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" side="right" className="w-60">
                <DropdownMenuItem className="h-10"
                onClick={async() => {
                    await signOut();
                    window.location.reload();
                }} >
                    <LogOut className="size-4 mr-2"/>
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
