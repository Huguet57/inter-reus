'use client';

import { useState } from 'react';
import { QuestionProps } from '@/types';

export default function MultipleChoice({ question, onSubmit, disabled, isSubmitting }: QuestionProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const options = question.options || [];

  const handleSubmit = async () => {
    if (!selected || disabled || isSubmitting) return;
    
    const isCorrect = question.correct_answer === selected;
    await onSubmit({ 
      answer_text: selected,
      is_correct: isCorrect
    });
  };

  const getOptionLabel = (index: number): string => {
    return String.fromCharCode(65 + index); // A, B, C, D...
  };

  return (
    <div className="multiple-choice-question space-y-6">
      <div className="multiple-choice-options space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setSelected(option)}
            disabled={disabled || isSubmitting}
            className={`multiple-choice-option w-full p-4 rounded-xl border-2 text-left transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center gap-4 ${
              selected === option
                ? 'border-[var(--primary)] bg-[var(--primary)]/20 text-white'
                : 'border-[var(--card-border)] bg-[var(--card-bg)] text-gray-300 hover:border-[var(--primary)]/50'
            } ${disabled || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className={`multiple-choice-label w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
              selected === option
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--background)] text-gray-400'
            }`}>
              {getOptionLabel(index)}
            </span>
            <span className="multiple-choice-text flex-1">{option}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!selected || disabled || isSubmitting}
        className="multiple-choice-submit w-full py-4 bg-[var(--secondary)] hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {isSubmitting ? 'Enviant...' : 'Confirmar Resposta ✨'}
      </button>
    </div>
  );
}
