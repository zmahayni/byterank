"use client";

import Link from "next/link";
import Card from "./Card";
import { useThemeStyles } from "../hooks/useThemeStyles";

type Team = {
  id: string;
  name: string;
  avatar_url: string | null;
  member_count: number;
  user_role?: string;
  user_rank?: number;
};

interface MyTeamsListProps {
  teams: Team[];
  loading: boolean;
}

export default function MyTeamsList({ teams, loading }: MyTeamsListProps) {
  const { primaryButtonStyle, colors, isDark, borderColor } = useThemeStyles();

  return (
    <div>
      {/* Teams Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "var(--gap-small)",
      }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: colors.heading }}>
          My Teams
        </h2>
        <Link
          href="/teams/create"
          style={{
            ...primaryButtonStyle,
            padding: "0.5rem 1rem",
            textDecoration: "none",
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create Team
        </Link>
      </div>

      {/* Teams List */}
      <Card padding="small">
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: colors.muted }}>
            Loading teams...
          </div>
        ) : teams.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: colors.muted }}>
            You haven&apos;t joined any teams yet. Create one or search to join!
          </div>
        ) : (
          teams.map((team, index) => (
            <div key={team.id} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 1.5rem",
              borderBottom: index < teams.length - 1 ? `1px solid ${borderColor}` : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
                {team.avatar_url ? (
                  <img
                    src={team.avatar_url}
                    alt={team.name}
                    style={{
                      width: "3rem",
                      height: "3rem",
                      borderRadius: "0.75rem",
                      objectFit: "cover",
                      flexShrink: 0
                    }}
                  />
                ) : (
                  <div style={{
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "0.75rem",
                    background: "linear-gradient(to bottom right, #3b82f6, #8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "1rem",
                    flexShrink: 0
                  }}>
                    {team.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginRight: "auto" }}>
                  <h3 style={{ fontWeight: 600, color: colors.heading, fontSize: "1.125rem" }}>
                    {team.name}
                  </h3>
                  <span style={{ fontSize: "0.75rem", color: colors.muted, textTransform: "capitalize" }}>
                    {team.user_role}
                  </span>
                </div>
                {/* Rank Badge */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  backgroundColor: team.user_rank === 1 ? "rgba(234, 179, 8, 0.15)" :
                    team.user_rank === 2 ? (isDark ? "rgba(148, 163, 184, 0.15)" : "rgba(148, 163, 184, 0.3)") :
                      team.user_rank === 3 ? "rgba(194, 65, 12, 0.15)" :
                        "rgba(51, 65, 85, 0.15)",
                  color: team.user_rank === 1 ? "#fbbf24" :
                    team.user_rank === 2 ? (isDark ? "#e2e8f0" : "#64748b") :
                      team.user_rank === 3 ? "#fb923c" :
                        "#94a3b8",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "0.375rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  flexShrink: 0
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6z"></path>
                  </svg>
                  <span>#{team.user_rank}</span>
                </div>
                {/* Member Count */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  backgroundColor: isDark ? "rgba(51, 65, 85, 0.15)" : "rgba(241, 245, 249, 0.8)",
                  color: colors.muted,
                  padding: "0.25rem 0.5rem",
                  borderRadius: "0.375rem",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  marginRight: "1rem",
                  flexShrink: 0
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <span>{team.member_count}</span>
                </div>
              </div>
              <Link
                href={`/teams/${team.id}`}
                style={{
                  background: isDark ? "rgba(30, 41, 59, 0.4)" : "rgba(241, 245, 249, 0.8)",
                  color: isDark ? "white" : "hsl(220, 25%, 10%)",
                  border: isDark ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
                  borderRadius: "0.5rem",
                  padding: "0.5rem 1rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  textDecoration: "none",
                  flexShrink: 0,
                  minWidth: "70px",
                  textAlign: "center"
                }}
              >
                View
              </Link>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
