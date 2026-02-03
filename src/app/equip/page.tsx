'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getOrCreateDeviceId } from '@/lib/device-id';
import TeamRegistration from '@/components/TeamRegistration';
import { Team } from '@/types';

export default function EquipPage() {
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

  const handleRegister = async (teamName: string) => {
    const deviceId = getOrCreateDeviceId();
    if (!deviceId) {
      throw new Error('No s\'ha pogut identificar el dispositiu');
    }

    // Check if device already has a team
    const { data: existingTeam } = await supabase
      .from('teams')
      .select('*')
      .eq('device_id', deviceId)
      .single();

    if (existingTeam) {
      setTeam(existingTeam);
      return;
    }

    // Check if team name is taken
    const { data: nameExists } = await supabase
      .from('teams')
      .select('id')
      .eq('name', teamName)
      .single();

    if (nameExists) {
      throw new Error('Aquest nom d\'equip ja existeix. Prova\'n un altre!');
    }

    // Create new team
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

  if (loading) {
    return (
      <div className="equip-loading min-h-screen flex items-center justify-center">
        <div className="equip-loading-spinner animate-spin w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (team) {
    return (
      <div className="equip-registered min-h-screen flex items-center justify-center p-4">
        <div className="equip-registered-card w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8 text-center animate-fade-in">
          <div className="equip-registered-icon text-6xl mb-4">✅</div>
          <h1 className="equip-registered-title text-2xl font-bold text-white mb-2">
            Ja tens equip!
          </h1>
          <p className="equip-registered-team-name text-3xl font-bold text-[var(--primary)] mb-6">
            {team.name}
          </p>
          <p className="equip-registered-info text-gray-400 mb-8">
            Ara busca els QRs i comença a respondre preguntes!
          </p>
          <button
            onClick={() => router.push('/')}
            className="equip-registered-btn w-full py-4 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Tornar a l&apos;inici 🏠
          </button>
        </div>
      </div>
    );
  }

  return <TeamRegistration onRegister={handleRegister} />;
}
