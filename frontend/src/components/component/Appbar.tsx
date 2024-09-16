import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Appbar() {

  return (
    <nav className="flex items-center justify-between  bg-background border-b-2  mb-6  pb-3 pt-0 ">
      <div className="flex items-center space-x-4">
        {/* Logo */}
        
        <span className="text-xl font-bold">Verse Trail</span>
      </div>

      <div className="flex items-center space-x-4">
        {/* New Button */}
        <Button>
        <Link href="/publish"  prefetch={false}>
          New
          </Link>
          <svg
            className="ml-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </Button>

        {/* Avatar */}
        <Avatar>
          <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@user" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>
    </nav>
  )
}