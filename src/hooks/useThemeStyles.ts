"use client";

import { useMemo } from "react";
import { useTheme } from "../components/ThemeProvider";

export function useThemeStyles() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return useMemo(() => ({
    // Text colors
    colors: {
      heading: isDark ? "#e2e8f0" : "#1e293b",
      text: isDark ? "#e2e8f0" : "#1e293b",
      muted: isDark ? "#94a3b8" : "#64748b",
      link: "#3b82f6",
    },

    // Common button style (secondary/ghost)
    buttonStyle: {
      background: isDark ? "rgba(30, 41, 59, 0.4)" : "rgba(241, 245, 249, 0.8)",
      color: isDark ? "white" : "hsl(220, 25%, 10%)",
      border: isDark ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
      borderRadius: "0.5rem",
      padding: "0.5rem 1rem",
      fontSize: "0.875rem",
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 0.2s ease",
    } as React.CSSProperties,

    // Primary gradient button
    primaryButtonStyle: {
      background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
      color: "white",
      border: "none",
      borderRadius: "0.5rem",
      padding: "0.5rem 1rem",
      fontSize: "0.875rem",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    } as React.CSSProperties,

    // Active/selected button style
    activeButtonStyle: {
      background: "linear-gradient(to right, rgba(59, 130, 246, 0.7), rgba(147, 51, 234, 0.7))",
      color: "white",
      border: "1px solid rgba(79, 70, 229, 0.3)",
      borderRadius: "0.5rem",
      padding: "0.5rem 1rem",
      fontSize: "0.875rem",
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 0.2s ease",
    } as React.CSSProperties,

    // Danger button style
    dangerButtonStyle: {
      background: "#ef4444",
      color: "white",
      border: "1px solid #ef4444",
      borderRadius: "0.5rem",
      padding: "0.5rem 1rem",
      fontSize: "0.875rem",
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 0.2s ease",
    } as React.CSSProperties,

    // Card/section container
    cardStyle: {
      background: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
      borderRadius: "1rem",
      border: isDark ? "1px solid rgba(51, 65, 85, 0.5)" : "1px solid rgba(203, 213, 225, 0.5)",
      boxShadow: isDark
        ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)"
        : "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
    } as React.CSSProperties,

    // Section with padding
    sectionStyle: {
      background: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
      borderRadius: "1rem",
      border: isDark ? "1px solid rgba(51, 65, 85, 0.5)" : "1px solid rgba(203, 213, 225, 0.5)",
      padding: "1.5rem",
      marginBottom: "2rem",
      boxShadow: isDark
        ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)"
        : "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
    } as React.CSSProperties,

    // Item row style (for lists)
    itemStyle: {
      background: isDark ? "rgba(30, 41, 59, 0.4)" : "rgba(241, 245, 249, 0.7)",
      border: isDark ? "1px solid rgba(51, 65, 85, 0.3)" : "1px solid rgba(203, 213, 225, 0.5)",
      borderRadius: "0.5rem",
      padding: "0.75rem",
    } as React.CSSProperties,

    // Input style
    inputStyle: {
      padding: "0.75rem 1rem",
      borderRadius: "0.5rem",
      border: isDark ? "1px solid rgba(51, 65, 85, 0.5)" : "1px solid rgba(203, 213, 225, 0.5)",
      background: isDark ? "rgba(15, 23, 42, 0.4)" : "rgba(248, 250, 252, 0.8)",
      color: isDark ? "white" : "hsl(220, 25%, 10%)",
      fontSize: "0.875rem",
    } as React.CSSProperties,

    // Divider/border color
    borderColor: isDark ? "rgba(51, 65, 85, 0.5)" : "rgba(203, 213, 225, 0.5)",

    // Hover background for items
    hoverBg: isDark ? "rgba(30, 41, 59, 0.6)" : "rgba(241, 245, 249, 0.9)",

    // Theme state
    isDark,
    theme,
  }), [isDark, theme]);
}

export type ThemeStyles = ReturnType<typeof useThemeStyles>;
