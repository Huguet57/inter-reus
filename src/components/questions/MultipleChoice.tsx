'use client';

import { useState } from 'react';
import { QuestionProps } from '@/types';
import { Button } from '@/components/ui/Button';
import { Check } from 'lucide-react';

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
    <div className="space-y-8">
      <div className="grid gap-4">
        {options.map((option, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setSelected(option)}
            disabled={disabled || isSubmitting}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-300 group relative overflow-hidden ${
              selected === option
                ? 'border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)] shadow-md'
                : 'border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] hover:border-[var(--primary)]/30'
            } ${disabled || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-4 relative z-10">
              <span className={`w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold text-lg transition-colors ${
                selected === option
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--background)] text-[var(--foreground)]/60 group-hover:text-[var(--primary)]'
              }`}>
                {getOptionLabel(index)}
              </span>
              <span className="flex-1 font-medium text-lg">{option}</span>
              {selected === option && (
                <Check className="text-[var(--primary)] animate-fade-in" size={24} />
              )}
            </div>
            
            {/* Decorative corner for selected state */}
            {selected === option && (
              <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--primary)]/5 -mr-8 -mt-8 rounded-full blur-xl"></div>
            )}
          </button>
        ))}
      </div>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!selected || disabled || isSubmitting}
        fullWidth
        size="lg"
        variant="secondary"
      >
        {isSubmitting ? 'Enviant...' : 'Confirmar Resposta'}
      </Button>
    </div>
  );
}
