'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Answer, Team, Question } from '@/types';

interface AnswerWithRelations extends Answer {
  team: Team;
  question: Question;
}

export default function RespostesPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<AnswerWithRelations[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<string>('all');
  const [viewingMedia, setViewingMedia] = useState<string | null>(null);

  useEffect(() => {
    const authStatus = sessionStorage.getItem('admin-auth');
    if (authStatus !== 'true') {
      router.push('/admin');
      return;
    }
    loadData();
  }, [router]);

  const loadData = async () => {
    const [answersRes, teamsRes, questionsRes] = await Promise.all([
      supabase
        .from('answers')
        .select(`
          *,
          team:teams(*),
          question:questions(*)
        `)
        .order('submitted_at', { ascending: false }),
      supabase.from('teams').select('*').order('name'),
      supabase.from('questions').select('*').order('title'),
    ]);

    setAnswers((answersRes.data || []) as AnswerWithRelations[]);
    setTeams(teamsRes.data || []);
    setQuestions(questionsRes.data || []);
    setLoading(false);
  };

  const filteredAnswers = answers.filter((answer) => {
    if (selectedTeam !== 'all' && answer.team_id !== selectedTeam) return false;
    if (selectedQuestion !== 'all' && answer.question_id !== selectedQuestion) return false;
    return true;
  });

  const calculateTeamScores = () => {
    const scores: Record<string, { name: string; score: number; total: number }> = {};
    
    answers.forEach((answer) => {
      if (!scores[answer.team_id]) {
        scores[answer.team_id] = {
          name: answer.team?.name || 'Unknown',
          score: 0,
          total: 0,
        };
      }
      scores[answer.team_id].total++;
      if (answer.is_correct) {
        scores[answer.team_id].score += answer.question?.points || 0;
      }
    });

    return Object.values(scores).sort((a, b) => b.score - a.score);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ca-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      text: '✍️',
      photo: '📷',
      video: '🎥',
      true_false: '✓/✗',
      multiple_choice: '🔘',
    };
    return icons[type] || '❓';
  };

  if (loading) {
    return (
      <div className="respostes-loading min-h-screen flex items-center justify-center">
        <div className="respostes-loading-spinner animate-spin w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const teamScores = calculateTeamScores();

  return (
    <div className="respostes-page min-h-screen p-4 md:p-8">
      <div className="respostes-content max-w-6xl mx-auto">
        <div className="respostes-header flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="respostes-back text-gray-400 hover:text-white transition-colors"
          >
            ← Tornar
          </button>
          <h1 className="respostes-title text-2xl font-bold text-white">
            Respostes dels Equips
          </h1>
        </div>

        {/* Leaderboard */}
        {teamScores.length > 0 && (
          <div className="respostes-leaderboard bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 mb-8">
            <h2 className="respostes-leaderboard-title text-lg font-semibold text-white mb-4">
              🏆 Classificació
            </h2>
            <div className="respostes-leaderboard-list space-y-2">
              {teamScores.slice(0, 10).map((team, index) => (
                <div
                  key={team.name}
                  className="respostes-leaderboard-item flex items-center justify-between p-3 bg-[var(--background)] rounded-lg"
                >
                  <div className="respostes-leaderboard-rank flex items-center gap-3">
                    <span className={`respostes-leaderboard-position text-xl font-bold ${
                      index === 0 ? 'text-yellow-400' :
                      index === 1 ? 'text-gray-300' :
                      index === 2 ? 'text-amber-600' :
                      'text-gray-500'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </span>
                    <span className="respostes-leaderboard-name text-white font-medium">{team.name}</span>
                  </div>
                  <div className="respostes-leaderboard-stats flex items-center gap-4">
                    <span className="respostes-leaderboard-answers text-gray-400 text-sm">
                      {team.total} respostes
                    </span>
                    <span className="respostes-leaderboard-score text-[var(--accent)] font-bold">
                      {team.score} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="respostes-filters grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="respostes-filter-label block text-sm font-medium text-gray-300 mb-2">
              Filtrar per equip
            </label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="respostes-filter-select w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="all">Tots els equips</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="respostes-filter-label block text-sm font-medium text-gray-300 mb-2">
              Filtrar per pregunta
            </label>
            <select
              value={selectedQuestion}
              onChange={(e) => setSelectedQuestion(e.target.value)}
              className="respostes-filter-select w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="all">Totes les preguntes</option>
              {questions.map((q) => (
                <option key={q.id} value={q.id}>{q.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Answers List */}
        {filteredAnswers.length === 0 ? (
          <div className="respostes-empty bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-12 text-center">
            <div className="respostes-empty-icon text-6xl mb-4">📭</div>
            <p className="respostes-empty-text text-gray-400">
              No hi ha respostes que coincideixin amb els filtres.
            </p>
          </div>
        ) : (
          <div className="respostes-list space-y-4">
            {filteredAnswers.map((answer) => (
              <div
                key={answer.id}
                className="respostes-item bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6"
              >
                <div className="respostes-item-header flex items-start justify-between mb-4">
                  <div className="respostes-item-info">
                    <div className="respostes-item-badges flex items-center gap-2 mb-2">
                      <span className="respostes-item-team px-2 py-1 bg-[var(--primary)]/20 text-[var(--primary)] rounded-lg text-xs font-medium">
                        👥 {answer.team?.name}
                      </span>
                      <span className="respostes-item-type px-2 py-1 bg-[var(--secondary)]/20 text-[var(--secondary)] rounded-lg text-xs font-medium">
                        {getTypeIcon(answer.question?.type || '')} {answer.question?.title}
                      </span>
                      {answer.is_correct !== null && (
                        <span className={`respostes-item-correct px-2 py-1 rounded-lg text-xs font-medium ${
                          answer.is_correct
                            ? 'bg-[var(--secondary)]/20 text-[var(--secondary)]'
                            : 'bg-[var(--error)]/20 text-[var(--error)]'
                        }`}>
                          {answer.is_correct ? '✓ Correcte' : '✗ Incorrecte'}
                        </span>
                      )}
                    </div>
                    <p className="respostes-item-date text-gray-500 text-sm">
                      {formatDate(answer.submitted_at)}
                    </p>
                  </div>
                </div>

                <div className="respostes-item-content">
                  {answer.answer_text && (
                    <div className="respostes-item-text bg-[var(--background)] rounded-lg p-4">
                      <p className="text-gray-300">{answer.answer_text}</p>
                    </div>
                  )}
                  
                  {answer.answer_file_url && (
                    <div className="respostes-item-media mt-4">
                      {answer.question?.type === 'photo' ? (
                        <img
                          src={answer.answer_file_url}
                          alt="Answer"
                          className="respostes-item-image max-w-sm rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setViewingMedia(answer.answer_file_url)}
                        />
                      ) : answer.question?.type === 'video' ? (
                        <video
                          src={answer.answer_file_url}
                          controls
                          className="respostes-item-video max-w-sm rounded-lg"
                        />
                      ) : (
                        <a
                          href={answer.answer_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="respostes-item-link text-[var(--primary)] hover:underline"
                        >
                          Veure fitxer
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Media Modal */}
        {viewingMedia && (
          <div
            className="respostes-media-modal fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={() => setViewingMedia(null)}
          >
            <img
              src={viewingMedia}
              alt="Full size"
              className="respostes-media-image max-w-full max-h-full rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
}
