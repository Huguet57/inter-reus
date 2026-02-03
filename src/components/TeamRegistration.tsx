'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { PenTool } from 'lucide-react';

interface TeamRegistrationProps {
  onRegister: (teamName: string) => Promise<void>;
}

export default function TeamRegistration({ onRegister }: TeamRegistrationProps) {
  const [teamName, setTeamName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName.trim()) {
      setError('Has de posar un nom d\'equip!');
      return;
    }

    if (teamName.trim().length < 2) {
      setError('El nom ha de tenir almenys 2 caràcters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onRegister(teamName.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en registrar l\'equip');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card variant="ornate" className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8 border-b border-[var(--card-border)] pb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--primary)]/5 text-[var(--primary)] mb-4">
            <PenTool size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-[var(--primary)] mb-2">
            Registre d'Equip
          </h1>
          <p className="text-[var(--foreground)]/60 font-serif italic text-sm">
            Document oficial de participació
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Input
            label="NOM DE L'EQUIP"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Escriu el nom aquí..."
            disabled={isLoading}
            maxLength={50}
            autoFocus
            error={error}
          />

          <Button
            type="submit"
            disabled={isLoading}
            fullWidth
            size="lg"
            className="mt-4"
          >
            {isLoading ? 'Processant...' : 'Signar i Registrar'}
          </Button>
        </form>

        <p className="text-center text-[var(--foreground)]/40 text-xs font-serif italic mt-6">
          * Aquest dispositiu quedarà vinculat a l'equip registrat.
        </p>
      </Card>
    </div>
  );
}
