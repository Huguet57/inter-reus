'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, uploadFile } from '@/lib/supabase';
import { getOrCreateDeviceId } from '@/lib/device-id';
import TeamRegistration from '@/components/TeamRegistration';
import {
  TextQuestion,
  TrueFalseQuestion,
  MultipleChoice,
  PhotoQuestion,
  VideoQuestion,
} from '@/components/questions';
import { Team, Question, Answer, AnswerPayload } from '@/types';
import { evaluateTextAnswer } from '@/lib/auto-correct';

export default function PreguntaPage() {
  const params = useParams();
  const router = useRouter();
  const qrCode = params.qrCode as string;

  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<Team | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [existingAnswer, setExistingAnswer] = useState<Answer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const deviceId = getOrCreateDeviceId();
      if (!deviceId) {
        setLoading(false);
        return;
      }

      // Get team
      const { data: teamData } = await supabase
        .from('teams')
        .select('*')
        .eq('device_id', deviceId)
        .single();

      if (teamData) {
        setTeam(teamData);
      }

      // Get question
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .select('*')
        .eq('qr_code', qrCode)
        .eq('active', true)
        .single();

      if (questionError || !questionData) {
        setError('Aquesta pregunta no existeix o no està activa.');
        setLoading(false);
        return;
      }

      setQuestion(questionData);

      // Check if already answered
      if (teamData) {
        const { data: answerData } = await supabase
          .from('answers')
          .select('*')
          .eq('team_id', teamData.id)
          .eq('question_id', questionData.id)
          .single();

        if (answerData) {
          setExistingAnswer(answerData);
        }
      }

      setLoading(false);
    };

    loadData();
  }, [qrCode]);

  const handleRegister = async (teamName: string) => {
    const deviceId = getOrCreateDeviceId();
    if (!deviceId) {
      throw new Error('No s\'ha pogut identificar el dispositiu');
    }

    const { data: nameExists } = await supabase
      .from('teams')
      .select('id')
      .eq('name', teamName)
      .single();

    if (nameExists) {
      throw new Error('Aquest nom d\'equip ja existeix. Prova\'n un altre!');
    }

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

  const handleSubmit = async (answer: AnswerPayload) => {
    if (!team || !question || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      let fileUrl = null;

      // Upload file if present
      if (answer.answer_file) {
        const ext = answer.answer_file.name.split('.').pop();
        const path = `${team.id}/${question.id}/${Date.now()}.${ext}`;
        fileUrl = await uploadFile('answers', path, answer.answer_file);
        
        if (!fileUrl) {
          throw new Error('Error en pujar el fitxer');
        }
      }

      // Determine correctness
      let isCorrect: boolean | null = answer.is_correct ?? null;
      if (question.type === 'text' && answer.answer_text) {
        isCorrect = evaluateTextAnswer(answer.answer_text, question.correct_answer);
      }

      // Save answer
      const { error: insertError } = await supabase
        .from('answers')
        .insert({
          team_id: team.id,
          question_id: question.id,
          answer_text: answer.answer_text || null,
          answer_file_url: fileUrl,
          is_correct: isCorrect,
        });

      if (insertError) {
        throw new Error('Error en guardar la resposta');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconegut');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = () => {
    if (!question) return null;

    const props = {
      question,
      onSubmit: handleSubmit,
      disabled: !!existingAnswer || submitted,
      isSubmitting,
    };

    switch (question.type) {
      case 'text':
        return <TextQuestion {...props} />;
      case 'true_false':
        return <TrueFalseQuestion {...props} />;
      case 'multiple_choice':
        return <MultipleChoice {...props} />;
      case 'photo':
        return <PhotoQuestion {...props} />;
      case 'video':
        return <VideoQuestion {...props} />;
      default:
        return <p className="text-[var(--foreground)]/60">Tipus de pregunta no suportat</p>;
    }
  };

  if (loading) {
    return (
      <div className="pregunta-loading min-h-screen flex items-center justify-center">
        <div className="pregunta-loading-spinner animate-spin w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error && !question) {
    return (
      <div className="pregunta-error min-h-screen flex items-center justify-center p-4">
        <div className="pregunta-error-card w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8 text-center animate-fade-in">
          <div className="pregunta-error-icon text-6xl mb-4">❌</div>
          <h1 className="pregunta-error-title text-2xl font-bold text-[var(--foreground)] mb-2">
            Oops!
          </h1>
          <p className="pregunta-error-message text-[var(--foreground)]/60 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="pregunta-error-btn w-full py-4 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold rounded-xl transition-all"
          >
            Tornar a l&apos;inici 🏠
          </button>
        </div>
      </div>
    );
  }

  if (!team) {
    return <TeamRegistration onRegister={handleRegister} />;
  }

  if (existingAnswer || submitted) {
    return (
      <div className="pregunta-answered min-h-screen flex items-center justify-center p-4">
        <div className="pregunta-answered-card w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8 text-center animate-fade-in">
          <div className="pregunta-answered-icon text-6xl mb-4">
            {submitted ? '🎉' : '✅'}
          </div>
          <h1 className="pregunta-answered-title text-2xl font-bold text-[var(--foreground)] mb-2">
            {submitted ? 'Resposta Enviada!' : 'Ja has respost!'}
          </h1>
          <p className="pregunta-answered-message text-[var(--foreground)]/60 mb-2">
            {submitted 
              ? 'Molt bé! La teva resposta s\'ha guardat correctament.' 
              : 'Ja havies respost aquesta pregunta anteriorment.'
            }
          </p>
          <p className="pregunta-answered-points text-[var(--secondary)] font-semibold mb-6">
            Ara valorarem la teva resposta...
          </p>
          {process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL && (
            <div className="pregunta-map mb-6">
              <p className="text-sm text-[var(--foreground)]/60 mb-2">
                📍 On buscar els altres QRs?
              </p>
              <iframe
                src={process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL}
                width="100%"
                height="300"
                style={{ border: 0, borderRadius: '12px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
          <button
            onClick={() => router.push('/')}
            className="pregunta-answered-btn w-full py-4 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold rounded-xl transition-all"
          >
            Continua buscant QRs! 🔍
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pregunta-page min-h-screen flex items-center justify-center p-4">
      <div className="pregunta-card w-full max-w-lg bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 animate-fade-in">
        <div className="pregunta-header mb-6">
          <div className="pregunta-team-badge inline-flex items-center gap-2 bg-[var(--primary)]/20 text-[var(--primary)] px-3 py-1 rounded-full text-sm mb-4">
            <span>👥</span>
            <span>{team.name}</span>
          </div>
          
          <h1 className="pregunta-title text-2xl font-bold text-[var(--foreground)] mb-2">
            {question?.title}
          </h1>
          
          {question?.description && (
            <p className="pregunta-description text-[var(--foreground)]/60">
              {question.description}
            </p>
          )}
          
          <div className="pregunta-points flex items-center gap-2 mt-4 text-[var(--secondary)]">
            <span>⭐</span>
            <span className="font-semibold">{question?.points} punts</span>
          </div>
        </div>

        {error && (
          <div className="pregunta-submit-error bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm mb-6">
            {error}
          </div>
        )}

        <div className="pregunta-content">
          {renderQuestion()}
        </div>
      </div>
    </div>
  );
}
