'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Question, QuestionType } from '@/types';
import QRGenerator from '@/components/QRGenerator';

export default function PreguntesPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedQR, setSelectedQR] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'text' as QuestionType,
    options: ['', '', '', ''],
    correct_answer: '',
    points: 10,
    active: true,
  });

  useEffect(() => {
    const authStatus = sessionStorage.getItem('admin-auth');
    if (authStatus !== 'true') {
      router.push('/admin');
      return;
    }
    loadQuestions();
  }, [router]);

  const loadQuestions = async () => {
    const { data } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });
    
    setQuestions(data || []);
    setLoading(false);
  };

  const generateQRCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'text',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 10,
      active: true,
    });
    setEditingQuestion(null);
    setShowForm(false);
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      title: question.title,
      description: question.description,
      type: question.type,
      options: question.options || ['', '', '', ''],
      correct_answer: question.correct_answer || '',
      points: question.points,
      active: question.active,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const questionData = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      options: formData.type === 'multiple_choice' ? formData.options.filter(o => o.trim()) : null,
      correct_answer: ['true_false', 'multiple_choice'].includes(formData.type) ? formData.correct_answer : null,
      points: formData.points,
      active: formData.active,
    };

    if (editingQuestion) {
      await supabase
        .from('questions')
        .update(questionData)
        .eq('id', editingQuestion.id);
    } else {
      await supabase
        .from('questions')
        .insert({
          ...questionData,
          qr_code: generateQRCode(),
        });
    }

    resetForm();
    loadQuestions();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Segur que vols eliminar aquesta pregunta?')) return;
    
    await supabase.from('questions').delete().eq('id', id);
    loadQuestions();
  };

  const toggleActive = async (question: Question) => {
    await supabase
      .from('questions')
      .update({ active: !question.active })
      .eq('id', question.id);
    loadQuestions();
  };

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  };

  const getTypeLabel = (type: QuestionType) => {
    const labels: Record<QuestionType, string> = {
      text: '✍️ Text',
      photo: '📷 Foto',
      video: '🎥 Vídeo',
      true_false: '✓/✗ V/F',
      multiple_choice: '🔘 Múltiple',
    };
    return labels[type];
  };

  if (loading) {
    return (
      <div className="preguntes-loading min-h-screen flex items-center justify-center">
        <div className="preguntes-loading-spinner animate-spin w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="preguntes-page min-h-screen p-4 md:p-8">
      <div className="preguntes-content max-w-6xl mx-auto">
        <div className="preguntes-header flex items-center justify-between mb-8">
          <div className="preguntes-header-left flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="preguntes-back text-gray-400 hover:text-white transition-colors"
            >
              ← Tornar
            </button>
            <h1 className="preguntes-title text-2xl font-bold text-white">
              Gestionar Preguntes
            </h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="preguntes-add-btn px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold rounded-xl transition-all"
          >
            + Nova Pregunta
          </button>
        </div>

        {/* Question Form Modal */}
        {showForm && (
          <div className="preguntes-modal fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="preguntes-modal-content w-full max-w-2xl bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="preguntes-form-title text-xl font-bold text-white mb-6">
                {editingQuestion ? 'Editar Pregunta' : 'Nova Pregunta'}
              </h2>

              <form onSubmit={handleSubmit} className="preguntes-form space-y-4">
                <div>
                  <label className="preguntes-form-label block text-sm font-medium text-gray-300 mb-2">
                    Títol
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="preguntes-form-input w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="Ex: On es troba la plaça del Mercadal?"
                  />
                </div>

                <div>
                  <label className="preguntes-form-label block text-sm font-medium text-gray-300 mb-2">
                    Descripció / Instruccions
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="preguntes-form-textarea w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                    placeholder="Instruccions addicionals per als jugadors..."
                  />
                </div>

                <div className="preguntes-form-row grid grid-cols-2 gap-4">
                  <div>
                    <label className="preguntes-form-label block text-sm font-medium text-gray-300 mb-2">
                      Tipus de pregunta
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as QuestionType })}
                      className="preguntes-form-select w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    >
                      <option value="text">✍️ Resposta escrita</option>
                      <option value="photo">📷 Enviar foto</option>
                      <option value="video">🎥 Enviar vídeo</option>
                      <option value="true_false">✓/✗ Veritat o fals</option>
                      <option value="multiple_choice">🔘 Selecció múltiple</option>
                    </select>
                  </div>

                  <div>
                    <label className="preguntes-form-label block text-sm font-medium text-gray-300 mb-2">
                      Punts
                    </label>
                    <input
                      type="number"
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                      min="1"
                      max="100"
                      className="preguntes-form-input w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>
                </div>

                {formData.type === 'true_false' && (
                  <div>
                    <label className="preguntes-form-label block text-sm font-medium text-gray-300 mb-2">
                      Resposta correcta
                    </label>
                    <div className="preguntes-form-tf-options flex gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, correct_answer: 'true' })}
                        className={`preguntes-form-tf-btn flex-1 py-3 rounded-xl border-2 transition-all ${
                          formData.correct_answer === 'true'
                            ? 'border-[var(--secondary)] bg-[var(--secondary)]/20 text-[var(--secondary)]'
                            : 'border-[var(--card-border)] text-gray-400'
                        }`}
                      >
                        Veritat
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, correct_answer: 'false' })}
                        className={`preguntes-form-tf-btn flex-1 py-3 rounded-xl border-2 transition-all ${
                          formData.correct_answer === 'false'
                            ? 'border-[var(--error)] bg-[var(--error)]/20 text-[var(--error)]'
                            : 'border-[var(--card-border)] text-gray-400'
                        }`}
                      >
                        Fals
                      </button>
                    </div>
                  </div>
                )}

                {formData.type === 'multiple_choice' && (
                  <div>
                    <label className="preguntes-form-label block text-sm font-medium text-gray-300 mb-2">
                      Opcions (marca la correcta)
                    </label>
                    <div className="preguntes-form-mc-options space-y-2">
                      {formData.options.map((option, index) => (
                        <div key={index} className="preguntes-form-mc-option flex items-center gap-2">
                          <input
                            type="radio"
                            name="correct"
                            checked={formData.correct_answer === option && option !== ''}
                            onChange={() => setFormData({ ...formData, correct_answer: option })}
                            className="preguntes-form-mc-radio"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...formData.options];
                              newOptions[index] = e.target.value;
                              setFormData({ ...formData, options: newOptions });
                            }}
                            placeholder={`Opció ${String.fromCharCode(65 + index)}`}
                            className="preguntes-form-mc-input flex-1 px-4 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="preguntes-form-active flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="preguntes-form-checkbox w-5 h-5 rounded"
                  />
                  <label htmlFor="active" className="text-gray-300">
                    Pregunta activa
                  </label>
                </div>

                <div className="preguntes-form-actions flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="preguntes-form-cancel flex-1 py-3 border border-[var(--card-border)] rounded-xl text-gray-300 hover:bg-[var(--card-bg)] transition-all"
                  >
                    Cancel·lar
                  </button>
                  <button
                    type="submit"
                    className="preguntes-form-submit flex-1 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold rounded-xl transition-all"
                  >
                    {editingQuestion ? 'Guardar Canvis' : 'Crear Pregunta'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* QR Modal */}
        {selectedQR && (
          <div className="preguntes-qr-modal fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedQR(null)}>
            <div className="preguntes-qr-content bg-white rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
              <QRGenerator value={`${getBaseUrl()}/pregunta/${selectedQR}`} size={250} />
              <p className="text-center text-gray-600 mt-4 text-sm">
                {`${getBaseUrl()}/pregunta/${selectedQR}`}
              </p>
              <button
                onClick={() => setSelectedQR(null)}
                className="preguntes-qr-close w-full mt-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 transition-all"
              >
                Tancar
              </button>
            </div>
          </div>
        )}

        {/* Questions List */}
        {questions.length === 0 ? (
          <div className="preguntes-empty bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-12 text-center">
            <div className="preguntes-empty-icon text-6xl mb-4">📝</div>
            <p className="preguntes-empty-text text-gray-400">
              Encara no hi ha preguntes. Crea la primera!
            </p>
          </div>
        ) : (
          <div className="preguntes-list space-y-4">
            {questions.map((question) => (
              <div
                key={question.id}
                className={`preguntes-item bg-[var(--card-bg)] border rounded-xl p-6 ${
                  question.active ? 'border-[var(--card-border)]' : 'border-[var(--error)]/30 opacity-60'
                }`}
              >
                <div className="preguntes-item-header flex items-start justify-between mb-4">
                  <div className="preguntes-item-info">
                    <div className="preguntes-item-badges flex items-center gap-2 mb-2">
                      <span className="preguntes-item-type px-2 py-1 bg-[var(--primary)]/20 text-[var(--primary)] rounded-lg text-xs font-medium">
                        {getTypeLabel(question.type)}
                      </span>
                      <span className="preguntes-item-points px-2 py-1 bg-[var(--accent)]/20 text-[var(--accent)] rounded-lg text-xs font-medium">
                        {question.points} pts
                      </span>
                      {!question.active && (
                        <span className="preguntes-item-inactive px-2 py-1 bg-[var(--error)]/20 text-[var(--error)] rounded-lg text-xs font-medium">
                          Inactiva
                        </span>
                      )}
                    </div>
                    <h3 className="preguntes-item-title text-lg font-semibold text-white">
                      {question.title}
                    </h3>
                    {question.description && (
                      <p className="preguntes-item-desc text-gray-400 text-sm mt-1">
                        {question.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="preguntes-item-actions flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedQR(question.qr_code)}
                    className="preguntes-item-qr px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-all"
                  >
                    📱 QR
                  </button>
                  <button
                    onClick={() => handleEdit(question)}
                    className="preguntes-item-edit px-4 py-2 bg-[var(--primary)]/20 hover:bg-[var(--primary)]/30 text-[var(--primary)] rounded-lg text-sm transition-all"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => toggleActive(question)}
                    className={`preguntes-item-toggle px-4 py-2 rounded-lg text-sm transition-all ${
                      question.active
                        ? 'bg-[var(--accent)]/20 hover:bg-[var(--accent)]/30 text-[var(--accent)]'
                        : 'bg-[var(--secondary)]/20 hover:bg-[var(--secondary)]/30 text-[var(--secondary)]'
                    }`}
                  >
                    {question.active ? '⏸️ Desactivar' : '▶️ Activar'}
                  </button>
                  <button
                    onClick={() => handleDelete(question.id)}
                    className="preguntes-item-delete px-4 py-2 bg-[var(--error)]/20 hover:bg-[var(--error)]/30 text-[var(--error)] rounded-lg text-sm transition-all"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
