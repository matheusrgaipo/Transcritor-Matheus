"use client";
import { useSupabase } from "@/hooks/use-supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

export function UserInfo() {
  const { user, loading } = useSupabase();

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Avatar className="w-8 h-8">
        <AvatarImage src={user.user_metadata?.avatar_url || ""} alt={user.user_metadata?.full_name || ""} />
        <AvatarFallback>
          {user.user_metadata?.full_name ? (
            user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
          ) : (
            <User className="w-4 h-4" />
          )}
        </AvatarFallback>
      </Avatar>
      <div className="text-sm">
        <p className="font-medium">{user.user_metadata?.full_name}</p>
        <p className="text-gray-500 text-xs">{user.email}</p>
      </div>
    </div>
  );
} 