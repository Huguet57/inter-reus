'use client';

import { useState } from 'react';
import { QuestionProps } from '@/types';
import { Button } from '@/components/ui/Button';

export default function TextQuestion({ question, onSubmit, disabled, isSubmitting }: QuestionProps) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || disabled || isSubmitting) return;
    
    await onSubmit({ answer_text: answer.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="relative">
        <label 
          htmlFor="answer" 
          className="block text-sm font-serif font-medium text-[var(--foreground)]/60 mb-2 uppercase tracking-widest"
        >
          La teva resposta
        </label>
        
        <div className="relative">
          {/* Paper lines effect */}
          <div className="absolute inset-0 pointer-events-none opacity-10" 
               style={{
                 backgroundImage: 'linear-gradient(transparent 95%, var(--foreground) 95%)',
                 backgroundSize: '100% 2rem',
                 marginTop: '1.5rem'
               }}>
          </div>

          <textarea
            id="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Escriu aquí..."
            rows={6}
            disabled={disabled || isSubmitting}
            className="w-full px-4 py-3 bg-[var(--card-bg)] border-2 border-[var(--card-border)] rounded-sm text-[var(--foreground)] placeholder-[var(--foreground)]/30 focus:outline-none focus:border-[var(--primary)] transition-all resize-none font-serif text-lg leading-8"
            maxLength={1000}
            style={{ lineHeight: '2rem' }}
          />
        </div>
        
        <div className="text-right text-xs text-[var(--foreground)]/40 mt-2 font-mono">
          {answer.length}/1000
        </div>
      </div>

      <Button
        type="submit"
        disabled={!answer.trim() || disabled || isSubmitting}
        fullWidth
        size="lg"
        variant="secondary"
      >
        {isSubmitting ? 'Enviant...' : 'Enviar Resposta'}
      </Button>
    </form>
  );
}
