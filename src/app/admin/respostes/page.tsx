'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Answer, Team, Question } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  ArrowLeft, Trophy, Filter, Calendar, Type, 
  Image, Video, CheckSquare, List, Check, X, Clock 
} from 'lucide-react';

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
    const scores: Record<string, { name: string; members: string[]; score: number; total: number }> = {};
    
    answers.forEach((answer) => {
      if (!scores[answer.team_id]) {
        scores[answer.team_id] = {
          name: answer.team?.name || 'Unknown',
          members: answer.team?.members || [],
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
    const icons: Record<string, React.ReactNode> = {
      text: <Type size={16} />,
      photo: <Image size={16} />,
      video: <Video size={16} />,
      true_false: <CheckSquare size={16} />,
      multiple_choice: <List size={16} />,
    };
    return icons[type] || <span className="text-lg">❓</span>;
  };

  const handleValidateAnswer = async (answerId: string, isCorrect: boolean) => {
    const { error } = await supabase
      .from('answers')
      .update({ is_correct: isCorrect })
      .eq('id', answerId);

    if (!error) {
      setAnswers((prev) =>
        prev.map((a) => (a.id === answerId ? { ...a, is_correct: isCorrect } : a))
      );
    }
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
          <h1 className="text-2xl font-serif font-bold text-[var(--primary)]">
            Respostes dels Equips
          </h1>
        </div>

        {/* Leaderboard */}
        {teamScores.length > 0 && (
          <Card className="mb-8">
            <h2 className="text-xl font-serif font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <Trophy className="text-[var(--accent)]" />
              Classificació
            </h2>
            <div className="space-y-2">
              {teamScores.slice(0, 10).map((team, index) => (
                <div
                  key={team.name}
                  className="flex items-center justify-between p-3 bg-[var(--background)] border border-[var(--card-border)] rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-xl font-bold w-8 text-center ${
                      index === 0 ? 'text-[var(--accent)]' :
                      index === 1 ? 'text-[var(--foreground)]/60' :
                      index === 2 ? 'text-[#B45309]' :
                      'text-[var(--foreground)]/40'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </span>
                    <div>
                      <span className="font-serif font-medium text-[var(--foreground)]">{team.name}</span>
                      {team.members && team.members.length > 0 && (
                        <span className="ml-2 text-xs font-normal text-[var(--foreground)]/40 italic">
                          ({team.members.join(', ')})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-[var(--foreground)]/60 text-sm">
                      {team.total} respostes
                    </span>
                    <span className="text-[var(--primary)] font-bold">
                      {team.score} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-serif font-medium text-[var(--foreground)] opacity-80 flex items-center gap-2">
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
          <div className="space-y-2">
            <label className="block text-sm font-serif font-medium text-[var(--foreground)] opacity-80 flex items-center gap-2">
              <Filter size={14} />
              Filtrar per pregunta
            </label>
            <select
              value={selectedQuestion}
              onChange={(e) => setSelectedQuestion(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--card-bg)] border-b-2 border-[var(--card-border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors font-sans"
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
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-[var(--foreground)]/60 font-serif italic">
              No hi ha respostes que coincideixin amb els filtres.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAnswers.map((answer) => (
              <Card key={answer.id}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-md text-xs font-bold uppercase tracking-wider">
                        👥 {answer.team?.name}
                        {answer.team?.members && answer.team.members.length > 0 && (
                          <span className="font-normal normal-case tracking-normal opacity-70">
                            ({answer.team.members.join(', ')})
                          </span>
                        )}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--secondary)]/10 text-[var(--secondary)] rounded-md text-xs font-bold">
                        {getTypeIcon(answer.question?.type || '')}
                        <span className="ml-1">{answer.question?.title}</span>
                      </span>
                      <span className="admin-answer-points-badge px-2 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-md text-xs font-bold">
                        {answer.question?.points} pts
                      </span>
                      {answer.is_correct !== null ? (
                        <span className={`admin-answer-status-badge inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${
                          answer.is_correct
                            ? 'bg-[var(--secondary)]/10 text-[var(--secondary)]'
                            : 'bg-[var(--error)]/10 text-[var(--error)]'
                        }`}>
                          {answer.is_correct ? <Check size={12} /> : <X size={12} />}
                          {answer.is_correct ? 'Correcte' : 'Incorrecte'}
                        </span>
                      ) : (
                        <span className="admin-answer-pending-badge inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-[var(--accent)]/10 text-[var(--accent)]">
                          <Clock size={12} />
                          Pendent
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[var(--foreground)]/40 text-sm">
                      <Calendar size={14} />
                      {formatDate(answer.submitted_at)}
                    </div>
                  </div>

                  {/* Validation buttons - for all answers except auto-scored true_false */}
                  {answer.question?.type !== 'true_false' && (
                    <div className="admin-answer-validate-buttons flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleValidateAnswer(answer.id, true)}
                        className={`admin-validate-correct-btn inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          answer.is_correct === true
                            ? 'bg-[var(--secondary)] text-white'
                            : 'bg-[var(--secondary)]/10 text-[var(--secondary)] hover:bg-[var(--secondary)]/20'
                        }`}
                      >
                        <Check size={16} />
                        Correcte
                      </button>
                      <button
                        onClick={() => handleValidateAnswer(answer.id, false)}
                        className={`admin-validate-incorrect-btn inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          answer.is_correct === false
                            ? 'bg-[var(--error)] text-white'
                            : 'bg-[var(--error)]/10 text-[var(--error)] hover:bg-[var(--error)]/20'
                        }`}
                      >
                        <X size={16} />
                        Incorrecte
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  {answer.answer_text && (
                    <div className="bg-[var(--background)] border border-[var(--card-border)] rounded-lg p-4 relative">
                      {/* Paper lines effect */}
                      <div className="absolute inset-0 pointer-events-none opacity-5 rounded-lg" 
                           style={{
                             backgroundImage: 'linear-gradient(transparent 95%, var(--foreground) 95%)',
                             backgroundSize: '100% 1.5rem',
                           }}>
                      </div>
                      <p className="text-[var(--foreground)] font-serif text-lg leading-6">{answer.answer_text}</p>
                    </div>
                  )}
                  
                  {answer.answer_file_url && (
                    <div className="mt-4">
                      {answer.question?.type === 'photo' ? (
                        <div className="relative group max-w-sm">
                          <img
                            src={answer.answer_file_url}
                            alt="Answer"
                            className="rounded-lg cursor-pointer transition-transform group-hover:scale-[1.02] border-4 border-white shadow-md"
                            onClick={() => setViewingMedia(answer.answer_file_url)}
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center pointer-events-none">
                            <span className="text-white font-medium bg-black/50 px-3 py-1 rounded-full">Clic per ampliar</span>
                          </div>
                        </div>
                      ) : answer.question?.type === 'video' ? (
                        <video
                          src={answer.answer_file_url}
                          controls
                          className="max-w-sm rounded-lg border-4 border-white shadow-md"
                        />
                      ) : (
                        <a
                          href={answer.answer_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--primary)] hover:underline font-medium"
                        >
                          Veure fitxer adjunt
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Media Modal */}
        {viewingMedia && (
          <div
            className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 animate-fade-in"
            onClick={() => setViewingMedia(null)}
          >
            <img
              src={viewingMedia}
              alt="Full size"
              className="max-w-full max-h-full rounded-lg shadow-2xl"
            />
            <button 
              className="absolute top-4 right-4 text-white hover:text-gray-300"
              onClick={() => setViewingMedia(null)}
            >
              <X size={32} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
