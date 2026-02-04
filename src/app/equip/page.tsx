'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getOrCreateDeviceId } from '@/lib/device-id';
import TeamRegistration from '@/components/TeamRegistration';
import { Team } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BadgesGrid, useBadgesStats } from '@/components/BadgesGrid';
import { CheckCircle, Home, Star } from 'lucide-react';

export default function EquipPage() {
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const badgesStats = useBadgesStats(team?.id);

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
      <div className="min-h-screen p-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Team Header */}
          <Card variant="ornate" className="text-center animate-fade-in mb-8">
            <div className="flex justify-center mb-4">
              <div className="equip-badge-header w-14 h-14 rounded-full bg-[var(--secondary)]/10 text-[var(--secondary)] flex items-center justify-center">
                <CheckCircle size={28} />
              </div>
            </div>
            
            <h1 className="text-xl font-serif font-bold text-[var(--foreground)] mb-1">
              Equip
            </h1>
            
            <p className="text-2xl font-serif font-bold text-[var(--primary)] mb-4">
              {team.name}
            </p>
            
            {!badgesStats.loading && badgesStats.total > 0 && (
              <div className="equip-progress-bar flex items-center justify-center gap-2 text-sm text-[var(--foreground)]/70">
                <Star size={16} className="text-[var(--accent)]" />
                <span>{badgesStats.answered} de {badgesStats.total} preguntes</span>
              </div>
            )}
          </Card>

          {/* Badges Grid */}
          <div className="mb-8">
            <BadgesGrid teamId={team.id} columns={3} />
          </div>
          
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
        </div>
      </div>
    );
  }

  return <TeamRegistration onRegister={handleRegister} />;
}
