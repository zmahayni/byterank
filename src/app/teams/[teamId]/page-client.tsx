"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "../../../components/ThemeProvider";
import { useAuth } from "../../../context/AuthContext";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { notFound } from "next/navigation";
import PageLayout from "../../../components/PageLayout";
import Card from "../../../components/Card";

type TeamMember = {
  id: string;
  username: string;
  avatar_url: string | null;
  role: string;
  total_commits: number;
  rank: number;
};

type Team = {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  owner_id: string;
  member_count: number;
  members: TeamMember[];
};


// This is a client component that receives the teamId as a prop
export default function TeamPageClient({ teamId }: { teamId: string }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'owner' | 'admin' | 'member' | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuId) setOpenMenuId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!user) {
        // Don't set loading to false yet - wait for user to load
        return;
      }

      try {
        console.log('Fetching team with ID:', teamId);
        
        // Fetch team basic info
        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .select('id, name, description, avatar_url, owner_id')
          .eq('id', teamId)
          .single();

        console.log('Group data:', groupData);
        console.log('Group error:', groupError);

        if (groupError || !groupData) {
          console.error('Error fetching team:', groupError);
          setTeam(null);
          setLoading(false);
          return;
        }

        // Check if user is a member and get their role
        const { data: membershipData } = await supabase
          .from('group_members')
          .select('role')
          .eq('group_id', teamId)
          .eq('user_id', user.id)
          .single();

        if (membershipData) {
          setIsMember(true);
          setUserRole(membershipData.role as 'owner' | 'admin' | 'member');
        } else {
          setIsMember(false);
          setUserRole(null);
        }

        // Fetch all members with their stats
        const { data: membersData, error: membersError } = await supabase
          .from('group_members')
          .select(`
            user_id,
            role,
            total_commits,
            profiles (
              id,
              username,
              avatar_url
            )
          `)
          .eq('group_id', teamId)
          .order('total_commits', { ascending: false });

        if (membersError) {
          console.error('Error fetching members:', membersError);
        }

        // Transform members data and add ranks
        const members: TeamMember[] = (membersData || []).map((member: any, index: number) => ({
          id: member.profiles.id,
          username: member.profiles.username,
          avatar_url: member.profiles.avatar_url,
          role: member.role,
          total_commits: member.total_commits || 0,
          rank: index + 1,
        }));

        setTeam({
          id: groupData.id,
          name: groupData.name,
          description: groupData.description,
          avatar_url: groupData.avatar_url,
          owner_id: groupData.owner_id,
          member_count: members.length,
          members,
        });
      } catch (error) {
        console.error('Unexpected error fetching team:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [teamId, user, supabase]);
  
  // Common styles
  const buttonStyle = {
    background: theme === 'dark' ? "rgba(30, 41, 59, 0.4)" : "rgba(241, 245, 249, 0.8)",
    color: theme === 'dark' ? "white" : "hsl(220, 25%, 10%)",
    border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
    borderRadius: "0.5rem",
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
    textDecoration: "none",
  };
  
  const primaryButtonStyle = {
    background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
    color: "white",
    border: "none",
    borderRadius: "0.5rem",
    padding: "0.75rem 1.5rem",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    textDecoration: "none",
  };
  
  const sectionStyle = {
    background: theme === 'dark' ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
    borderRadius: "1rem",
    border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.5)" : "1px solid rgba(203, 213, 225, 0.5)",
    padding: "1.5rem",
    marginBottom: "2rem",
    boxShadow: theme === 'dark' ? 
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)" : 
      "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)"
  };
  
  const cardStyle = {
    background: theme === 'dark' ? "rgba(30, 41, 59, 0.4)" : "rgba(241, 245, 249, 0.7)",
    borderRadius: "0.5rem",
    border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
    padding: "0.75rem",
  };
  
  const headingColor = theme === 'dark' ? "#e2e8f0" : "#1e293b";
  const textColor = theme === 'dark' ? "#e2e8f0" : "#1e293b";
  const mutedColor = theme === 'dark' ? "#94a3b8" : "#64748b";

  // Handle leave team
  const handleLeaveTeam = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', teamId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error leaving team:', error);
        return;
      }

      // Redirect back to teams
      window.location.href = '/teams';
    } catch (error) {
      console.error('Unexpected error leaving team:', error);
    }
  };

  // Handle remove member
  const handleRemoveMember = async (memberId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', teamId)
        .eq('user_id', memberId);

      if (error) {
        console.error('Error removing member:', error);
        return;
      }

      // Refresh team data
      if (team) {
        setTeam({
          ...team,
          members: team.members.filter(m => m.id !== memberId),
          member_count: team.member_count - 1,
        });
      }
      setOpenMenuId(null);
    } catch (error) {
      console.error('Unexpected error removing member:', error);
    }
  };

  // Handle promote to admin
  const handlePromoteToAdmin = async (memberId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .update({ role: 'admin' })
        .eq('group_id', teamId)
        .eq('user_id', memberId);

      if (error) {
        console.error('Error promoting member:', error);
        return;
      }

      // Refresh team data
      if (team) {
        setTeam({
          ...team,
          members: team.members.map(m => 
            m.id === memberId ? { ...m, role: 'admin' } : m
          ),
        });
      }
      setOpenMenuId(null);
    } catch (error) {
      console.error('Unexpected error promoting member:', error);
    }
  };

  // Handle demote to member
  const handleDemoteToMember = async (memberId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .update({ role: 'member' })
        .eq('group_id', teamId)
        .eq('user_id', memberId);

      if (error) {
        console.error('Error demoting admin:', error);
        return;
      }

      // Refresh team data
      if (team) {
        setTeam({
          ...team,
          members: team.members.map(m => 
            m.id === memberId ? { ...m, role: 'member' } : m
          ),
        });
      }
      setOpenMenuId(null);
    } catch (error) {
      console.error('Unexpected error demoting admin:', error);
    }
  };

  // Handle transfer ownership
  const handleTransferOwnership = async (newOwnerId: string) => {
    if (!user) return;

    try {
      // Update the group owner
      const { error: groupError } = await supabase
        .from('groups')
        .update({ owner_id: newOwnerId })
        .eq('id', teamId)
        .eq('owner_id', user.id); // Ensure current user is the owner

      if (groupError) {
        console.error('Error updating group owner:', groupError);
        return;
      }

      // Update new owner's role to owner
      const { error: newOwnerError } = await supabase
        .from('group_members')
        .update({ role: 'owner' })
        .eq('group_id', teamId)
        .eq('user_id', newOwnerId);

      if (newOwnerError) {
        console.error('Error updating new owner role:', newOwnerError);
        return;
      }

      // Update current owner's role to admin
      const { error: currentOwnerError } = await supabase
        .from('group_members')
        .update({ role: 'admin' })
        .eq('group_id', teamId)
        .eq('user_id', user.id);

      if (currentOwnerError) {
        console.error('Error updating current owner role:', currentOwnerError);
        return;
      }

      // Refresh team data
      if (team) {
        setTeam({
          ...team,
          owner_id: newOwnerId,
          members: team.members.map(m => 
            m.id === newOwnerId ? { ...m, role: 'owner' } :
            m.id === user.id ? { ...m, role: 'admin' } : m
          ),
        });
      }
      setUserRole('admin');
      setOpenMenuId(null);
    } catch (error) {
      console.error('Unexpected error transferring ownership:', error);
    }
  };

  // Handle delete team
  const handleDeleteTeam = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', teamId)
        .eq('owner_id', user.id);

      if (error) {
        console.error('Error deleting team:', error);
        return;
      }

      // Redirect to teams page
      window.location.href = '/teams';
    } catch (error) {
      console.error('Unexpected error deleting team:', error);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "50vh",
        color: mutedColor,
      }}>
        Loading team data...
      </div>
    );
  }

  if (!team) {
    // Use Next.js notFound function to show the not-found page
    notFound();
    return null;
  }

  return (
    <PageLayout>
      {/* Page Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {team.avatar_url ? (
            <img 
              src={team.avatar_url} 
              alt={team.name}
              style={{
                width: "4.5rem",
                height: "4.5rem",
                borderRadius: "0.75rem",
                objectFit: "cover",
                boxShadow: theme === 'dark' ? 
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)" : 
                  "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)"
              }}
            />
          ) : (
            <div style={{
              width: "4.5rem",
              height: "4.5rem",
              borderRadius: "0.75rem",
              background: "linear-gradient(to bottom right, #3b82f6, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 700,
              fontSize: "1.5rem",
              boxShadow: theme === 'dark' ? 
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)" : 
                "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)"
            }}>
              {team.name.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="gradient-text" style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              marginBottom: "0.25rem",
            }}>
              {team.name}
            </h1>
            <p style={{ color: mutedColor }}>
              {team.description}
            </p>
          </div>
        </div>
        
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link href="/teams" style={{
            ...buttonStyle,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Teams
          </Link>
          
          {/* Show different buttons based on membership */}
          {isMember ? (
            <>
              {userRole === 'owner' && (
                <Link 
                  href={`/teams/${teamId}/edit`} 
                  style={primaryButtonStyle}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit Team
                </Link>
              )}
              {(userRole === 'owner' || userRole === 'admin') && (
                <>
                  <Link 
                    href={`/teams/${teamId}/invite`} 
                    style={primaryButtonStyle}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    Invite
                  </Link>
                  <Link 
                    href={`/teams/${teamId}/inbox`} 
                    style={primaryButtonStyle}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                    </svg>
                    Inbox
                  </Link>
                </>
              )}
              {userRole === 'owner' ? (
                <button 
                  onClick={handleDeleteTeam}
                  style={{
                    ...buttonStyle,
                    background: "#ef4444",
                    borderColor: "#ef4444",
                  }}
                >
                  Delete Team
                </button>
              ) : (
                <button 
                  onClick={handleLeaveTeam}
                  style={buttonStyle}
                >
                  Leave Team
                </button>
              )}
            </>
          ) : (
            <button style={primaryButtonStyle}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Request to Join
            </button>
          )}
        </div>
      </div>
      
      {/* Main Content - Leaderboard Only */}
      <div>
        {/* Leaderboard */}
        <div>
          <div style={sectionStyle}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: headingColor, marginBottom: "1.5rem" }}>
              Team Leaderboard
            </h2>
            
            <div style={{ 
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem"
            }}>
              {/* Table Header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: (userRole === 'owner' || userRole === 'admin') ? "50px 1fr 100px 80px" : "50px 1fr 100px",
                gap: "1rem",
                padding: "0.5rem 1rem",
                borderBottom: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
              }}>
                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: mutedColor }}>Rank</div>
                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: mutedColor }}>Member</div>
                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: mutedColor, textAlign: "right" }}>Commits</div>
                {(userRole === 'owner' || userRole === 'admin') && (
                  <div style={{ fontWeight: 600, fontSize: "0.875rem", color: mutedColor, textAlign: "right" }}>Action</div>
                )}
              </div>
              
              {/* Table Rows */}
              {team.members.map((member) => (
                <div key={member.id} style={{
                  display: "grid",
                  gridTemplateColumns: (userRole === 'owner' || userRole === 'admin') ? "50px 1fr 100px 80px" : "50px 1fr 100px",
                  gap: "1rem",
                  alignItems: "center",
                  ...cardStyle,
                }}>
                  <div style={{ 
                    fontWeight: 700, 
                    fontSize: "1rem", 
                    color: 
                      member.rank === 1 ? "#fbbf24" : 
                      member.rank === 2 ? (theme === 'dark' ? "#e2e8f0" : "#64748b") : 
                      member.rank === 3 ? "#fb923c" : 
                      mutedColor,
                    textAlign: "center",
                  }}>
                    #{member.rank}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {member.avatar_url ? (
                      <img 
                        src={member.avatar_url} 
                        alt={member.username}
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
                        {member.username.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <h4 style={{ fontWeight: 600, color: textColor }}>{member.username}</h4>
                        {member.id === user?.id && (
                          <span style={{ 
                            fontSize: "0.75rem", 
                            color: "#3b82f6",
                            fontWeight: 600,
                            fontStyle: "italic"
                          }}>
                            (You)
                          </span>
                        )}
                      </div>
                      <div style={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        gap: "0.25rem",
                        color: member.role === 'owner' ? "#fbbf24" : member.role === 'admin' ? "#3b82f6" : mutedColor,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: member.role === 'owner' ? "rgba(251, 191, 36, 0.1)" : member.role === 'admin' ? "rgba(59, 130, 246, 0.1)" : "rgba(148, 163, 184, 0.1)",
                        padding: "0.125rem 0.5rem",
                        borderRadius: "9999px",
                      }}>
                        {member.role === 'owner' ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6z"></path>
                            </svg>
                            Owner
                          </>
                        ) : member.role === 'admin' ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                              <path d="M22 12h-4"></path>
                              <path d="M18 8v8"></path>
                            </svg>
                            Admin
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                            </svg>
                            Member
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "1.125rem", color: textColor, textAlign: "right" }}>
                    {member.total_commits.toLocaleString()}
                  </div>
                  {member.id !== user?.id && (
                    <>
                      {userRole === 'owner' ? (
                        <div style={{ position: "relative", textAlign: "right" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === member.id ? null : member.id);
                            }}
                            style={{
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              padding: "0.5rem",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: textColor,
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="1"></circle>
                              <circle cx="12" cy="5" r="1"></circle>
                              <circle cx="12" cy="19" r="1"></circle>
                            </svg>
                          </button>
                          
                          {openMenuId === member.id && (
                            <div style={{
                              position: "absolute",
                              right: 0,
                              top: "100%",
                              marginTop: "0.25rem",
                              background: theme === 'dark' ? "rgba(30, 41, 59, 0.95)" : "rgba(255, 255, 255, 0.95)",
                              border: theme === 'dark' ? "1px solid rgba(51, 65, 85, 0.5)" : "1px solid rgba(203, 213, 225, 0.5)",
                              borderRadius: "0.5rem",
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                              minWidth: "180px",
                              zIndex: 50,
                              overflow: "hidden",
                            }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = `/profile/${member.id}`;
                                }}
                                style={{
                                  width: "100%",
                                  padding: "0.75rem 1rem",
                                  background: "transparent",
                                  border: "none",
                                  textAlign: "left",
                                  cursor: "pointer",
                                  color: textColor,
                                  fontSize: "0.875rem",
                                  transition: "background 0.2s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = theme === 'dark' ? "rgba(51, 65, 85, 0.5)" : "rgba(241, 245, 249, 0.8)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "transparent";
                                }}
                              >
                                View Profile
                              </button>
                              
                              {member.role === 'member' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePromoteToAdmin(member.id);
                                  }}
                                  style={{
                                    width: "100%",
                                    padding: "0.75rem 1rem",
                                    background: "transparent",
                                    border: "none",
                                    textAlign: "left",
                                    cursor: "pointer",
                                    color: textColor,
                                    fontSize: "0.875rem",
                                    transition: "background 0.2s ease",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = theme === 'dark' ? "rgba(51, 65, 85, 0.5)" : "rgba(241, 245, 249, 0.8)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "transparent";
                                  }}
                                >
                                  Promote to Admin
                                </button>
                              )}
                              
                              {member.role === 'admin' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDemoteToMember(member.id);
                                  }}
                                  style={{
                                    width: "100%",
                                    padding: "0.75rem 1rem",
                                    background: "transparent",
                                    border: "none",
                                    textAlign: "left",
                                    cursor: "pointer",
                                    color: textColor,
                                    fontSize: "0.875rem",
                                    transition: "background 0.2s ease",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = theme === 'dark' ? "rgba(51, 65, 85, 0.5)" : "rgba(241, 245, 249, 0.8)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "transparent";
                                  }}
                                >
                                  Demote to Member
                                </button>
                              )}
                              
                              {member.role !== 'owner' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTransferOwnership(member.id);
                                  }}
                                  style={{
                                    width: "100%",
                                    padding: "0.75rem 1rem",
                                    background: "transparent",
                                    border: "none",
                                    textAlign: "left",
                                    cursor: "pointer",
                                    color: textColor,
                                    fontSize: "0.875rem",
                                    transition: "background 0.2s ease",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = theme === 'dark' ? "rgba(51, 65, 85, 0.5)" : "rgba(241, 245, 249, 0.8)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "transparent";
                                  }}
                                >
                                  Transfer Ownership
                                </button>
                              )}
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveMember(member.id);
                                }}
                                style={{
                                  width: "100%",
                                  padding: "0.75rem 1rem",
                                  background: "transparent",
                                  border: "none",
                                  textAlign: "left",
                                  cursor: "pointer",
                                  color: "#ef4444",
                                  fontSize: "0.875rem",
                                  transition: "background 0.2s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = theme === 'dark' ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.05)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "transparent";
                                }}
                              >
                                Remove Member
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={`/profile/${member.id}`}
                          style={{
                            background: "transparent",
                            color: "#3b82f6",
                            border: "1px solid #3b82f6",
                            borderRadius: "0.5rem",
                            padding: "0.5rem 1.5rem",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            textDecoration: "none",
                            display: "inline-block",
                          }}
                        >
                          View
                        </Link>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
