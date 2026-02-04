'use client';

import { useState } from 'react';
import { QuestionProps } from '@/types';

export default function TrueFalseQuestion({ question, onSubmit, disabled, isSubmitting }: QuestionProps) {
  const [selected, setSelected] = useState<'true' | 'false' | null>(null);

  const handleSubmit = async () => {
    if (!selected || disabled || isSubmitting) return;
    
    const isCorrect = question.correct_answer === selected;
    await onSubmit({ 
      answer_text: selected,
      is_correct: isCorrect
    });
  };

  return (
    <div className="true-false-question space-y-6">
      <div className="true-false-options grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setSelected('true')}
          disabled={disabled || isSubmitting}
          className={`true-false-option-true p-6 rounded-xl border-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
            selected === 'true'
              ? 'border-[var(--secondary)] bg-[var(--secondary)]/20 text-[var(--secondary)]'
              : 'border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] hover:border-[var(--secondary)]/50'
          } ${disabled || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="true-false-icon text-4xl mb-2">✓</div>
          <div className="true-false-label font-semibold text-lg">Veritat</div>
        </button>

        <button
          type="button"
          onClick={() => setSelected('false')}
          disabled={disabled || isSubmitting}
          className={`true-false-option-false p-6 rounded-xl border-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
            selected === 'false'
              ? 'border-[var(--error)] bg-[var(--error)]/20 text-[var(--error)]'
              : 'border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] hover:border-[var(--error)]/50'
          } ${disabled || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="true-false-icon text-4xl mb-2">✗</div>
          <div className="true-false-label font-semibold text-lg">Fals</div>
        </button>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!selected || disabled || isSubmitting}
        className="true-false-submit w-full py-4 bg-[var(--secondary)] hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {isSubmitting ? 'Enviant...' : 'Confirmar Resposta ✨'}
      </button>
    </div>
  );
}
