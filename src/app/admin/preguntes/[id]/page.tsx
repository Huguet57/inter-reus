'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditPreguntaPage() {
  const router = useRouter();
  const params = useParams();
  
  useEffect(() => {
    // Redirect to main preguntes page with edit mode
    // The editing is handled in the main page via modal
    router.push('/admin/preguntes');
  }, [router, params]);

  return (
    <div className="edit-pregunta-loading min-h-screen flex items-center justify-center">
      <div className="edit-pregunta-spinner animate-spin w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full"></div>
    </div>
  );
}
