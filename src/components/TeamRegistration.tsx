'use client';

import { useState } from 'react';

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
    <div className="team-registration-container min-h-screen flex items-center justify-center p-4">
      <div className="team-registration-card w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8 animate-fade-in">
        <div className="team-registration-header text-center mb-8">
          <div className="team-registration-icon text-6xl mb-4">🎯</div>
          <h1 className="team-registration-title text-3xl font-bold text-white mb-2">
            Joc QR Interactiu
          </h1>
          <p className="team-registration-subtitle text-gray-400">
            Crea el teu equip per començar a jugar!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="team-registration-form space-y-6">
          <div className="team-registration-field">
            <label 
              htmlFor="teamName" 
              className="team-registration-label block text-sm font-medium text-gray-300 mb-2"
            >
              Nom de l&apos;equip
            </label>
            <input
              type="text"
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Els Campions..."
              className="team-registration-input w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              disabled={isLoading}
              maxLength={50}
              autoFocus
            />
          </div>

          {error && (
            <div className="team-registration-error bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="team-registration-button w-full py-4 bg-[var(--primary)] hover:bg-[var(--primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <span className="team-registration-loading flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creant equip...
              </span>
            ) : (
              'Crear Equip i Jugar! 🚀'
            )}
          </button>
        </form>

        <p className="team-registration-note text-center text-xs text-gray-500 mt-6">
          El teu equip estarà vinculat a aquest dispositiu
        </p>
      </div>
    </div>
  );
}
