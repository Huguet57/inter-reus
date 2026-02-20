'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getOrCreateDeviceId } from '@/lib/device-id';
import TeamRegistration from '@/components/TeamRegistration';

export default function EquipPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasTeam, setHasTeam] = useState(false);

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
        setHasTeam(true);
        router.replace(`/equip/${data.id}`);
        return;
      }
      setLoading(false);
    };

    checkTeam();
  }, [router]);

  const handleRegister = async (teamName: string, members: string[]) => {
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
      router.replace(`/equip/${existingTeam.id}`);
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
        members: members,
      })
      .select()
      .single();

    if (error) {
      throw new Error('Error en crear l\'equip. Torna-ho a provar.');
    }

    router.replace(`/equip/${newTeam.id}`);
  };

  if (loading || hasTeam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return <TeamRegistration onRegister={handleRegister} />;
}
