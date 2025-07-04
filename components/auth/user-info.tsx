"use client";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

export function UserInfo() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Avatar className="w-8 h-8">
        <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
        <AvatarFallback>
          {session.user?.name ? (
            session.user.name.split(" ").map(n => n[0]).join("").toUpperCase()
          ) : (
            <User className="w-4 h-4" />
          )}
        </AvatarFallback>
      </Avatar>
      <div className="text-sm">
        <p className="font-medium">{session.user?.name}</p>
        <p className="text-gray-500 text-xs">{session.user?.email}</p>
      </div>
    </div>
  );
} 