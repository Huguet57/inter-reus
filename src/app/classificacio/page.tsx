'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Answer, Team, Question } from '@/types';
import { getDeviceId } from '@/lib/device-id';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Trophy, ArrowLeft, Clock } from 'lucide-react';

interface AnswerWithRelations extends Answer {
  team: Team;
  question: Question;
}

interface TeamScore {
  id: string;
  name: string;
  members: string[];
  score: number;
  total: number;
  pending: number;
}

export default function ClassificacioPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<AnswerWithRelations[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeamId, setMyTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [answersRes, teamsRes] = await Promise.all([
      supabase
        .from('answers')
        .select(`
          *,
          team:teams(*),
          question:questions(*)
        `),
      supabase.from('teams').select('*'),
    ]);

    const allTeams = (teamsRes.data || []) as Team[];
    setAnswers((answersRes.data || []) as AnswerWithRelations[]);
    setTeams(allTeams);

    const deviceId = getDeviceId();
    if (deviceId) {
      const myTeam = allTeams.find((t) => t.device_id === deviceId);
      if (myTeam) setMyTeamId(myTeam.id);
    }

    setLoading(false);
  };

  const calculateTeamScores = (): TeamScore[] => {
    const scores: Record<string, TeamScore> = {};

    // Inicialitzar tots els equips amb 0
    teams.forEach((team) => {
      scores[team.id] = {
        id: team.id,
        name: team.name,
        members: team.members || [],
        score: 0,
        total: 0,
        pending: 0,
      };
    });

    answers.forEach((answer) => {
      if (!scores[answer.team_id]) {
        scores[answer.team_id] = {
          id: answer.team_id,
          name: answer.team?.name || 'Unknown',
          members: answer.team?.members || [],
          score: 0,
          total: 0,
          pending: 0,
        };
      }
      scores[answer.team_id].total++;
      if (answer.is_correct === null) {
        scores[answer.team_id].pending++;
      }
      if (answer.is_correct) {
        scores[answer.team_id].score += answer.question?.points || 0;
      }
    });

    return Object.values(scores).sort((a, b) => b.score - a.score);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const teamScores = calculateTeamScores();

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--accent)]/10 mb-2">
            <Trophy size={28} className="text-[var(--accent)]" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-[var(--primary)]">
            Classificació
          </h1>
          <p className="text-[var(--foreground)]/60 font-serif italic text-sm">
            Rànking de tots els equips
          </p>
        </div>

        {teamScores.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-5xl mb-4">🏆</div>
            <p className="text-[var(--foreground)]/60 font-serif italic">
              Encara no hi ha puntuacions.
            </p>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--card-border)] shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--card-bg)] border-b border-[var(--card-border)]">
                  <th className="text-left px-3 py-2.5 text-xs font-serif font-semibold text-[var(--foreground)]/60 uppercase tracking-wider">#</th>
                  <th className="text-left px-3 py-2.5 text-xs font-serif font-semibold text-[var(--foreground)]/60 uppercase tracking-wider">Equip</th>
                  <th className="text-center px-3 py-2.5 text-xs font-serif font-semibold text-[var(--foreground)]/60 uppercase tracking-wider">Respostes</th>
                  <th className="text-center px-3 py-2.5 text-xs font-serif font-semibold text-[var(--foreground)]/60 uppercase tracking-wider">Corregides</th>
                  <th className="text-right px-3 py-2.5 text-xs font-serif font-semibold text-[var(--foreground)]/60 uppercase tracking-wider">Punts</th>
                </tr>
              </thead>
              <tbody>
                {teamScores.map((team, index) => {
                  const isMyTeam = team.id === myTeamId;
                  return (
                  <tr
                    key={team.name}
                    className={`border-b border-[var(--card-border)] last:border-b-0 transition-colors ${
                      isMyTeam
                        ? 'bg-[#f5e6d3] font-semibold'
                        : 'bg-[var(--background)] hover:bg-[var(--card-bg)]'
                    }`}
                  >
                    <td className="px-3 py-3">
                      <span className={`text-lg font-bold ${
                        index === 0 ? 'text-[var(--accent)]' :
                        index === 1 ? 'text-[var(--foreground)]/60' :
                        index === 2 ? 'text-[#B45309]' :
                        'text-[var(--foreground)]/40'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-serif font-medium text-[var(--foreground)]">
                      <div>
                        {team.name}
                        {team.members.length > 0 && (
                          <div className="text-xs font-normal italic text-[var(--foreground)]/50 mt-0.5">
                            {team.members.join(', ')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center text-sm text-[var(--foreground)]/60">
                      {team.total}
                    </td>
                    <td className="px-3 py-3 text-center text-sm text-[var(--foreground)]/60">
                      {team.total - team.pending}
                    </td>
                    <td className="px-3 py-3 text-right text-sm text-[var(--foreground)]/60">
                      {team.score}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="pt-2">
          <Button
            variant="secondary"
            onClick={() => router.push('/')}
            fullWidth
          >
            <span className="flex items-center justify-center gap-2">
              <ArrowLeft size={16} />
              Tornar a l&apos;inici
            </span>
          </Button>
        </div>
      </div>
    </main>
  );
}
