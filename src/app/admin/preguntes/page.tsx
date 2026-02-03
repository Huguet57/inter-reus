'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Question, QuestionType } from '@/types';
import QRGenerator from '@/components/QRGenerator';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { 
  ArrowLeft, Plus, Edit2, Trash2, QrCode, Power, 
  Type, Image, Video, CheckSquare, List 
} from 'lucide-react';

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

  const getTypeIcon = (type: QuestionType) => {
    const icons = {
      text: <Type size={16} />,
      photo: <Image size={16} />,
      video: <Video size={16} />,
      true_false: <CheckSquare size={16} />,
      multiple_choice: <List size={16} />,
    };
    return icons[type];
  };

  const getTypeLabel = (type: QuestionType) => {
    const labels: Record<QuestionType, string> = {
      text: 'Text',
      photo: 'Foto',
      video: 'Vídeo',
      true_false: 'V/F',
      multiple_choice: 'Múltiple',
    };
    return labels[type];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Tornar
            </Button>
            <h1 className="text-2xl font-serif font-bold text-[var(--primary)]">
              Gestionar Preguntes
            </h1>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Nova Pregunta
          </Button>
        </div>

        {/* Question Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-serif font-bold text-[var(--foreground)] mb-6">
                {editingQuestion ? 'Editar Pregunta' : 'Nova Pregunta'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Títol"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Ex: On es troba la plaça del Mercadal?"
                />

                <div className="space-y-2">
                  <label className="block text-sm font-serif font-medium text-[var(--foreground)] opacity-80">
                    Descripció / Instruccions
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-2 py-3 bg-transparent border-b-2 border-[var(--card-border)] text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 focus:outline-none focus:border-[var(--primary)] transition-colors font-sans resize-none"
                    placeholder="Instruccions addicionals per als jugadors..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-serif font-medium text-[var(--foreground)] opacity-80">
                      Tipus de pregunta
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as QuestionType })}
                      className="w-full px-2 py-3 bg-transparent border-b-2 border-[var(--card-border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors font-sans"
                    >
                      <option value="text">✍️ Resposta escrita</option>
                      <option value="photo">📷 Enviar foto</option>
                      <option value="video">🎥 Enviar vídeo</option>
                      <option value="true_false">✓/✗ Veritat o fals</option>
                      <option value="multiple_choice">🔘 Selecció múltiple</option>
                    </select>
                  </div>

                  <Input
                    type="number"
                    label="Punts"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                    min={1}
                    max={100}
                  />
                </div>

                {formData.type === 'true_false' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-serif font-medium text-[var(--foreground)] opacity-80">
                      Resposta correcta
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, correct_answer: 'true' })}
                        className={`flex-1 py-3 rounded-lg border-2 transition-all font-medium ${
                          formData.correct_answer === 'true'
                            ? 'border-[var(--secondary)] bg-[var(--secondary)]/10 text-[var(--secondary)]'
                            : 'border-[var(--card-border)] text-[var(--foreground)]/60'
                        }`}
                      >
                        Veritat
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, correct_answer: 'false' })}
                        className={`flex-1 py-3 rounded-lg border-2 transition-all font-medium ${
                          formData.correct_answer === 'false'
                            ? 'border-[var(--error)] bg-[var(--error)]/10 text-[var(--error)]'
                            : 'border-[var(--card-border)] text-[var(--foreground)]/60'
                        }`}
                      >
                        Fals
                      </button>
                    </div>
                  </div>
                )}

                {formData.type === 'multiple_choice' && (
                  <div className="space-y-4">
                    <label className="block text-sm font-serif font-medium text-[var(--foreground)] opacity-80">
                      Opcions (marca la correcta)
                    </label>
                    <div className="space-y-3">
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="correct"
                            checked={formData.correct_answer === option && option !== ''}
                            onChange={() => setFormData({ ...formData, correct_answer: option })}
                            className="w-5 h-5 text-[var(--primary)] focus:ring-[var(--primary)]"
                          />
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...formData.options];
                              newOptions[index] = e.target.value;
                              setFormData({ ...formData, options: newOptions });
                            }}
                            placeholder={`Opció ${String.fromCharCode(65 + index)}`}
                            className="!mt-0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-5 h-5 rounded border-[var(--card-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <label htmlFor="active" className="text-[var(--foreground)]">
                    Pregunta activa
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={resetForm}
                    fullWidth
                  >
                    Cancel·lar
                  </Button>
                  <Button
                    type="submit"
                    fullWidth
                  >
                    {editingQuestion ? 'Guardar Canvis' : 'Crear Pregunta'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* QR Modal */}
        {selectedQR && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setSelectedQR(null)}>
            <Card className="bg-white p-8 max-w-sm w-full" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <div className="flex justify-center mb-6">
                <QRGenerator value={`${getBaseUrl()}/pregunta/${selectedQR}`} size={250} />
              </div>
              <p className="text-center text-gray-600 mb-6 text-sm break-all font-mono">
                {`${getBaseUrl()}/pregunta/${selectedQR}`}
              </p>
              <Button
                onClick={() => setSelectedQR(null)}
                fullWidth
                variant="secondary"
              >
                Tancar
              </Button>
            </Card>
          </div>
        )}

        {/* Questions List */}
        {questions.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-[var(--foreground)]/60 font-serif italic">
              Encara no hi ha preguntes. Crea la primera!
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <Card
                key={question.id}
                className={`transition-all ${
                  question.active ? '' : 'opacity-60 bg-gray-50'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-md text-xs font-bold uppercase tracking-wider">
                        {getTypeIcon(question.type)}
                        <span className="ml-1">{getTypeLabel(question.type)}</span>
                      </span>
                      <span className="px-2 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-md text-xs font-bold">
                        {question.points} pts
                      </span>
                      {!question.active && (
                        <span className="px-2 py-1 bg-[var(--foreground)]/10 text-[var(--foreground)]/60 rounded-md text-xs font-bold">
                          Inactiva
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-serif font-bold text-[var(--foreground)]">
                      {question.title}
                    </h3>
                    {question.description && (
                      <p className="text-[var(--foreground)]/70 text-sm">
                        {question.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedQR(question.qr_code)}
                      className="!px-3"
                      title="Veure QR"
                    >
                      <QrCode size={18} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(question)}
                      className="!px-3 text-[var(--primary)] hover:text-[var(--primary-dark)]"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleActive(question)}
                      className={`!px-3 ${question.active ? 'text-[var(--secondary)]' : 'text-[var(--foreground)]/40'}`}
                      title={question.active ? "Desactivar" : "Activar"}
                    >
                      <Power size={18} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(question.id)}
                      className="!px-3 text-[var(--error)] hover:bg-[var(--error)]/10"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
