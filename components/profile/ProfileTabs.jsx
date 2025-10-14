"use client";
import { useState } from "react";
import { Grid, Bookmark, Users } from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import Image from "next/image";
import Link from "next/link";

export default function ProfileTabs({ isOwnProfile, currentUserId, posts, savedPosts, friends }) {
    const [activeTab, setActiveTab] = useState('posts');
    const tabs = [
    { id: "posts", label: "Posts", icon: Grid, count: posts.length },
    ...(isOwnProfile
      ? [{ id: "saved", label: "Guardados", icon: Bookmark, count: savedPosts.length }]
      : []),
    { id: "friends", label: "Amigos", icon: Users, count: friends.length },
  ];

  return(
    <div className="space-y-4">
        {/* Tabs Navigation */}
      <div className="bg-card border border-border rounded-2xl p-2">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                  font-medium smooth-transition
                  ${
                    isActive
                      ? "bg-ocean-secondary text-white"
                      : "text-muted-foreground hover:bg-muted"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="text-sm">({tab.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "posts" && (
          <PostsGrid posts={posts} currentUserId={currentUserId} />
        )}

        {activeTab === "saved" && isOwnProfile && (
          <PostsGrid posts={savedPosts} currentUserId={currentUserId} />
        )}

        {activeTab === "friends" && <FriendsList friends={friends} />}
      </div>
    </div>
  );
}

// Componente para mostrar los posts en grid
function PostsGrid({ posts, currentUserId }) {
  if (posts.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 text-center">
        <div className="max-w-sm mx-auto space-y-3">
          <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
            <Grid className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            No hay posts todavía
          </h3>
          <p className="text-muted-foreground">
            Cuando se publiquen posts, aparecerán aquí.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}

// Componente para mostrar la lista de amigos
function FriendsList({ friends }) {
  if (friends.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 text-center">
        <div className="max-w-sm mx-auto space-y-3">
          <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
            <Users className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            No hay amigos todavía
          </h3>
          <p className="text-muted-foreground">
            Los amigos aparecerán aquí cuando se acepten solicitudes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl divide-y divide-border">
      {friends.map((friend) => (
        <Link
          key={friend.id}
          href={`/profile/${friend.username}`}
          className="flex items-center gap-4 p-4 hover:bg-muted smooth-transition"
        >
          {/* Avatar del amigo */}
          <div className="relative w-14 h-14 rounded-full overflow-hidden bg-muted flex-shrink-0">
            {friend.avatar_url ? (
              <Image
                src={friend.avatar_url}
                alt={friend.full_name || friend.username}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-ocean-light text-ocean-primary text-xl font-bold">
                {(friend.full_name?.[0] || friend.username[0]).toUpperCase()}
              </div>
            )}
          </div>

          {/* Info del amigo */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground truncate">
              {friend.full_name || friend.username}
            </h4>
            <p className="text-sm text-muted-foreground truncate">
              @{friend.username}
            </p>
          </div>

          {/* Indicador de ir al perfil */}
          <div className="text-muted-foreground">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  );
}