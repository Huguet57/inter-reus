'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

export default function QRGenerator({ value, size = 200, className = '' }: QRGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff',
        },
      });
    }
  }, [value, size]);

  const downloadQR = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `qr-${value.split('/').pop()}.png`;
      link.href = url;
      link.click();
    }
  };

  return (
    <div className={`qr-generator-container flex flex-col items-center gap-3 ${className}`}>
      <canvas ref={canvasRef} className="qr-generator-canvas rounded-lg" />
      <button
        onClick={downloadQR}
        className="qr-generator-download text-sm text-[var(--primary)] hover:text-[var(--primary-dark)] underline transition-colors"
      >
        Descarregar QR
      </button>
    </div>
  );
}
