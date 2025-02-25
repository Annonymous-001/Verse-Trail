"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";
import { BACKEND_URL } from "@/app/config";


export default function Appbar() {
  const [user, setUser] = useState<{ name?: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/user/me`, {
          withCredentials: true, // ✅ Ensures cookies are sent
        });
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user");
      }
    };

    fetchUser();
  }, []);

  const avatarFallback = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <nav className="flex items-center justify-between bg-background border-b-2 mb-6 pb-3 pt-0">
      <div className="flex items-center space-x-4">
        <span className="text-xl font-bold">Verse Trail</span>
      </div>

      <div className="flex items-center space-x-4">
        <Button>
          <Link href="/publish" prefetch={false}>
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

        <Avatar>
          <AvatarImage src="/placeholder.svg?height=32&width=32" alt={user?.name || "User"} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
      </div>
    </nav>
  );
}
