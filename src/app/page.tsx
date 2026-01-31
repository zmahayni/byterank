"use client";

import { useTheme } from "../components/ThemeProvider";
import PageLayout from "../components/PageLayout";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  
  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      router.push('/teams');
    } else {
      router.push('/sign-in');
    }
  };
  return (
    <PageLayout fullWidth>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 48px)',
        width: '100%',
        color: theme === 'dark' ? 'white' : 'hsl(220, 25%, 10%)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        marginTop: '-48px' // Offset for navbar height
      }}>
        {/* Main content - centered vertically and horizontally */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '100%',
          padding: '1.5rem 0'
        }}>
          <h1 className="gradient-text" style={{ 
            fontSize: 'clamp(3.5rem, 12vw, 8rem)', 
            fontWeight: 'bold',
            marginBottom: '1rem',
            lineHeight: '1.1',
            textAlign: 'center',
            width: '100%',
            padding: '0 1rem 0.5rem 1rem',
            display: 'inline-block'
          }}>
            ByteRank
          </h1>
          
          <p style={{ 
            color: theme === 'dark' ? '#cbd5e1' : '#64748b', 
            fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
            marginBottom: '2rem',
            maxWidth: '30rem',
            fontWeight: '500',
            lineHeight: '1.3',
            textAlign: 'center',
            width: '100%',
            padding: '0 1rem'
          }}>
            Find Friends. Be Consistent. Climb the Ranks.
          </p>
          
          <a 
            href="#" 
            onClick={handleGetStarted}
            style={{ 
              background: 'linear-gradient(to right, #3b82f6, #9333ea)',
              color: 'white',
              fontWeight: 600,
              padding: '0.75rem 2.5rem',
              fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
              borderRadius: '9999px',
              boxShadow: '0 8px 15px -5px rgba(59, 130, 246, 0.2), 0 4px 6px -4px rgba(59, 130, 246, 0.2)',
              transition: 'all 0.3s ease',
              display: 'inline-block',
              textDecoration: 'none',
              letterSpacing: '0.5px',
              marginTop: '0.5rem',
              cursor: 'pointer'
            }}
            className="hover-effect"
          >
            Get Started
          </a>
        </div>
      </div>
    </PageLayout>
  );
}
