import React from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, MessageCircle } from 'lucide-react'
import { SignedIn, SignedOut, SignInButton, SignOutButton, UserAvatar, UserButton } from '@clerk/clerk-react'
import SignInOAuth from './SignInOAuth'
import { useAuthStore } from "../../store/useAuthStore";
import AddSongDialog from "@/pages/admin/components/AddSongDialog";
import AddAlbumDialog from "@/pages/admin/components/AddAlbumDialog";
import { buttonVariants } from './button-variants'
import {cn} from "@/lib/utils"


const Topbar = () => {
    // const isAdmin = false;
    const { isAdmin } = useAuthStore()
    // console.log(isAdmin);
    return (
        <div className='w-full flex justify-between items-center px-4 py-4 sticky top-0 bg-zinc-900/75 backdrop-blur-md z-10'>
            <div className='flex gap-2 items-center'>
              <img src="./spotify.png" alt="" className="w-8"/>
            </div>
            <div className='flex items-center gap-2'>
                <SignedIn>
                    <Link to={'/dashboard'} className={cn(
                        buttonVariants({variant:"outline"})
                    )}>
                        <LayoutDashboard className='size-4 mr-2' />
                        Dashboard
                    </Link>
                    <Link to={"/chat"} className={cn(buttonVariants({ variant: "outline" }))}>
                        <MessageCircle className="size-4 mr-2" />
                        Chat
                    </Link>
                </SignedIn>
                {/* <SignedIn>
                    <SignOutButton />
                </SignedIn> */}

                <SignedOut>
                    <SignInOAuth />
                </SignedOut>
                <UserButton />
            </div>
        </div>
    )
}

export default Topbar