'use client';

import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { QuestionProps } from '@/types';

export default function PhotoQuestion({ question, onSubmit, disabled, isSubmitting }: QuestionProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setShowCamera(false);
      // Convert base64 to file
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
          setUploadedFile(file);
        });
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setShowCamera(false);
    }
  };

  const handleSubmit = async () => {
    if (!uploadedFile || disabled || isSubmitting) return;
    await onSubmit({ answer_file: uploadedFile });
  };

  const resetImage = () => {
    setCapturedImage(null);
    setUploadedFile(null);
    setShowCamera(false);
  };

  return (
    <div className="photo-question space-y-6">
      {!capturedImage && !showCamera && (
        <div className="photo-question-options grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setShowCamera(true)}
            disabled={disabled || isSubmitting}
            className="photo-question-camera-btn p-6 rounded-xl border-2 border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] hover:border-[var(--primary)] transition-all transform hover:scale-[1.02]"
          >
            <div className="photo-question-icon text-4xl mb-2">📷</div>
            <div className="photo-question-label font-semibold">Fer Foto</div>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isSubmitting}
            className="photo-question-upload-btn p-6 rounded-xl border-2 border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] hover:border-[var(--primary)] transition-all transform hover:scale-[1.02]"
          >
            <div className="photo-question-icon text-4xl mb-2">📁</div>
            <div className="photo-question-label font-semibold">Pujar Foto</div>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {showCamera && (
        <div className="photo-question-camera-container space-y-4">
          <div className="photo-question-webcam-wrapper relative rounded-xl overflow-hidden">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode: 'environment',
                width: 1280,
                height: 720,
              }}
              className="w-full rounded-xl"
            />
          </div>
          <div className="photo-question-camera-controls grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setShowCamera(false)}
              className="photo-question-cancel-btn py-3 border border-[var(--card-border)] rounded-xl text-[var(--foreground)] hover:bg-[var(--card-bg)] transition-all"
            >
              Cancel·lar
            </button>
            <button
              type="button"
              onClick={capture}
              className="photo-question-capture-btn py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] rounded-xl text-white font-semibold transition-all"
            >
              📸 Capturar
            </button>
          </div>
        </div>
      )}

      {capturedImage && (
        <div className="photo-question-preview space-y-4">
          <div className="photo-question-image-wrapper relative rounded-xl overflow-hidden">
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="w-full rounded-xl"
            />
            <button
              type="button"
              onClick={resetImage}
              className="photo-question-remove-btn absolute top-2 right-2 w-10 h-10 bg-[var(--error)] rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-all"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!uploadedFile || disabled || isSubmitting}
        className="photo-question-submit w-full py-4 bg-[var(--secondary)] hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {isSubmitting ? 'Pujant foto...' : 'Enviar Foto 📸'}
      </button>
    </div>
  );
}
