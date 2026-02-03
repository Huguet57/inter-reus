'use client';

import { useState } from 'react';
import { QuestionProps } from '@/types';

export default function TextQuestion({ question, onSubmit, disabled, isSubmitting }: QuestionProps) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || disabled || isSubmitting) return;
    
    await onSubmit({ answer_text: answer.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="text-question-form space-y-6">
      <div className="text-question-field">
        <label 
          htmlFor="answer" 
          className="text-question-label block text-sm font-medium text-gray-300 mb-2"
        >
          La teva resposta
        </label>
        <textarea
          id="answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Escriu la teva resposta aquí..."
          rows={4}
          disabled={disabled || isSubmitting}
          className="text-question-textarea w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all resize-none"
          maxLength={1000}
        />
        <div className="text-question-counter text-right text-xs text-gray-500 mt-1">
          {answer.length}/1000
        </div>
      </div>

      <button
        type="submit"
        disabled={!answer.trim() || disabled || isSubmitting}
        className="text-question-submit w-full py-4 bg-[var(--secondary)] hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {isSubmitting ? 'Enviant...' : 'Enviar Resposta ✨'}
      </button>
    </form>
  );
}
