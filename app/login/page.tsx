'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import Image from 'next/image';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com Google');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#09090b',
      padding: '16px',
      color: '#f4f4f5',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Brilhos de Fundo */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '-100px',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'rgba(99, 102, 241, 0.15)',
        filter: 'blur(80px)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        right: '-100px',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'rgba(16, 185, 129, 0.15)',
        filter: 'blur(80px)'
      }} />

      {/* Card Principal */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '380px',
        borderRadius: '24px',
        border: '1px solid #27272a',
        backgroundColor: 'rgba(24, 24, 27, 0.75)',
        backdropFilter: 'blur(16px)',
        padding: '32px 24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}>
        
        {/* Logo */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid #3f3f46',
          backgroundColor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
          <Image 
            src="/logo.png" 
            alt="Nexus Logo" 
            width={64} 
            height={64} 
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>

        {/* Títulos */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff', margin: 0, letterSpacing: '-0.5px' }}>
            Nexus
          </h1>
          <p style={{ fontSize: '11px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '4px', fontWeight: '600' }}>
            Gestão Inteligente
          </p>
        </div>

        {error && (
          <div style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            color: '#fb7185',
            fontSize: '12px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Botão Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            backgroundColor: '#09090b',
            border: '1px solid #3f3f46',
            color: '#ffffff',
            fontWeight: '600',
            fontSize: '14px',
            padding: '14px 16px',
            borderRadius: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" style={{ minWidth: '20px', minHeight: '20px' }}>
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.1 8.9 5 12 5z"/>
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
            <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.6 6.4C.6 8.4 0 10.6 0 13s.6 4.6 1.6 6.6l3.7-2.9z"/>
            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.3L1.6 15C3.5 18.9 7.4 23 12 23z"/>
          </svg>
          <span>{loading ? 'Conectando...' : 'Entrar com o Google'}</span>
        </button>

      </div>
    </div>
  );
}
