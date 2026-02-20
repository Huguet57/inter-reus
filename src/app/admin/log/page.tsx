'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Answer, Team, Question } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, Clock, Filter, Check, X, QrCode, RefreshCw } from 'lucide-react';

interface AnswerWithRelations extends Answer {
  team: Team;
  question: Question;
}

export default function LogPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<AnswerWithRelations[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);

    const [answersRes, teamsRes] = await Promise.all([
      supabase
        .from('answers')
        .select(`
          *,
          team:teams(*),
          question:questions(*)
        `)
        .order('submitted_at', { ascending: false }),
      supabase.from('teams').select('*').order('name'),
    ]);

    setAnswers((answersRes.data || []) as AnswerWithRelations[]);
    setTeams(teamsRes.data || []);
    setLoading(false);
    if (showRefresh) setRefreshing(false);
  }, []);

  useEffect(() => {
    const authStatus = sessionStorage.getItem('admin-auth');
    if (authStatus !== 'true') {
      router.push('/admin');
      return;
    }
    loadData();
  }, [router, loadData]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  const filteredAnswers = answers.filter((answer) => {
    if (selectedTeam !== 'all' && answer.team_id !== selectedTeam) return false;
    return true;
  });

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ca-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Tornar
          </Button>
          <h1 className="text-2xl font-serif font-bold text-[var(--primary)] flex items-center gap-2">
            <Clock className="text-[var(--accent)]" />
            Log de Troballes
          </h1>
          <button
            onClick={() => loadData(true)}
            className="ml-auto p-2 rounded-lg hover:bg-[var(--card-bg)] transition-colors text-[var(--foreground)]/60"
            title="Actualitzar"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Filter */}
        <div className="mb-6 max-w-xs">
          <label className="block text-sm font-serif font-medium text-[var(--foreground)] opacity-80 flex items-center gap-2 mb-2">
            <Filter size={14} />
            Filtrar per equip
          </label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-full px-4 py-3 bg-[var(--card-bg)] border-b-2 border-[var(--card-border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors font-sans"
          >
            <option value="all">Tots els equips</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>

        {/* Log Table */}
        {filteredAnswers.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-[var(--foreground)]/60 font-serif italic">
              Encara no hi ha cap troballa registrada.
            </p>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--card-border)] shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--card-bg)] border-b border-[var(--card-border)]">
                  <th className="text-left px-3 py-2.5 text-xs font-serif font-semibold text-[var(--foreground)]/60 uppercase tracking-wider">Hora</th>
                  <th className="text-left px-3 py-2.5 text-xs font-serif font-semibold text-[var(--foreground)]/60 uppercase tracking-wider">Equip</th>
                  <th className="text-left px-3 py-2.5 text-xs font-serif font-semibold text-[var(--foreground)]/60 uppercase tracking-wider">Pregunta</th>
                  <th className="text-right px-3 py-2.5 text-xs font-serif font-semibold text-[var(--foreground)]/60 uppercase tracking-wider">Estat</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnswers.map((answer) => (
                  <tr key={answer.id} className="border-b border-[var(--card-border)] last:border-b-0 bg-[var(--background)] hover:bg-[var(--card-bg)] transition-colors">
                    <td className="px-3 py-3 text-sm font-mono text-[var(--foreground)]/70 whitespace-nowrap">
                      <Clock size={12} className="inline mr-1.5 opacity-50" />
                      {formatDateTime(answer.submitted_at)}
                    </td>
                    <td className="px-3 py-3 font-serif font-medium text-[var(--foreground)]">
                      {answer.team?.name}
                    </td>
                    <td className="px-3 py-3 text-sm text-[var(--foreground)]/70">
                      <QrCode size={12} className="inline mr-1.5 opacity-50" />
                      {answer.question?.title}
                    </td>
                    <td className="px-3 py-3 text-right">
                      {answer.is_correct === true && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-[var(--secondary)]/10 text-[var(--secondary)]">
                          <Check size={12} />
                          Correcte
                        </span>
                      )}
                      {answer.is_correct === false && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-[var(--error)]/10 text-[var(--error)]">
                          <X size={12} />
                          Incorrecte
                        </span>
                      )}
                      {answer.is_correct === null && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-[var(--accent)]/10 text-[var(--accent)]">
                          <Clock size={12} />
                          Pendent
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-[var(--foreground)]/40 mt-4 text-center">
          S&apos;actualitza cada 15 segons &middot; {filteredAnswers.length} troballes
        </p>
      </div>
    </div>
  );
}
