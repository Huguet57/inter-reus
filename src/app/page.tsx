'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getOrCreateDeviceId } from '@/lib/device-id';
import { Team } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MapPin, ScanLine, HelpCircle, Trophy, Target, Users, ArrowRight } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center animate-fade-in space-y-8">
        
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] mb-4 border-2 border-[var(--primary)]/20">
            <Target size={40} strokeWidth={1.5} />
          </div>
          <h1 className="text-5xl font-serif font-bold text-[var(--primary)] leading-tight tracking-tight">
            Joc QR <br/> Interactiu
          </h1>
          <p className="text-[var(--foreground)]/70 text-lg font-serif italic">
            Troba els QRs, respon les preguntes i guanya!
          </p>
        </div>

        {team ? (
          <div className="space-y-6 animate-slide-up stagger-1">
            <Card variant="ornate" className="text-left">
              <div className="flex items-center gap-3 mb-2 opacity-60">
                <Users size={16} />
                <span className="text-sm font-serif uppercase tracking-widest">El teu equip</span>
              </div>
              <p className="text-3xl font-serif font-bold text-[var(--primary)]">{team.name}</p>
            </Card>

            <div className="space-y-4">
              <h2 className="text-xl font-serif font-bold text-[var(--secondary)] flex items-center justify-center gap-2">
                <span className="w-8 h-[1px] bg-[var(--secondary)]/40"></span>
                Com jugar?
                <span className="w-8 h-[1px] bg-[var(--secondary)]/40"></span>
              </h2>
              
              <div className="grid gap-3 text-left">
                {[
                  { icon: MapPin, text: "Busca els codis QR per la zona" },
                  { icon: ScanLine, text: "Escaneja'ls amb el teu mòbil" },
                  { icon: HelpCircle, text: "Respon les preguntes" },
                  { icon: Trophy, text: "Acumula punts i guanya!" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)]/50">
                    <div className="w-8 h-8 rounded-full bg-[var(--secondary)]/10 text-[var(--secondary)] flex items-center justify-center shrink-0">
                      <item.icon size={16} />
                    </div>
                    <span className="text-[var(--foreground)]/80 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-slide-up stagger-1">
            <Card className="bg-[var(--accent)]/5 border-[var(--accent)]/20">
              <p className="text-[var(--foreground)]/80 font-medium flex items-center justify-center gap-2">
                <span className="text-[var(--accent)]">⚠️</span> 
                Encara no tens equip.
              </p>
            </Card>
            
            <Button 
              onClick={() => router.push('/equip')}
              fullWidth
              size="lg"
              className="group"
            >
              <span className="flex items-center justify-center gap-2">
                Crear Equip Ara 
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </div>
        )}

        <div className="mt-12 text-[var(--foreground)]/40 text-sm font-serif italic">
          <p>Bona sort i que comenci el joc!</p>
        </div>
      </div>
    </main>
  );
}
