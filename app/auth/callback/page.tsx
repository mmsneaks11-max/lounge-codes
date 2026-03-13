'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Supabase handles the OAuth code exchange automatically
    // when the client detects the hash fragment
    const handleCallback = async () => {
      const { error } = await supabase.auth.getSession();
      if (error) {
        console.error('Auth callback error:', error);
        router.push('/agents?auth_error=true');
      } else {
        // Redirect back to agents directory after successful login
        router.push('/agents');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#6B6B80',
      fontSize: 14,
    }}>
      Signing you in…
    </div>
  );
}
