"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import PageLayout from "../../components/PageLayout";
import Card from "../../components/Card";
import FriendsList from "../../components/FriendsList";
import MyTeamsList from "../../components/MyTeamsList";
import { useThemeStyles } from "../../hooks/useThemeStyles";

type Team = {
  id: string;
  name: string;
  avatar_url: string | null;
  member_count: number;
  user_role?: string;
  user_rank?: number;
  is_member?: boolean;
};

type SearchTeam = {
  type: 'team';
  id: string;
  name: string;
  avatar_url: string | null;
  member_count: number;
  is_member: boolean;
  access_policy: string;
  has_requested?: boolean;
};

type SearchPerson = {
  type: 'person';
  id: string;
  username: string;
  avatar_url: string | null;
  description: string | null;
};

type SearchResult = SearchTeam | SearchPerson;

export default function CommunityPage() {
  const styles = useThemeStyles();
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  
  // State for teams data
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Fetch user's teams
  useEffect(() => {
    async function fetchMyTeams() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get teams where user is a member (with group details)
        const { data: memberData, error: memberError } = await supabase
          .from('group_members')
          .select(`
            group_id,
            role,
            total_commits,
            groups (
              id,
              name,
              avatar_url
            )
          `)
          .eq('user_id', user.id);

        if (memberError) {
          console.error('Error fetching teams:', memberError);
          return;
        }

        if (!memberData || memberData.length === 0) {
          setMyTeams([]);
          setLoading(false);
          return;
        }

        const groupIds = memberData.map((m: any) => m.group_id);

        // Batch fetch: member counts and user ranks in parallel
        const [memberCountsResult, leaderboardResult] = await Promise.all([
          // Get member counts for all user's groups using the view
          supabase
            .from('v_group_member_counts')
            .select('group_id, member_count')
            .in('group_id', groupIds),
          // Get user's rank in each group from the leaderboard view
          supabase
            .from('v_group_leaderboard_7d')
            .select('group_id, user_id, rank_commits')
            .in('group_id', groupIds)
            .eq('user_id', user.id)
        ]);

        // Create lookup maps for O(1) access
        const memberCountMap = new Map<string, number>();
        (memberCountsResult.data || []).forEach((row: any) => {
          memberCountMap.set(row.group_id, row.member_count || 0);
        });

        const rankMap = new Map<string, number>();
        (leaderboardResult.data || []).forEach((row: any) => {
          rankMap.set(row.group_id, row.rank_commits || 0);
        });

        // Build teams array with all data
        const teamsWithDetails = memberData.map((membership: any) => ({
          id: membership.groups.id,
          name: membership.groups.name,
          avatar_url: membership.groups.avatar_url,
          member_count: memberCountMap.get(membership.group_id) || 0,
          user_role: membership.role,
          user_rank: rankMap.get(membership.group_id) || 1,
        }));

        setMyTeams(teamsWithDetails);
      } catch (error) {
        console.error('Unexpected error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMyTeams();
  }, [user, supabase]);
  
  // Handle unified search for both people and teams
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    try {
      // Search for teams and people in parallel
      const [teamsResponse, peopleResponse] = await Promise.all([
        supabase
          .from('groups')
          .select('id, name, avatar_url, access_policy')
          .ilike('name', `%${searchQuery}%`)
          .limit(10),
        supabase
          .from('profiles')
          .select('id, username, avatar_url, description')
          .ilike('username', `%${searchQuery}%`)
          .limit(10)
      ]);

      if (teamsResponse.error) {
        console.error('Error searching teams:', teamsResponse.error);
      }
      if (peopleResponse.error) {
        console.error('Error searching people:', peopleResponse.error);
      }

      const teamsData = teamsResponse.data || [];
      const peopleData = peopleResponse.data || [];

      // Process teams with batched queries
      let teamsWithDetails: SearchTeam[] = [];
      if (teamsData.length > 0) {
        const teamIds = teamsData.map(t => t.id);

        // Batch fetch all team-related data in parallel
        const [memberCountsResult, userMembershipsResult, pendingRequestsResult] = await Promise.all([
          // Get member counts for all searched teams
          supabase
            .from('v_group_member_counts')
            .select('group_id, member_count')
            .in('group_id', teamIds),
          // Check which teams user is already a member of
          user ? supabase
            .from('group_members')
            .select('group_id')
            .in('group_id', teamIds)
            .eq('user_id', user.id) : Promise.resolve({ data: [] }),
          // Check which teams user has pending requests for
          user ? supabase
            .from('group_join_requests')
            .select('group_id')
            .in('group_id', teamIds)
            .eq('requester_id', user.id)
            .eq('status', 'pending') : Promise.resolve({ data: [] })
        ]);

        // Create lookup sets for O(1) access
        const memberCountMap = new Map<string, number>();
        (memberCountsResult.data || []).forEach((row: any) => {
          memberCountMap.set(row.group_id, row.member_count || 0);
        });

        const userMembershipSet = new Set(
          (userMembershipsResult.data || []).map((m: any) => m.group_id)
        );

        const pendingRequestSet = new Set(
          (pendingRequestsResult.data || []).map((r: any) => r.group_id)
        );

        // Build teams array with all data
        teamsWithDetails = teamsData.map(team => ({
          type: 'team' as const,
          id: team.id,
          name: team.name,
          avatar_url: team.avatar_url,
          member_count: memberCountMap.get(team.id) || 0,
          is_member: userMembershipSet.has(team.id),
          access_policy: team.access_policy,
          has_requested: pendingRequestSet.has(team.id),
        }));
      }

      // Add type to people results
      const peopleWithType: SearchPerson[] = peopleData.map(person => ({
        type: 'person',
        id: person.id,
        username: person.username,
        avatar_url: person.avatar_url,
        description: person.description,
      }));

      // Combine and sort alphabetically by name/username
      const combined = [...teamsWithDetails, ...peopleWithType].sort((a, b) => {
        const nameA = (a.type === 'team' ? a.name : a.username).toLowerCase();
        const nameB = (b.type === 'team' ? b.name : b.username).toLowerCase();
        return nameA.localeCompare(nameB);
      });

      setSearchResults(combined);
    } catch (error) {
      console.error('Unexpected error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };
  
  // Destructure commonly used styles
  const { buttonStyle, primaryButtonStyle, itemStyle: teamItemStyle, colors, isDark } = styles;

  // Inbox state
  const [hasUnreadInbox, setHasUnreadInbox] = useState(false);

  // Debounced search
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      handleSearch();
    }
  }, [debouncedSearchQuery]);

  // Handle join team (open teams only)
  const handleJoinTeam = async (teamId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: teamId,
          user_id: user.id,
          role: 'member',
          total_commits: 0,
        });

      if (error) {
        console.error('Error joining team:', error);
        return;
      }

      // Update search results to show as member
      setSearchResults(searchResults.map(result => 
        result.type === 'team' && result.id === teamId 
          ? { ...result, is_member: true }
          : result
      ));

      // Refresh teams list
      const { data: memberData } = await supabase
        .from('group_members')
        .select(`
          group_id,
          role,
          total_commits,
          groups (
            id,
            name,
            avatar_url
          )
        `)
        .eq('user_id', user.id);

      if (memberData) {
        const teamsWithDetails = await Promise.all(
          memberData.map(async (membership: any) => {
            const groupId = membership.group_id;
            const { count } = await supabase
              .from('group_members')
              .select('*', { count: 'exact', head: true })
              .eq('group_id', groupId);
            const { data: members } = await supabase
              .from('group_members')
              .select('user_id, total_commits')
              .eq('group_id', groupId)
              .order('total_commits', { ascending: false });
            const userRank = members?.findIndex(m => m.user_id === user.id) ?? -1;
            return {
              id: membership.groups.id,
              name: membership.groups.name,
              avatar_url: membership.groups.avatar_url,
              member_count: count || 0,
              user_role: membership.role,
              user_rank: userRank + 1,
            };
          })
        );
        setMyTeams(teamsWithDetails);
      }
    } catch (error) {
      console.error('Unexpected error joining team:', error);
    }
  };

  // Handle request to join (closed teams)
  const handleRequestToJoin = async (teamId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('group_join_requests')
        .insert({
          group_id: teamId,
          requester_id: user.id,
          status: 'pending',
        });

      if (error) {
        console.error('Error requesting to join:', error);
        return;
      }

      // Update search results to show request sent
      setSearchResults(searchResults.map(result => 
        result.type === 'team' && result.id === teamId 
          ? { ...result, has_requested: true }
          : result
      ));
    } catch (error) {
      console.error('Unexpected error requesting to join:', error);
    }
  };

  // Check for unread inbox items
  useEffect(() => {
    async function checkUnreadInbox() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('friend_requests')
          .select('id', { count: 'exact', head: true })
          .eq('recipient_id', user.id)
          .eq('status', 'pending');

        if (error) {
          console.error('Error checking unread inbox:', error);
          return;
        }

        setHasUnreadInbox(data && data.length > 0);
      } catch (error) {
        console.error('Unexpected error checking unread inbox:', error);
      }
    }

    checkUnreadInbox();
  }, [user]);

  return (
    <PageLayout>
      {/* Page Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "var(--margin-bottom)",
      }}>
        <h1 className="gradient-text" style={{
          fontSize: "2.5rem",
          fontWeight: "bold",
        }}>
          Community
        </h1>
        <Link
          href="/inbox"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "2.5rem",
            height: "2.5rem",
            borderRadius: "0.5rem",
            background: isDark ? "rgba(30, 41, 59, 0.4)" : "rgba(241, 245, 249, 0.7)",
            border: isDark ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
            cursor: "pointer",
            transition: "all 0.2s ease",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDark ? "rgba(30, 41, 59, 0.6)" : "rgba(241, 245, 249, 0.9)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isDark ? "rgba(30, 41, 59, 0.4)" : "rgba(241, 245, 249, 0.7)";
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: isDark ? "#e2e8f0" : "#1e293b" }}>
            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
          </svg>
          {hasUnreadInbox && (
            <div style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#ef4444",
              border: "2px solid " + (isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)"),
            }} />
          )}
        </Link>
      </div>
      
      {/* Main Layout with Content and Friends List */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 280px",
        gap: "2rem",
        width: "100%",
        alignItems: "start",
      }}>
        {/* Main Content */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--gap-large)",
        }}>
        {/* Search Section */}
        <Card title="Find Teams & People">
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}>
            <div style={{
              display: "flex",
              gap: "0.5rem",
              width: "100%",
            }}>
              <input 
                type="text" 
                placeholder="Search teams or people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                style={{
                  flex: 1,
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  border: isDark ? "1px solid rgba(51, 65, 85, 0.5)" : "1px solid rgba(203, 213, 225, 0.5)",
                  background: isDark ? "rgba(15, 23, 42, 0.4)" : "rgba(248, 250, 252, 0.8)",
                  color: isDark ? "white" : "hsl(220, 25%, 10%)",
                  fontSize: "0.875rem",
                }}
              />
              <button 
                onClick={handleSearch}
                style={primaryButtonStyle}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                Search
              </button>
            </div>
          </div>
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div style={{
              marginTop: "1.5rem",
              borderTop: isDark ? "1px solid rgba(51, 65, 85, 0.5)" : "1px solid rgba(203, 213, 225, 0.5)",
              paddingTop: "1.5rem",
              background: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
              borderRadius: "1rem",
              padding: "1.5rem",
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: colors.heading }}>
                  Results for "{searchQuery}"
                </h3>
                <button 
                  onClick={clearSearch}
                  style={{
                    color: colors.muted,
                    fontSize: "0.875rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Clear
                </button>
              </div>
              
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}>
                {searchResults.map((result) => (
                  result.type === 'team' ? (
                    // Team result
                    <div key={result.id} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.75rem",
                      ...teamItemStyle,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {result.avatar_url ? (
                          <img 
                            src={result.avatar_url} 
                            alt={result.name}
                            style={{
                              width: "2.5rem",
                              height: "2.5rem",
                              borderRadius: "0.375rem",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div style={{
                            width: "2.5rem",
                            height: "2.5rem",
                            borderRadius: "0.375rem",
                            background: "linear-gradient(to bottom right, #3b82f6, #8b5cf6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                          }}>
                            {result.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                          <h4 style={{ fontWeight: 600, color: colors.heading, fontSize: "0.9375rem" }}>{result.name}</h4>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.375rem",
                            backgroundColor: "rgba(51, 65, 85, 0.15)",
                            color: colors.muted,
                            padding: "0.25rem 0.5rem",
                            borderRadius: "0.375rem",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                          }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <span>{result.member_count} members</span>
                          </div>
                        </div>
                      </div>
                      {result.is_member ? (
                        <Link 
                          href={`/teams/${result.id}`}
                          style={{
                            ...buttonStyle,
                            textDecoration: "none",
                          }}
                        >
                          View Team
                        </Link>
                      ) : result.has_requested ? (
                        <div style={{
                          ...buttonStyle,
                          background: isDark ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.1)",
                          color: "#3b82f6",
                          cursor: "default",
                        }}>
                          Request Sent
                        </div>
                      ) : (
                        <button 
                          onClick={() => result.access_policy === 'open' ? handleJoinTeam(result.id) : handleRequestToJoin(result.id)}
                          style={primaryButtonStyle}
                        >
                          {result.access_policy === 'open' ? 'Join' : 'Request to Join'}
                        </button>
                      )}
                    </div>
                  ) : (
                    // Person result
                    <div key={result.id} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.75rem",
                      ...teamItemStyle,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                        {result.avatar_url ? (
                          <img 
                            src={result.avatar_url} 
                            alt={result.username}
                            style={{
                              width: "2.5rem",
                              height: "2.5rem",
                              borderRadius: "50%",
                              objectFit: "cover",
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
                          }}>
                            {result.username.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontWeight: 600, color: colors.heading, fontSize: "0.9375rem" }}>{result.username}</h4>
                          {result.description && (
                            <p style={{ 
                              fontSize: "0.75rem", 
                              color: colors.muted,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap"
                            }}>
                              {result.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {result.id === user?.id ? (
                        <div style={{
                          color: colors.muted,
                          fontSize: "0.875rem",
                          padding: "0.5rem 1rem",
                          fontStyle: "italic",
                        }}>
                          You
                        </div>
                      ) : (
                        <Link
                          href={`/profile/${result.id}`}
                          style={{
                            ...buttonStyle,
                            textDecoration: "none",
                          }}
                        >
                          View Profile
                        </Link>
                      )}
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
          
          {isSearching && (
            <div style={{ textAlign: "center", padding: "1rem", color: colors.muted }}>
              Searching...
            </div>
          )}
        </Card>
        
        {/* Teams Section */}
        <MyTeamsList teams={myTeams} loading={loading} />
        </div>
        
        {/* Right Column - Online Friends */}
        <div style={{
          position: "sticky",
          top: "2rem",
        }}>
          <FriendsList />
        </div>
      </div>
    </PageLayout>
  );
}
