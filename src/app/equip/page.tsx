'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getOrCreateDeviceId } from '@/lib/device-id';
import TeamRegistration from '@/components/TeamRegistration';
import { Team } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CheckCircle, Home } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (team) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card variant="ornate" className="w-full max-w-md text-center animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[var(--secondary)]/10 text-[var(--secondary)] flex items-center justify-center">
              <CheckCircle size={32} />
            </div>
          </div>
          
          <h1 className="text-2xl font-serif font-bold text-[var(--foreground)] mb-2">
            Ja tens equip!
          </h1>
          
          <div className="my-8 p-4 bg-[var(--background)] border border-[var(--card-border)] rounded-lg">
            <p className="text-sm text-[var(--foreground)]/60 font-serif uppercase tracking-widest mb-2">Equip Registrat</p>
            <p className="text-3xl font-serif font-bold text-[var(--primary)]">
              {team.name}
            </p>
          </div>
          
          <p className="text-[var(--foreground)]/70 mb-8 font-serif italic">
            Ara busca els QRs i comença a respondre preguntes!
          </p>
          
          <Button
            onClick={() => router.push('/')}
            fullWidth
            variant="secondary"
          >
            <span className="flex items-center justify-center gap-2">
              <Home size={18} />
              Tornar a l'inici
            </span>
          </Button>
        </Card>
      </div>
    );
  }

  return <TeamRegistration onRegister={handleRegister} />;
}
