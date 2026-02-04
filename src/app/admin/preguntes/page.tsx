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
  Type, Image, Video, CheckSquare, List, ChevronRight, ChevronLeft, Check
} from 'lucide-react';
import { BADGE_ICONS, BADGE_ICON_CATEGORIES, getBadgeIcon, BadgeIconCategory } from '@/lib/badge-icons';

const FORM_STEPS = [
  { id: 1, title: 'Informació bàsica', description: 'Títol i descripció' },
  { id: 2, title: 'Tipus de pregunta', description: 'Format i opcions' },
  { id: 3, title: 'Insígnia', description: 'Tria la icona' },
] as const;

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
    badge_icon: 'star',
  });
  const [iconCategory, setIconCategory] = useState<BadgeIconCategory>('Monuments');
  const [currentStep, setCurrentStep] = useState(1);

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
      badge_icon: 'star',
    });
    setIconCategory('Monuments');
    setCurrentStep(1);
    setEditingQuestion(null);
    setShowForm(false);
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    const badgeIconOption = BADGE_ICONS.find(icon => icon.id === question.badge_icon);
    setFormData({
      title: question.title,
      description: question.description,
      type: question.type,
      options: question.options || ['', '', '', ''],
      correct_answer: question.correct_answer || '',
      points: question.points,
      active: question.active,
      badge_icon: question.badge_icon || 'star',
    });
    if (badgeIconOption) {
      setIconCategory(badgeIconOption.category as BadgeIconCategory);
    }
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
      badge_icon: formData.badge_icon,
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

        {/* Question Form Modal - Step-based */}
        {showForm && (
          <div className="question-form-modal fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <Card className="question-form-card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header with steps */}
              <div className="question-form-header mb-6">
                <h2 className="question-form-title text-xl font-serif font-bold text-[var(--foreground)] mb-4">
                  {editingQuestion ? 'Editar Pregunta' : 'Nova Pregunta'}
                </h2>
                
                {/* Step indicator */}
                <div className="question-form-steps flex items-center justify-between">
                  {FORM_STEPS.map((step, index) => (
                    <div key={step.id} className="question-form-step flex items-center flex-1">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(step.id)}
                        className={`question-form-step-btn flex items-center gap-2 transition-all ${
                          currentStep === step.id
                            ? 'text-[var(--primary)]'
                            : currentStep > step.id
                            ? 'text-[var(--secondary)]'
                            : 'text-[var(--foreground)]/40'
                        }`}
                      >
                        <span className={`question-form-step-number w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          currentStep === step.id
                            ? 'bg-[var(--primary)] text-white'
                            : currentStep > step.id
                            ? 'bg-[var(--secondary)] text-white'
                            : 'bg-[var(--card-border)] text-[var(--foreground)]/60'
                        }`}>
                          {currentStep > step.id ? <Check size={14} /> : step.id}
                        </span>
                        <div className="question-form-step-text hidden sm:block text-left">
                          <div className="text-xs font-medium">{step.title}</div>
                          <div className="text-[10px] opacity-60">{step.description}</div>
                        </div>
                      </button>
                      {index < FORM_STEPS.length - 1 && (
                        <div className={`question-form-step-line flex-1 h-0.5 mx-2 transition-all ${
                          currentStep > step.id ? 'bg-[var(--secondary)]' : 'bg-[var(--card-border)]'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form content - scrollable */}
              <form onSubmit={handleSubmit} className="question-form-content flex-1 overflow-y-auto">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="question-form-step1 space-y-6 animate-fade-in">
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
                        rows={5}
                        className="w-full px-2 py-3 bg-transparent border-b-2 border-[var(--card-border)] text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 focus:outline-none focus:border-[var(--primary)] transition-colors font-sans resize-none"
                        placeholder="Instruccions addicionals per als jugadors..."
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
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
                  </div>
                )}

                {/* Step 2: Question Type */}
                {currentStep === 2 && (
                  <div className="question-form-step2 space-y-6 animate-fade-in">
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
                            className={`flex-1 py-4 rounded-lg border-2 transition-all font-medium ${
                              formData.correct_answer === 'true'
                                ? 'border-[var(--secondary)] bg-[var(--secondary)]/10 text-[var(--secondary)]'
                                : 'border-[var(--card-border)] text-[var(--foreground)]/60'
                            }`}
                          >
                            ✓ Veritat
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, correct_answer: 'false' })}
                            className={`flex-1 py-4 rounded-lg border-2 transition-all font-medium ${
                              formData.correct_answer === 'false'
                                ? 'border-[var(--error)] bg-[var(--error)]/10 text-[var(--error)]'
                                : 'border-[var(--card-border)] text-[var(--foreground)]/60'
                            }`}
                          >
                            ✗ Fals
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

                    {['text', 'photo', 'video'].includes(formData.type) && (
                      <div className="question-form-type-info p-4 bg-[var(--background)] rounded-lg border border-[var(--card-border)]">
                        <p className="text-sm text-[var(--foreground)]/70 font-serif italic">
                          {formData.type === 'text' && '✍️ Els jugadors hauran d\'escriure una resposta de text lliure.'}
                          {formData.type === 'photo' && '📷 Els jugadors hauran de fer una foto i enviar-la.'}
                          {formData.type === 'video' && '🎥 Els jugadors hauran de gravar un vídeo i enviar-lo.'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Badge Icon */}
                {currentStep === 3 && (
                  <div className="question-form-step3 space-y-4 animate-fade-in">
                    <p className="text-sm text-[var(--foreground)]/70 font-serif italic mb-2">
                      Tria la icona que es mostrarà quan completin aquesta pregunta.
                    </p>
                    
                    {/* Category tabs */}
                    <div className="question-form-icon-categories flex flex-wrap gap-2">
                      {BADGE_ICON_CATEGORIES.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setIconCategory(category)}
                          className={`question-form-icon-category-tab px-3 py-1.5 text-sm rounded-lg transition-all ${
                            iconCategory === category
                              ? 'bg-[var(--primary)] text-white shadow-md'
                              : 'bg-[var(--card-border)] text-[var(--foreground)]/60 hover:bg-[var(--card-border)]/80'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    
                    {/* Icons grid - now bigger */}
                    <div className="question-form-icon-grid grid grid-cols-6 sm:grid-cols-8 gap-3 p-4 bg-[var(--background)] rounded-xl border border-[var(--card-border)]">
                      {BADGE_ICONS.filter(icon => icon.category === iconCategory).map((iconOption) => {
                        const IconComponent = iconOption.icon;
                        return (
                          <button
                            key={iconOption.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, badge_icon: iconOption.id })}
                            className={`question-form-icon-option aspect-square flex flex-col items-center justify-center gap-1 rounded-xl transition-all p-2 ${
                              formData.badge_icon === iconOption.id
                                ? 'bg-[var(--accent)] text-white ring-2 ring-[var(--accent)] ring-offset-2 scale-105'
                                : 'bg-[var(--card-bg)] text-[var(--foreground)]/70 hover:bg-[var(--card-border)] hover:text-[var(--foreground)] hover:scale-105'
                            }`}
                            title={iconOption.name}
                          >
                            <IconComponent size={24} />
                            <span className="text-[9px] truncate w-full text-center">{iconOption.name}</span>
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Selected icon preview - bigger */}
                    <div className="question-form-icon-preview flex items-center justify-center gap-4 p-4 bg-gradient-to-br from-[var(--accent)]/10 to-[var(--primary)]/10 rounded-xl border border-[var(--accent)]/20">
                      {(() => {
                        const SelectedIcon = getBadgeIcon(formData.badge_icon);
                        const selectedOption = BADGE_ICONS.find(i => i.id === formData.badge_icon);
                        return (
                          <>
                            <div className="question-form-icon-preview-badge w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] flex items-center justify-center shadow-lg">
                              <SelectedIcon size={32} className="text-white" />
                            </div>
                            <div className="question-form-icon-preview-info">
                              <div className="text-sm text-[var(--foreground)]/60">Icona seleccionada:</div>
                              <div className="text-lg font-serif font-bold text-[var(--foreground)]">
                                {selectedOption?.name || 'Estrella'}
                              </div>
                              <div className="text-xs text-[var(--foreground)]/40">
                                Categoria: {selectedOption?.category || 'Altres'}
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </form>

              {/* Footer with navigation */}
              <div className="question-form-footer flex gap-3 pt-6 mt-6 border-t border-[var(--card-border)]">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={resetForm}
                >
                  Cancel·lar
                </Button>
                
                <div className="flex-1" />
                
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft size={16} />
                    Anterior
                  </Button>
                )}
                
                {currentStep < FORM_STEPS.length ? (
                  <Button
                    type="button"
                    onClick={() => {
                      if (currentStep === 1 && !formData.title.trim()) {
                        alert('Si us plau, introdueix un títol');
                        return;
                      }
                      setCurrentStep(currentStep + 1);
                    }}
                    className="flex items-center gap-2"
                  >
                    Següent
                    <ChevronRight size={16} />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
                    className="flex items-center gap-2"
                  >
                    <Check size={16} />
                    {editingQuestion ? 'Guardar Canvis' : 'Crear Pregunta'}
                  </Button>
                )}
              </div>
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
