'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Stats {
  totalTeams: number;
  totalQuestions: number;
  totalAnswers: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authStatus = sessionStorage.getItem('admin-auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      loadStats();
    } else {
      setLoading(false);
    }
  }, []);

  const loadStats = async () => {
    const [teamsRes, questionsRes, answersRes] = await Promise.all([
      supabase.from('teams').select('id', { count: 'exact', head: true }),
      supabase.from('questions').select('id', { count: 'exact', head: true }),
      supabase.from('answers').select('id', { count: 'exact', head: true }),
    ]);

    setStats({
      totalTeams: teamsRes.count || 0,
      totalQuestions: questionsRes.count || 0,
      totalAnswers: answersRes.count || 0,
    });
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple password check - in production, use proper auth
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
    
    if (password === correctPassword) {
      sessionStorage.setItem('admin-auth', 'true');
      setIsAuthenticated(true);
      setError('');
      loadStats();
    } else {
      setError('Contrasenya incorrecta');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login min-h-screen flex items-center justify-center p-4">
        <div className="admin-login-card w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8 animate-fade-in">
          <div className="admin-login-header text-center mb-8">
            <div className="admin-login-icon text-5xl mb-4">🔐</div>
            <h1 className="admin-login-title text-2xl font-bold text-white">
              Panell d&apos;Administració
            </h1>
          </div>

          <form onSubmit={handleLogin} className="admin-login-form space-y-6">
            <div>
              <label className="admin-login-label block text-sm font-medium text-gray-300 mb-2">
                Contrasenya
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-login-input w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                placeholder="Introdueix la contrasenya"
              />
            </div>

            {error && (
              <div className="admin-login-error bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="admin-login-submit w-full py-4 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold rounded-xl transition-all"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-loading min-h-screen flex items-center justify-center">
        <div className="admin-loading-spinner animate-spin w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard min-h-screen p-4 md:p-8">
      <div className="admin-dashboard-content max-w-6xl mx-auto">
        <div className="admin-header flex items-center justify-between mb-8">
          <h1 className="admin-title text-3xl font-bold text-white">
            🎮 Panell d&apos;Administració
          </h1>
          <button
            onClick={() => {
              sessionStorage.removeItem('admin-auth');
              setIsAuthenticated(false);
            }}
            className="admin-logout text-gray-400 hover:text-white transition-colors"
          >
            Sortir
          </button>
        </div>

        {/* Stats */}
        <div className="admin-stats grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="admin-stat-card bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6">
            <div className="admin-stat-icon text-3xl mb-2">👥</div>
            <div className="admin-stat-value text-3xl font-bold text-white">{stats?.totalTeams}</div>
            <div className="admin-stat-label text-gray-400">Equips</div>
          </div>
          <div className="admin-stat-card bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6">
            <div className="admin-stat-icon text-3xl mb-2">❓</div>
            <div className="admin-stat-value text-3xl font-bold text-white">{stats?.totalQuestions}</div>
            <div className="admin-stat-label text-gray-400">Preguntes</div>
          </div>
          <div className="admin-stat-card bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6">
            <div className="admin-stat-icon text-3xl mb-2">✍️</div>
            <div className="admin-stat-value text-3xl font-bold text-white">{stats?.totalAnswers}</div>
            <div className="admin-stat-label text-gray-400">Respostes</div>
          </div>
        </div>

        {/* Navigation */}
        <div className="admin-nav grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/admin/preguntes')}
            className="admin-nav-card bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-8 text-left hover:border-[var(--primary)] transition-all group"
          >
            <div className="admin-nav-icon text-4xl mb-4 group-hover:scale-110 transition-transform">📝</div>
            <h2 className="admin-nav-title text-xl font-bold text-white mb-2">Gestionar Preguntes</h2>
            <p className="admin-nav-desc text-gray-400">Crear, editar i eliminar preguntes. Generar codis QR.</p>
          </button>

          <button
            onClick={() => router.push('/admin/respostes')}
            className="admin-nav-card bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-8 text-left hover:border-[var(--primary)] transition-all group"
          >
            <div className="admin-nav-icon text-4xl mb-4 group-hover:scale-110 transition-transform">📊</div>
            <h2 className="admin-nav-title text-xl font-bold text-white mb-2">Veure Respostes</h2>
            <p className="admin-nav-desc text-gray-400">Consultar totes les respostes enviades pels equips.</p>
          </button>
        </div>
      </div>
    </div>
  );
}
