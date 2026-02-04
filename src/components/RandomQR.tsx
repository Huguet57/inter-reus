'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface RandomQRProps {
  seed: number;
  size?: number;
  className?: string;
}

// Generate a random string based on seed
function generateRandomContent(seed: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  let currentSeed = seed;
  
  // Generate 8-12 character random string
  const length = 8 + (seed % 5);
  
  for (let i = 0; i < length; i++) {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const index = Math.floor((currentSeed / 233280) * chars.length);
    result += chars[index];
  }
  
  return result;
}

export function RandomQR({ seed, size = 100, className = '' }: RandomQRProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    const generateQR = async () => {
      const content = generateRandomContent(seed + 1000);
      
      try {
        const dataUrl = await QRCode.toDataURL(content, {
          width: size,
          margin: 0,
          color: {
            dark: '#2C2420',
            light: '#00000000', // transparent background
          },
          errorCorrectionLevel: 'L',
        });
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error('Error generating QR:', err);
      }
    };

    generateQR();
  }, [seed, size]);

  if (!qrDataUrl) {
    return (
      <div 
        className={`random-qr-placeholder bg-[var(--foreground)]/10 rounded ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <img 
      src={qrDataUrl} 
      alt="QR" 
      className={`random-qr-image opacity-30 ${className}`}
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
    />
  );
}
