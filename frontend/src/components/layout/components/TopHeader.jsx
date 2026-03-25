import { Home, LayoutDashboard, Search } from 'lucide-react'
import { SignedIn, SignedOut, SignInButton, SignOutButton, UserAvatar, UserButton } from '@clerk/clerk-react'
import { TiHome } from "react-icons/ti";
import { IoChatbubbleEllipses } from "react-icons/io5";
import { IoIosPeople } from "react-icons/io";
import { useAuthStore } from '@/store/useAuthStore'
import { useState } from 'react';
import { Check, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import { cn } from "@/lib/utils"
import SignInOAuth from '../../ui/SignInOAuth'
import { Button } from '../../ui/button'
import { buttonVariants } from '../../ui/button-variants'
import { Link } from 'react-router-dom';


const TopHeader = () => {
    // const isAdmin = false;
    const { isAdmin } = useAuthStore()
    const [isCopied, setIsCopied] = useState(false);

    const handleInviteFriends = async () => {
        try {
            await navigator.clipboard.writeText(window.location.host);
            setIsCopied(true);
            toast.success("Link copied to clipboard!");
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            toast.error("Failed to copy link");
        }
    }

    return (
        <div className='w-full flex justify-between items-center px-4 pb-0 pt-2 sticky top-0 bg-black backdrop-blur-md z-10'>
            <div className='flex gap-2 items-center'>
                <img src="./spotify.png" alt="" className="w-8" />
            </div>
            <div className='flex items-center gap-2'>

                <Link to={"/"}>
                    <Button variant={""} size={"icon-lg"} className='size-10 bg-zinc-900 hover:bg-zinc-800  rounded-full '>
                        <TiHome className='size-5.5' />
                    </Button>
                </Link>

                <div className=' flex gap-4 w-[400px] border border-zinc-950 px-4 py-2.5 rounded-full bg-zinc-900 '>
                    <Search />
                    <input type="text" className='w-full border-none outline-none ' placeholder='What do you want to play ?' />
                </div>
                {/* <Button variant={""} size={"icon-lg"} className='size-10 bg-zinc-900 hover:bg-zinc-800  rounded-full '>
                        <TiHome className='size-5.5'/>
                </Button> */}
            </div>

            <div className='flex  gap-10'>
                <div className='flex gap-2'>
                    {/* <Button className='rounded-full bg-white text-black hover:bg-zinc-800 hover:text-white transition-all duration-300 ease-in-out cursor-pointer'>
                        Explore More
                    </Button> */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant={isCopied ? "secondary" : "ghost"} 
                                className={cn(
                                    "rounded-full transition-all duration-300",
                                    isCopied && "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                                )}
                                onClick={handleInviteFriends}
                            >
                                {isCopied ? (
                                    <>
                                        <Check className="mr-2 h-4 w-4 animate-in zoom-in duration-300" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Link2 className="mr-2 h-4 w-4" />
                                        Invite Friends
                                    </>
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Invite More Friends</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link to="/chat">
                                <Button variant={"ghost"} size={"icon-lg"} className='size-10   rounded-full '>
                                    <IoIosPeople className='size-5.5' />
                                </Button>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Chat With Friends</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                <div className='flex items-center gap-2'>
                    {
                        isAdmin && (
                            <Link to={'/admin'} className={cn(
                                buttonVariants({ variant: "outline" })
                            )}>
                                <LayoutDashboard />
                                Admin Dashboard
                            </Link>
                        )
                    }
                    {/* <SignedIn>
                    <SignOutButton />
                </SignedIn> */}

                    <SignedOut>
                        <SignInOAuth />
                    </SignedOut>
                    <UserButton />
                </div>
            </div>
        </div>
    )
}

export default TopHeader