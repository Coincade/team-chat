import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { FaChevronDown } from "react-icons/fa";

interface HeaderProps {
  memberName?: string;
  memberImage?: string;
  onClick?: () => void;
}

export const Header = ({ 
  memberName = "Member",
  memberImage,
  onClick
 }: HeaderProps) => {
  const avatarFallback = memberName.charAt(0).toUpperCase();

  return (
    <div className=" bg-[#0369a1] border-b  h-[49px] flex items-center px-4 overflow-hidden rounded-t-2xl text-white">
      <Button variant="ghost" className="text-lg font-semibold px-2 overflow-hidden w-auto "
      size="sm"
      onClick={onClick}
      >
        <Avatar className="size-6 mr-2 ">
          <AvatarImage src={memberImage}/>
          <AvatarFallback className="flex h-full w-full items-center justify-center rounded-md bg-sky-500 text-white text-sm">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        <span className="truncate">{memberName}</span>
        <FaChevronDown className="size-2.5 ml-2"/>
      </Button>
    </div>
  );
};
