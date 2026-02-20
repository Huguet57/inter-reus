'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { LogOut, Users, HelpCircle, FileText, Settings, BarChart, Clock } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card variant="ornate" className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <img 
              src="/flag-reus.svg" 
              alt="Bandera de Reus" 
              className="w-20 h-auto mx-auto mb-4"
            />
            <h1 className="text-2xl font-serif font-bold text-[var(--foreground)]">
              Panell d&apos;Administració
            </h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              type="password"
              label="Contrasenya"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Introdueix la contrasenya"
              error={error}
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
            >
              Entrar
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-serif font-bold text-[var(--primary)] flex items-center gap-3">
            <Settings className="text-[var(--secondary)]" />
            Panell d&apos;Administració
          </h1>
          <Button
            variant="ghost"
            onClick={() => {
              sessionStorage.removeItem('admin-auth');
              setIsAuthenticated(false);
            }}
            className="flex items-center gap-2"
          >
            <LogOut size={18} />
            Sortir
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <div className="text-3xl font-serif font-bold text-[var(--foreground)]">{stats?.totalTeams}</div>
              <div className="text-sm text-[var(--foreground)]/60 uppercase tracking-wider">Equips</div>
            </div>
          </Card>
          
          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--secondary)]/10 text-[var(--secondary)] flex items-center justify-center">
              <HelpCircle size={24} />
            </div>
            <div>
              <div className="text-3xl font-serif font-bold text-[var(--foreground)]">{stats?.totalQuestions}</div>
              <div className="text-sm text-[var(--foreground)]/60 uppercase tracking-wider">Preguntes</div>
            </div>
          </Card>
          
          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
              <FileText size={24} />
            </div>
            <div>
              <div className="text-3xl font-serif font-bold text-[var(--foreground)]">{stats?.totalAnswers}</div>
              <div className="text-sm text-[var(--foreground)]/60 uppercase tracking-wider">Respostes</div>
            </div>
          </Card>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => router.push('/admin/preguntes')}
            className="group text-left"
          >
            <Card className="h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg border-[var(--card-border)] group-hover:border-[var(--primary)]/30">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-[var(--background)] border border-[var(--card-border)] flex items-center justify-center text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                  <Settings size={28} />
                </div>
              </div>
              <h2 className="text-xl font-serif font-bold text-[var(--foreground)] mb-2 group-hover:text-[var(--primary)] transition-colors">
                Gestionar Preguntes
              </h2>
              <p className="text-[var(--foreground)]/60">
                Crear, editar i eliminar preguntes. Generar codis QR per al joc.
              </p>
            </Card>
          </button>

          <button
            onClick={() => router.push('/admin/respostes')}
            className="group text-left"
          >
            <Card className="h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg border-[var(--card-border)] group-hover:border-[var(--secondary)]/30">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-[var(--background)] border border-[var(--card-border)] flex items-center justify-center text-[var(--secondary)] group-hover:bg-[var(--secondary)] group-hover:text-white transition-colors">
                  <BarChart size={28} />
                </div>
              </div>
              <h2 className="text-xl font-serif font-bold text-[var(--foreground)] mb-2 group-hover:text-[var(--secondary)] transition-colors">
                Veure Respostes
              </h2>
              <p className="text-[var(--foreground)]/60">
                Consultar totes les respostes enviades pels equips i el seu estat.
              </p>
            </Card>
          </button>

          <button
            onClick={() => router.push('/admin/log')}
            className="group text-left"
          >
            <Card className="h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg border-[var(--card-border)] group-hover:border-[var(--accent)]/30">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-[var(--background)] border border-[var(--card-border)] flex items-center justify-center text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
                  <Clock size={28} />
                </div>
              </div>
              <h2 className="text-xl font-serif font-bold text-[var(--foreground)] mb-2 group-hover:text-[var(--accent)] transition-colors">
                Log de Troballes
              </h2>
              <p className="text-[var(--foreground)]/60">
                Veure el registre cronològic de quan els equips troben els QRs.
              </p>
            </Card>
          </button>
        </div>
      </div>
    </div>
  );
}
