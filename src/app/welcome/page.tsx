"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useThemeStyles } from "../../hooks/useThemeStyles";

type FeaturedTeam = {
  id: string;
  name: string;
  avatar_url: string | null;
  description: string | null;
  member_count: number;
};

export default function WelcomePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const supabase = createClientComponentClient();
  const { colors, isDark, primaryButtonStyle, buttonStyle } = useThemeStyles();

  const [featuredTeam, setFeaturedTeam] = useState<FeaturedTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  // Redirect based on auth and onboarding status
  useEffect(() => {
    async function checkRedirect() {
      if (authLoading) return;

      if (!user) {
        router.push('/sign-in');
        return;
      }

      // Check if user has already completed onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

      if (profile?.onboarding_completed === true) {
        router.push('/teams');
      }
    }

    checkRedirect();
  }, [user, authLoading, router, supabase]);

  // Fetch featured team
  useEffect(() => {
    async function fetchFeaturedTeam() {
      try {
        const { data: teamData, error: teamError } = await supabase
          .from('groups')
          .select('id, name, avatar_url, description')
          .eq('is_featured', true)
          .single();

        if (teamError || !teamData) {
          console.error('Error fetching featured team:', teamError);
          setLoading(false);
          return;
        }

        // Get member count
        const { data: countData } = await supabase
          .from('v_group_member_counts')
          .select('member_count')
          .eq('group_id', teamData.id)
          .single();

        setFeaturedTeam({
          ...teamData,
          member_count: countData?.member_count || 0,
        });
      } catch (error) {
        console.error('Unexpected error fetching featured team:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedTeam();
  }, [supabase]);

  // Mark onboarding as completed and navigate (upsert to handle missing profiles)
  const completeOnboarding = async (navigateTo: string) => {
    if (!user) return;

    try {
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: user.user_metadata?.user_name || user.email?.split('@')[0] || 'user',
          avatar_url: user.user_metadata?.avatar_url,
          github_username: user.user_metadata?.user_name,
          onboarding_completed: true,
        });
    } catch (error) {
      console.error('Error updating onboarding status:', error);
    }

    router.push(navigateTo);
  };

  // Handle join team
  const handleJoinTeam = async () => {
    if (!user || !featuredTeam) return;

    setJoining(true);

    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: featuredTeam.id,
          user_id: user.id,
          role: 'member',
          total_commits: 0,
        });

      if (error) {
        console.error('Error joining team:', error);
        setJoining(false);
        return;
      }

      // Complete onboarding and go to the team page
      await completeOnboarding(`/teams/${featuredTeam.id}`);
    } catch (error) {
      console.error('Unexpected error joining team:', error);
      setJoining(false);
    }
  };

  // Handle skip
  const handleSkip = () => {
    completeOnboarding('/teams');
  };

  if (authLoading || loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isDark
          ? "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)"
          : "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #f8fafc 100%)",
        color: colors.muted,
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      background: isDark
        ? "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)"
        : "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #f8fafc 100%)",
    }}>
      {/* Welcome Card */}
      <div style={{
        maxWidth: "480px",
        width: "100%",
        background: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
        borderRadius: "1.5rem",
        border: isDark ? "1px solid rgba(51, 65, 85, 0.5)" : "1px solid rgba(203, 213, 225, 0.5)",
        padding: "2.5rem",
        boxShadow: isDark
          ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
          : "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
      }}>
        {/* Logo/Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 className="gradient-text" style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            marginBottom: "0.5rem",
          }}>
            Welcome to ByteRank
          </h1>
          <p style={{
            color: colors.muted,
            fontSize: "1rem",
            lineHeight: 1.6,
          }}>
            Compete with friends, track your coding consistency, and climb the leaderboards.
          </p>
        </div>

        {/* What is ByteRank */}
        <div style={{
          background: isDark ? "rgba(30, 41, 59, 0.4)" : "rgba(241, 245, 249, 0.7)",
          borderRadius: "0.75rem",
          padding: "1.25rem",
          marginBottom: "1.5rem",
        }}>
          <h3 style={{
            color: colors.heading,
            fontSize: "0.875rem",
            fontWeight: 600,
            marginBottom: "0.75rem",
          }}>
            How it works
          </h3>
          <ul style={{
            color: colors.muted,
            fontSize: "0.875rem",
            lineHeight: 1.6,
            paddingLeft: "1.25rem",
            margin: 0,
          }}>
            <li style={{ marginBottom: "0.5rem" }}>Join or create teams with friends</li>
            <li style={{ marginBottom: "0.5rem" }}>Your GitHub commits are synced daily</li>
            <li>Compete on leaderboards for coding consistency</li>
          </ul>
        </div>

        {/* Featured Team */}
        {featuredTeam && (
          <div style={{
            background: isDark
              ? "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)"
              : "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
            border: isDark ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid rgba(59, 130, 246, 0.2)",
            borderRadius: "0.75rem",
            padding: "1.25rem",
            marginBottom: "1.5rem",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.75rem",
            }}>
              <span style={{
                background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
                color: "white",
                fontSize: "0.625rem",
                fontWeight: 700,
                padding: "0.125rem 0.5rem",
                borderRadius: "9999px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}>
                Recommended
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {featuredTeam.avatar_url ? (
                <img
                  src={featuredTeam.avatar_url}
                  alt={featuredTeam.name}
                  style={{
                    width: "3.5rem",
                    height: "3.5rem",
                    borderRadius: "0.75rem",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div style={{
                  width: "3.5rem",
                  height: "3.5rem",
                  borderRadius: "0.75rem",
                  background: "linear-gradient(to bottom right, #3b82f6, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "1.25rem",
                }}>
                  {featuredTeam.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <h4 style={{
                  color: colors.heading,
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  marginBottom: "0.25rem",
                }}>
                  {featuredTeam.name}
                </h4>
                <p style={{
                  color: colors.muted,
                  fontSize: "0.8125rem",
                }}>
                  {featuredTeam.member_count} member{featuredTeam.member_count !== 1 ? 's' : ''} competing
                </p>
              </div>
            </div>
            {featuredTeam.description && (
              <p style={{
                color: colors.muted,
                fontSize: "0.8125rem",
                marginTop: "0.75rem",
                lineHeight: 1.5,
              }}>
                {featuredTeam.description}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {featuredTeam && (
            <button
              onClick={handleJoinTeam}
              disabled={joining}
              style={{
                ...primaryButtonStyle,
                width: "100%",
                justifyContent: "center",
                padding: "0.875rem 1.5rem",
                fontSize: "1rem",
                opacity: joining ? 0.7 : 1,
              }}
            >
              {joining ? "Joining..." : `Join ${featuredTeam.name}`}
            </button>
          )}
          <button
            onClick={handleSkip}
            style={{
              ...buttonStyle,
              width: "100%",
              textAlign: "center",
              padding: "0.875rem 1.5rem",
            }}
          >
            Skip for now
          </button>
        </div>

        {/* Footer note */}
        <p style={{
          color: colors.muted,
          fontSize: "0.75rem",
          textAlign: "center",
          marginTop: "1.5rem",
        }}>
          You can always join more teams later from the Community page.
        </p>
      </div>
    </div>
  );
}
