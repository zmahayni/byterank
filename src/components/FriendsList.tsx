"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useThemeStyles } from "../hooks/useThemeStyles";

type Friend = {
  id: string;
  username: string;
  avatar_url: string | null;
  description: string | null;
};

export default function FriendsList() {
  const { cardStyle, inputStyle, itemStyle, colors, isDark, hoverBg } = useThemeStyles();
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);

  // Fetch friends
  useEffect(() => {
    async function fetchFriends() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('friendships')
          .select('user_id_a, user_id_b, created_at')
          .or(`user_id_a.eq.${user.id},user_id_b.eq.${user.id}`);

        if (error) {
          console.error('Error fetching friendships:', error);
          return;
        }

        if (!data || data.length === 0) {
          setFriends([]);
          setFilteredFriends([]);
          setLoading(false);
          return;
        }

        const friendIds = data.map(friendship =>
          friendship.user_id_a === user.id ? friendship.user_id_b : friendship.user_id_a
        );

        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, description')
          .in('id', friendIds);

        if (profileError) {
          console.error('Error fetching friend profiles:', profileError);
          return;
        }

        setFriends(profiles || []);
        setFilteredFriends(profiles || []);
      } catch (error) {
        console.error('Unexpected error fetching friends:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFriends();
  }, [user, supabase]);

  // Filter friends when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFriends(friends);
      return;
    }

    const results = friends.filter(friend =>
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredFriends(results);
  }, [searchQuery, friends]);

  return (
    <div style={{
      ...cardStyle,
      padding: "1.5rem",
      display: "flex",
      flexDirection: "column",
      height: "100%",
    }}>
      <h3 style={{
        fontSize: "1.125rem",
        fontWeight: 600,
        color: colors.heading,
        marginTop: 0,
        marginBottom: "1rem"
      }}>
        Friends
      </h3>

      {/* Search */}
      <div style={{
        display: "flex",
        gap: "0.5rem",
        marginBottom: "1rem",
      }}>
        <input
          type="text"
          placeholder="Search friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            ...inputStyle,
            flex: 1,
            padding: "0.5rem 0.75rem",
            fontSize: "0.75rem",
          }}
        />
      </div>

      {/* Friends List */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        overflowY: "auto",
        flex: 1,
        minHeight: 0,
      }}>
        {loading ? (
          <div style={{ color: colors.muted, fontSize: "0.875rem", textAlign: "center", padding: "1rem" }}>
            Loading friends...
          </div>
        ) : filteredFriends.length === 0 ? (
          <div style={{ color: colors.muted, fontSize: "0.875rem", textAlign: "center", padding: "1rem" }}>
            {searchQuery ? "No friends match your search" : "No friends yet"}
          </div>
        ) : (
          filteredFriends.map((friend) => (
            <Link
              key={friend.id}
              href={`/profile/${friend.id}`}
              style={{
                ...itemStyle,
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                transition: "background 0.2s",
                cursor: "pointer",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = hoverBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = itemStyle.background as string;
              }}
            >
              {friend.avatar_url ? (
                <img
                  src={friend.avatar_url}
                  alt={friend.username}
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "50%",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  borderRadius: "50%",
                  background: "linear-gradient(to bottom right, #3b82f6, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  flexShrink: 0,
                }}>
                  {friend.username.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: "0.875rem",
                  color: colors.heading,
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {friend.username}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
