'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getOrCreateDeviceId } from '@/lib/device-id';
import { Team } from '@/types';

export default function Home() {
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTeam = async () => {
      const deviceId = getOrCreateDeviceId();
      if (!deviceId) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('teams')
        .select('*')
        .eq('device_id', deviceId)
        .single();

      if (data) {
        setTeam(data);
      }
      setLoading(false);
    };

    checkTeam();
  }, []);

  if (loading) {
    return (
      <div className="home-loading min-h-screen flex items-center justify-center">
        <div className="home-loading-spinner animate-spin w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <main className="home-main min-h-screen flex items-center justify-center p-4">
      <div className="home-content w-full max-w-md text-center animate-fade-in">
        <div className="home-hero mb-8">
          <div className="home-icon text-8xl mb-6 animate-bounce-slow">🎯</div>
          <h1 className="home-title text-4xl font-bold text-white mb-4">
            Joc QR Interactiu
          </h1>
          <p className="home-subtitle text-gray-400 text-lg">
            Troba els QRs, respon les preguntes i guanya!
          </p>
        </div>

        {team ? (
          <div className="home-team-info space-y-6">
            <div className="home-team-card bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
              <p className="home-team-label text-gray-400 text-sm mb-1">El teu equip</p>
              <p className="home-team-name text-2xl font-bold text-[var(--primary)]">{team.name}</p>
            </div>
            <div className="home-instructions bg-[var(--secondary)]/10 border border-[var(--secondary)]/20 rounded-xl p-6">
              <h2 className="home-instructions-title text-lg font-semibold text-[var(--secondary)] mb-3">
                📍 Com jugar?
              </h2>
              <ol className="home-instructions-list text-left text-gray-300 space-y-2">
                <li className="home-instructions-item">1. Busca els codis QR repartits per la zona</li>
                <li className="home-instructions-item">2. Escaneja&apos;ls amb el teu mòbil</li>
                <li className="home-instructions-item">3. Respon les preguntes</li>
                <li className="home-instructions-item">4. Acumula punts!</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="home-no-team space-y-6">
            <div className="home-no-team-info bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-xl p-6">
              <p className="home-no-team-text text-[var(--accent)]">
                ⚠️ Encara no tens equip. Escaneja un QR per registrar-te!
              </p>
            </div>
            <button
              onClick={() => router.push('/equip')}
              className="home-register-btn w-full py-4 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Crear Equip Ara 🚀
            </button>
          </div>
        )}

        <div className="home-footer mt-12 text-gray-600 text-sm">
          <p>Bona sort i que comenci el joc! 🎮</p>
        </div>
      </div>
    </main>
  );
}
