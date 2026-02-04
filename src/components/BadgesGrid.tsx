'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Question, Answer } from '@/types';
import { Card } from '@/components/ui/Card';
import { RandomQR } from '@/components/RandomQR';
import { Camera, Video, MessageSquare, CircleDot, Check } from 'lucide-react';

interface QuestionWithAnswer extends Question {
  answered: boolean;
  answer?: Answer;
}

interface BadgesGridProps {
  teamId: string;
  showTitle?: boolean;
  showProgressMessage?: boolean;
  columns?: 3 | 4;
}

export function BadgesGrid({ 
  teamId, 
  showTitle = true, 
  showProgressMessage = true,
  columns = 4 
}: BadgesGridProps) {
  const [questions, setQuestions] = useState<QuestionWithAnswer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestionsAndAnswers = async () => {
      if (!teamId) return;
      
      setLoading(true);
      
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
        .eq('team_id', teamId);
      
      if (questionsData) {
        const answersMap = new Map(answersData?.map(a => [a.question_id, a]) || []);
        
        const questionsWithAnswers: QuestionWithAnswer[] = questionsData.map(q => ({
          ...q,
          answered: answersMap.has(q.id),
          answer: answersMap.get(q.id)
        }));
        
        setQuestions(questionsWithAnswers);
      }
      
      setLoading(false);
    };

    fetchQuestionsAndAnswers();
  }, [teamId]);

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

  const gridColsClass = columns === 3 ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-4';

  if (loading) {
    return (
      <div className="badges-grid-loading flex justify-center py-6">
        <div className="animate-spin w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="badges-grid-empty text-center py-6">
        <p className="text-[var(--foreground)]/60 font-serif italic text-sm">
          Encara no hi ha preguntes disponibles...
        </p>
      </Card>
    );
  }

  return (
    <div className="badges-grid-container">
      {showTitle && (
        <h2 className="badges-grid-title text-lg font-serif font-bold text-[var(--foreground)] mb-4 text-center">
          📜 Les teves Insígnies
        </h2>
      )}
      
      <div className={`badges-grid grid ${gridColsClass} gap-2 mb-4`}>
        {questions.map((question, index) => (
          <div
            key={question.id}
            className="badges-grid-item animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {question.answered ? (
              <div className="badge-revealed group relative">
                <div className="badge-revealed-outer aspect-square rounded-xl bg-gradient-to-br from-[var(--accent)] via-[var(--accent)]/90 to-[var(--primary)] p-0.5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                  <div className="badge-revealed-inner w-full h-full rounded-[10px] bg-gradient-to-br from-[var(--card-bg)] to-[var(--background)] flex flex-col items-center justify-center p-1.5 relative overflow-hidden">
                    {/* Decorative corner flourishes */}
                    <div className="badge-flourish-tl absolute top-0.5 left-0.5 w-2 h-2 border-t border-l border-[var(--accent)]/40 rounded-tl" />
                    <div className="badge-flourish-tr absolute top-0.5 right-0.5 w-2 h-2 border-t border-r border-[var(--accent)]/40 rounded-tr" />
                    <div className="badge-flourish-bl absolute bottom-0.5 left-0.5 w-2 h-2 border-b border-l border-[var(--accent)]/40 rounded-bl" />
                    <div className="badge-flourish-br absolute bottom-0.5 right-0.5 w-2 h-2 border-b border-r border-[var(--accent)]/40 rounded-br" />
                    
                    {/* Badge icon */}
                    <div className="badge-icon text-[var(--accent)] mb-0.5">
                      {getQuestionIcon(question.type)}
                    </div>
                    
                    {/* Question number */}
                    <span className="badge-number text-[10px] font-serif font-bold text-[var(--foreground)]">
                      #{index + 1}
                    </span>
                  </div>
                </div>
                
                {/* Tooltip on hover */}
                <div className="badge-tooltip absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5 bg-[var(--foreground)] text-[var(--background)] text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none max-w-[120px] truncate">
                  {question.title}
                  <div className="badge-tooltip-arrow absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[var(--foreground)]" />
                </div>
              </div>
            ) : (
              <div className="badge-locked aspect-square rounded-xl bg-[var(--card-border)] p-0.5">
                <div className="badge-locked-inner w-full h-full rounded-[10px] bg-[var(--card-bg)] flex items-center justify-center p-2">
                  <RandomQR seed={index} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {showProgressMessage && (
        <p className="badges-grid-progress text-center text-xs text-[var(--foreground)]/60 font-serif italic">
          {answeredCount === totalQuestions 
            ? "🎉 Has completat totes les preguntes!"
            : answeredCount > 0 
              ? "Continua buscant QRs per desvetllar més insígnies!"
              : "Escaneja el primer QR per començar!"}
        </p>
      )}
    </div>
  );
}

// Hook to get badges stats
export function useBadgesStats(teamId: string | undefined) {
  const [stats, setStats] = useState({ answered: 0, total: 0, loading: true });

  useEffect(() => {
    const fetchStats = async () => {
      if (!teamId) {
        setStats({ answered: 0, total: 0, loading: false });
        return;
      }

      const { data: questionsData } = await supabase
        .from('questions')
        .select('id')
        .eq('active', true);

      const { data: answersData } = await supabase
        .from('answers')
        .select('id')
        .eq('team_id', teamId);

      setStats({
        answered: answersData?.length || 0,
        total: questionsData?.length || 0,
        loading: false
      });
    };

    fetchStats();
  }, [teamId]);

  return stats;
}
