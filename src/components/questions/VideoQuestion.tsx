'use client';

import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { QuestionProps } from '@/types';

export default function VideoQuestion({ question, onSubmit, disabled, isSubmitting }: QuestionProps) {
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = useCallback(() => {
    chunksRef.current = [];
    const stream = webcamRef.current?.video?.srcObject as MediaStream;
    if (!stream) return;

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm',
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setRecordedVideo(url);
      const file = new File([blob], `video-${Date.now()}.webm`, { type: 'video/webm' });
      setUploadedFile(file);
      setShowCamera(false);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setRecordedVideo(url);
      setShowCamera(false);
    }
  };

  const handleSubmit = async () => {
    if (!uploadedFile || disabled || isSubmitting) return;
    await onSubmit({ answer_file: uploadedFile });
  };

  const resetVideo = () => {
    if (recordedVideo) {
      URL.revokeObjectURL(recordedVideo);
    }
    setRecordedVideo(null);
    setUploadedFile(null);
    setShowCamera(false);
    setIsRecording(false);
  };

  return (
    <div className="video-question space-y-6">
      {!recordedVideo && !showCamera && (
        <div className="video-question-options grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setShowCamera(true)}
            disabled={disabled || isSubmitting}
            className="video-question-record-btn p-6 rounded-xl border-2 border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] hover:border-[var(--primary)] transition-all transform hover:scale-[1.02]"
          >
            <div className="video-question-icon text-4xl mb-2">🎥</div>
            <div className="video-question-label font-semibold">Gravar Vídeo</div>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isSubmitting}
            className="video-question-upload-btn p-6 rounded-xl border-2 border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] hover:border-[var(--primary)] transition-all transform hover:scale-[1.02]"
          >
            <div className="video-question-icon text-4xl mb-2">📁</div>
            <div className="video-question-label font-semibold">Pujar Vídeo</div>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {showCamera && (
        <div className="video-question-camera-container space-y-4">
          <div className="video-question-webcam-wrapper relative rounded-xl overflow-hidden">
            <Webcam
              ref={webcamRef}
              audio={true}
              muted={true}
              videoConstraints={{
                facingMode: 'environment',
                width: 1280,
                height: 720,
              }}
              className="w-full rounded-xl"
            />
            {isRecording && (
              <div className="video-question-recording-indicator absolute top-4 left-4 flex items-center gap-2 bg-[var(--error)] px-3 py-1 rounded-full">
                <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                <span className="text-white text-sm font-medium">Gravant...</span>
              </div>
            )}
          </div>
          <div className="video-question-camera-controls grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                if (isRecording) stopRecording();
                setShowCamera(false);
              }}
              className="video-question-cancel-btn py-3 border border-[var(--card-border)] rounded-xl text-[var(--foreground)] hover:bg-[var(--card-bg)] transition-all"
            >
              Cancel·lar
            </button>
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="video-question-start-btn py-3 bg-[var(--error)] hover:bg-red-600 rounded-xl text-white font-semibold transition-all"
              >
                ⏺ Iniciar
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="video-question-stop-btn py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] rounded-xl text-white font-semibold transition-all"
              >
                ⏹ Aturar
              </button>
            )}
          </div>
        </div>
      )}

      {recordedVideo && (
        <div className="video-question-preview space-y-4">
          <div className="video-question-video-wrapper relative rounded-xl overflow-hidden">
            <video 
              src={recordedVideo} 
              controls 
              className="w-full rounded-xl"
            />
            <button
              type="button"
              onClick={resetVideo}
              className="video-question-remove-btn absolute top-2 right-2 w-10 h-10 bg-[var(--error)] rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-all"
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
        className="video-question-submit w-full py-4 bg-[var(--secondary)] hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {isSubmitting ? 'Pujant vídeo...' : 'Enviar Vídeo 🎬'}
      </button>
    </div>
  );
}
