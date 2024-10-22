import React from "react";
import { Avatar,AvatarImage,AvatarFallback } from "./ui/avatar";
import {ExitIcon} from "@radix-ui/react-icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "./ui/dropdown-menu"

function Navbar({user}) {
    const handleLogout = ()=> {
      window.open(
        `https://room-booking-app-backend.onrender.com/auth/logout`,
        "_self"
      );
    }
    return (
      <nav className="w-full bg-white text-gray-900 border-b border-gray-300 px-12 py-4 flex justify-between items-center">
        <div className="h-16 w-48"><img src="https://www.bits-pilani.ac.in/wp-content/uploads/bits-k-k-birla-goa-campus-color-2.png" alt="Logo" /></div>
        <DropdownMenu>

          <DropdownMenuTrigger>
          <Avatar>
            <AvatarImage src={user.picture} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar> 
          </DropdownMenuTrigger>

          <DropdownMenuContent>

          <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>{user.email}</DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}><ExitIcon/> Logout</DropdownMenuItem>

          </DropdownMenuContent>

        </DropdownMenu>

      </nav>
    );
}
export default Navbar