'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { PenTool, Plus, X } from 'lucide-react';

const MAX_MEMBERS = 6;

interface TeamRegistrationProps {
  onRegister: (teamName: string, members: string[]) => Promise<void>;
}

export default function TeamRegistration({ onRegister }: TeamRegistrationProps) {
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const addMember = () => {
    if (members.length < MAX_MEMBERS) {
      setMembers([...members, '']);
    }
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, value: string) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

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

    const cleanMembers = members
      .map(m => m.trim())
      .filter(m => m.length > 0);

    setIsLoading(true);
    setError('');

    try {
      await onRegister(teamName.trim(), cleanMembers);
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
          <p className="text-[var(--foreground)]/50 text-xs mt-2">
            Registra el teu grup d'amics, no la colla sencera!
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

          {/* Members / Sobrenoms */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-serif font-medium text-[var(--foreground)] opacity-80">
                MEMBRES DE L&apos;EQUIP <span className="font-normal italic">(fins a 6 membres)</span>
              </label>
              <span className="text-xs text-[var(--foreground)]/40">
                {members.filter(m => m.trim()).length}/{MAX_MEMBERS}
              </span>
            </div>

            <p className="text-[var(--foreground)]/50 text-xs">
              Afegeix els sobrenoms dels castellers del teu equip
            </p>

            {members.map((member, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={member}
                  onChange={(e) => updateMember(index, e.target.value)}
                  placeholder={`Sobrenom ${['del primer', 'del segon', 'del tercer', 'del quart', 'del cinquè', 'del sisè'][index]} membre...`}
                  disabled={isLoading}
                  maxLength={30}
                />
                {members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMember(index)}
                    className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
                    disabled={isLoading}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}

            {members.length < MAX_MEMBERS && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addMember}
                disabled={isLoading}
                fullWidth
              >
                <span className="flex items-center justify-center gap-1">
                  <Plus size={14} />
                  Afegir membre
                </span>
              </Button>
            )}
          </div>

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
