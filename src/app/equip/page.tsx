'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getOrCreateDeviceId } from '@/lib/device-id';
import TeamRegistration from '@/components/TeamRegistration';
import { Team, Question, Answer } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CheckCircle, Home, Lock, Star, Camera, Video, MessageSquare, CircleDot, Check } from 'lucide-react';

interface QuestionWithAnswer extends Question {
  answered: boolean;
  answer?: Answer;
}

export default function EquipPage() {
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuestionWithAnswer[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    const checkTeam = async () => {
      const deviceId = getOrCreateDeviceId();
      if (!deviceId) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('teams')
        .select('*')
        .eq('device_id', deviceId)
        .single();

      if (data) {
        setTeam(data);
      }
      setLoading(false);
    };

    checkTeam();
  }, []);

  useEffect(() => {
    const fetchQuestionsAndAnswers = async () => {
      if (!team) return;
      
      setLoadingQuestions(true);
      
      // Fetch all active questions
      const { data: questionsData } = await supabase
        .from('questions')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: true });
      
      // Fetch team's answers
      const { data: answersData } = await supabase
        .from('answers')
        .select('*')
        .eq('team_id', team.id);
      
      if (questionsData) {
        const answersMap = new Map(answersData?.map(a => [a.question_id, a]) || []);
        
        const questionsWithAnswers: QuestionWithAnswer[] = questionsData.map(q => ({
          ...q,
          answered: answersMap.has(q.id),
          answer: answersMap.get(q.id)
        }));
        
        setQuestions(questionsWithAnswers);
      }
      
      setLoadingQuestions(false);
    };

    fetchQuestionsAndAnswers();
  }, [team]);

  const handleRegister = async (teamName: string) => {
    const deviceId = getOrCreateDeviceId();
    if (!deviceId) {
      throw new Error('No s\'ha pogut identificar el dispositiu');
    }

    // Check if device already has a team
    const { data: existingTeam } = await supabase
      .from('teams')
      .select('*')
      .eq('device_id', deviceId)
      .single();

    if (existingTeam) {
      setTeam(existingTeam);
      return;
    }

    // Check if team name is taken
    const { data: nameExists } = await supabase
      .from('teams')
      .select('id')
      .eq('name', teamName)
      .single();

    if (nameExists) {
      throw new Error('Aquest nom d\'equip ja existeix. Prova\'n un altre!');
    }

    // Create new team
    const { data: newTeam, error } = await supabase
      .from('teams')
      .insert({
        name: teamName,
        device_id: deviceId,
      })
      .select()
      .single();

    if (error) {
      throw new Error('Error en crear l\'equip. Torna-ho a provar.');
    }

    setTeam(newTeam);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'photo':
        return <Camera size={20} />;
      case 'video':
        return <Video size={20} />;
      case 'true_false':
        return <CircleDot size={20} />;
      case 'multiple_choice':
        return <Check size={20} />;
      default:
        return <MessageSquare size={20} />;
    }
  };

  const answeredCount = questions.filter(q => q.answered).length;
  const totalQuestions = questions.length;

  if (team) {
    return (
      <div className="min-h-screen p-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Team Header */}
          <Card variant="ornate" className="text-center animate-fade-in mb-8">
            <div className="flex justify-center mb-4">
              <div className="equip-badge-header w-14 h-14 rounded-full bg-[var(--secondary)]/10 text-[var(--secondary)] flex items-center justify-center">
                <CheckCircle size={28} />
              </div>
            </div>
            
            <h1 className="text-xl font-serif font-bold text-[var(--foreground)] mb-1">
              Equip
            </h1>
            
            <p className="text-2xl font-serif font-bold text-[var(--primary)] mb-4">
              {team.name}
            </p>
            
            <div className="equip-progress-bar flex items-center justify-center gap-2 text-sm text-[var(--foreground)]/70">
              <Star size={16} className="text-[var(--accent)]" />
              <span>{answeredCount} de {totalQuestions} preguntes</span>
            </div>
          </Card>

          {/* Badges Grid */}
          <div className="mb-8">
            <h2 className="text-lg font-serif font-bold text-[var(--foreground)] mb-4 text-center">
              📜 Els teus Badges
            </h2>
            
            {loadingQuestions ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full"></div>
              </div>
            ) : questions.length === 0 ? (
              <Card className="text-center py-8">
                <p className="text-[var(--foreground)]/60 font-serif italic">
                  Encara no hi ha preguntes disponibles...
                </p>
              </Card>
            ) : (
              <div className="equip-badges-grid grid grid-cols-3 sm:grid-cols-4 gap-3">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className={`equip-badge-item animate-fade-in`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {question.answered ? (
                      <div className="equip-badge-revealed group relative">
                        <div className="equip-badge-inner aspect-square rounded-xl bg-gradient-to-br from-[var(--accent)] via-[var(--accent)]/90 to-[var(--primary)] p-0.5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                          <div className="equip-badge-content w-full h-full rounded-[10px] bg-gradient-to-br from-[var(--card-bg)] to-[var(--background)] flex flex-col items-center justify-center p-2 relative overflow-hidden">
                            {/* Decorative corner flourishes */}
                            <div className="equip-badge-flourish absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-[var(--accent)]/40 rounded-tl" />
                            <div className="equip-badge-flourish absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-[var(--accent)]/40 rounded-tr" />
                            <div className="equip-badge-flourish absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-[var(--accent)]/40 rounded-bl" />
                            <div className="equip-badge-flourish absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-[var(--accent)]/40 rounded-br" />
                            
                            {/* Badge icon */}
                            <div className="equip-badge-icon text-[var(--accent)] mb-1">
                              {getQuestionIcon(question.type)}
                            </div>
                            
                            {/* Question number */}
                            <span className="equip-badge-number text-xs font-serif font-bold text-[var(--foreground)]">
                              #{index + 1}
                            </span>
                            
                            {/* Points */}
                            <span className="equip-badge-points text-[10px] text-[var(--primary)] font-semibold">
                              {question.points} pts
                            </span>
                          </div>
                        </div>
                        
                        {/* Tooltip on hover */}
                        <div className="equip-badge-tooltip absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[var(--foreground)] text-[var(--background)] text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                          {question.title}
                          <div className="equip-badge-tooltip-arrow absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[var(--foreground)]" />
                        </div>
                      </div>
                    ) : (
                      <div className="equip-badge-locked aspect-square rounded-xl bg-[var(--card-border)] p-0.5 opacity-60">
                        <div className="equip-badge-locked-inner w-full h-full rounded-[10px] bg-[var(--card-bg)] flex flex-col items-center justify-center">
                          <Lock size={20} className="text-[var(--foreground)]/30 mb-1" />
                          <span className="equip-badge-locked-number text-xs font-serif text-[var(--foreground)]/40">
                            #{index + 1}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Progress message */}
          {questions.length > 0 && (
            <Card className="text-center mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              {answeredCount === totalQuestions ? (
                <p className="text-[var(--secondary)] font-serif font-bold">
                  🎉 Has completat totes les preguntes! Felicitats!
                </p>
              ) : answeredCount > 0 ? (
                <p className="text-[var(--foreground)]/70 font-serif italic">
                  Continua buscant QRs per desvetllar més badges!
                </p>
              ) : (
                <p className="text-[var(--foreground)]/70 font-serif italic">
                  Escaneja el primer QR per començar la teva aventura!
                </p>
              )}
            </Card>
          )}
          
          <Button
            onClick={() => router.push('/')}
            fullWidth
            variant="secondary"
          >
            <span className="flex items-center justify-center gap-2">
              <Home size={18} />
              Tornar a l'inici
            </span>
          </Button>
        </div>
      </div>
    );
  }

  return <TeamRegistration onRegister={handleRegister} />;
}
