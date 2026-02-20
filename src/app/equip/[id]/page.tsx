'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Team } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BadgesGrid, useBadgesStats } from '@/components/BadgesGrid';
import { CheckCircle, Home, Star, Trophy } from 'lucide-react';
import { MembersList } from '@/components/MembersList';

export default function EquipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const badgesStats = useBadgesStats(team?.id);

  useEffect(() => {
    const loadTeam = async () => {
      const { data } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (data) {
        setTeam(data);
      }
      setLoading(false);
    };

    loadTeam();
  }, [teamId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="equip-detail-not-found w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8 text-center animate-fade-in">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            Equip no trobat
          </h1>
          <p className="text-[var(--foreground)]/60 mb-6">Aquest equip no existeix.</p>
          <Button
            onClick={() => router.push('/')}
            fullWidth
          >
            Tornar a l&apos;inici 🏠
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Team Header */}
        <Card variant="ornate" className="text-center animate-fade-in mb-8">
          <div className="flex justify-center mb-4">
            <div className="equip-detail-badge-header w-14 h-14 rounded-full bg-[var(--secondary)]/10 text-[var(--secondary)] flex items-center justify-center">
              <CheckCircle size={28} />
            </div>
          </div>
          
          <h1 className="text-xl font-serif font-bold text-[var(--foreground)] mb-1">
            Equip
          </h1>
          
          <p className="text-2xl font-serif font-bold text-[var(--primary)] mb-2">
            {team.name}
          </p>

          {team.members && team.members.length > 0 && (
            <div className="mb-3 border-t border-[var(--card-border)]/50 pt-3">
              <MembersList members={team.members} variant="list" />
            </div>
          )}

          {!badgesStats.loading && badgesStats.total > 0 && (
            <div className="equip-detail-progress-bar flex items-center justify-center gap-2 text-sm text-[var(--foreground)]/70">
              <Star size={16} className="text-[var(--accent)]" />
              <span>{badgesStats.answered} de {badgesStats.total} preguntes</span>
            </div>
          )}
        </Card>

        {/* Badges Grid */}
        <div className="mb-8">
          <BadgesGrid teamId={team.id} columns={3} />
        </div>
        
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={() => router.push('/classificacio')}
            fullWidth
          >
            <span className="flex items-center justify-center gap-2">
              <Trophy size={16} />
              Classificació
            </span>
          </Button>

          <Button
            onClick={() => router.push('/')}
            fullWidth
            variant="secondary"
          >
            <span className="flex items-center justify-center gap-2">
              <Home size={18} />
              Tornar a l&apos;inici
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
