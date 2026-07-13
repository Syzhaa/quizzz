import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuiz, updateQuiz, Question } from '../services/quiz-api';
import { LogOut, Plus, Image as ImageIcon, Triangle, Hexagon, Circle, Square, Check, Settings, Copy, Trash2 } from 'lucide-react';

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export default function QuizEditPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<string>('');

  useEffect(() => {
    if (quizId) {
      loadQuiz(quizId);
    }
  }, [quizId]);

  const loadQuiz = async (id: string) => {
    try {
      setLoading(true);
      const data = await getQuiz(id);
      setTitle(data.title);
      // Ensure questions have at least 4 choices for the UI
      const paddedQuestions = data.questions.map(q => {
        const paddedChoices = [...q.choices];
        while (paddedChoices.length < 4) {
          paddedChoices.push({ id: generateId(), text: '' });
        }
        return { ...q, choices: paddedChoices.slice(0, 4) };
      });

      if (paddedQuestions.length === 0) {
        paddedQuestions.push({
          id: generateId(),
          text: '',
          durationSeconds: 20,
          correctChoiceId: '',
          choices: [
            { id: generateId(), text: '' },
            { id: generateId(), text: '' },
            { id: generateId(), text: '' },
            { id: generateId(), text: '' },
          ]
        });
      }

      setQuestions(paddedQuestions);
      setActiveQuestionId(paddedQuestions[0].id);
    } catch (err: any) {
      alert(err.message || 'Failed to load quiz');
      navigate('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!quizId) return;
    try {
      setSaving(true);
      
      if (!title.trim()) throw new Error('Judul kuis tidak boleh kosong.');
      
      const cleanedQuestions = questions.map((q, i) => {
        if (!q.text.trim()) {
           throw new Error(`Soal nomor ${i + 1} tidak boleh kosong.`);
        }
        const validChoices = q.choices.filter(c => c.text.trim() !== '');
        if (validChoices.length < 2) {
           throw new Error(`Soal nomor ${i + 1} harus memiliki minimal 2 pilihan jawaban.`);
        }
        if (!q.correctChoiceId || !validChoices.some(c => c.id === q.correctChoiceId)) {
           throw new Error(`Soal nomor ${i + 1} harus memiliki jawaban benar yang dipilih (dari pilihan yang tidak kosong).`);
        }
        return {
          ...q,
          choices: validChoices
        };
      });

      await updateQuiz(quizId, { title, questions: cleanedQuestions });
      alert('Kuis berhasil disimpan!');
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan kuis. Pastikan semua soal dan pilihan ganda (minimal 2) telah diisi, serta jawaban benar telah dipilih.');
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: generateId(),
      text: '',
      durationSeconds: 20,
      correctChoiceId: '',
      choices: [
        { id: generateId(), text: '' },
        { id: generateId(), text: '' },
        { id: generateId(), text: '' },
        { id: generateId(), text: '' },
      ]
    };
    setQuestions([...questions, newQuestion]);
    setActiveQuestionId(newQuestion.id);
  };

  const removeQuestion = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (questions.length <= 1) {
      alert('Kuis harus memiliki setidaknya 1 soal.');
      return;
    }
    const newQuestions = questions.filter(q => q.id !== id);
    setQuestions(newQuestions);
    if (activeQuestionId === id) {
      setActiveQuestionId(newQuestions[0].id);
    }
  };

  const activeQuestionIndex = useMemo(() => {
    return questions.findIndex(q => q.id === activeQuestionId);
  }, [questions, activeQuestionId]);

  const activeQuestion = questions[activeQuestionIndex];

  const updateActiveQuestion = (updates: Partial<Question>) => {
    const newQuestions = [...questions];
    newQuestions[activeQuestionIndex] = { ...newQuestions[activeQuestionIndex], ...updates };
    setQuestions(newQuestions);
  };

  const updateChoice = (choiceIndex: number, text: string) => {
    if (!activeQuestion) return;
    const newChoices = [...activeQuestion.choices];
    newChoices[choiceIndex] = { ...newChoices[choiceIndex], text: text.toUpperCase() };
    updateActiveQuestion({ choices: newChoices });
  };

  const toggleCorrectAnswer = (choiceId: string) => {
    updateActiveQuestion({ correctChoiceId: choiceId });
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center font-bold text-2xl uppercase text-slate-400 bg-gray-50 tracking-widest">Memuat...</div>;
  }

  const ICONS = [Triangle, Hexagon, Circle, Square];
  const COLORS = ['bg-[#FF33A3]', 'bg-[#33D9FF]', 'bg-[#FFC700]', 'bg-[#00A896]'];

  return (
    <div className="h-screen overflow-hidden text-slate-800 bg-[#FDFDFD] font-sans flex flex-col w-full">
      {/* BEGIN: MainHeader */}
      <header className="h-16 px-6 flex items-center justify-between bg-white border-b border-gray-100 sticky top-0 z-50 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="bg-brand-pink text-white font-bold px-4 py-1.5 rounded-lg text-sm tracking-wider">
            QUIZZZZZ
          </div>
          <div className="bg-gray-100 text-slate-500 font-semibold px-4 py-1.5 rounded-lg text-sm">
            EDITOR
          </div>
        </div>
        
        <div className="flex items-center justify-center flex-1 max-w-md mx-6">
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-center font-bold text-slate-700 bg-gray-50 border border-gray-100 rounded-lg px-4 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-pink/30 focus:bg-white transition-all"
            placeholder="Judul Kuis..."
          />
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-400">
            {saving ? (
              <span className="uppercase tracking-widest text-brand-blue animate-pulse">Menyimpan...</span>
            ) : (
              <>
                <Check className="h-4 w-4 text-brand-teal" />
                <span className="uppercase tracking-widest">Tersimpan</span>
              </>
            )}
          </div>
          <button onClick={() => navigate('/admin/dashboard')} className="flex items-center space-x-2 border border-gray-200 px-5 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors uppercase tracking-wider">
            <LogOut className="h-4 w-4" />
            <span>Keluar</span>
          </button>
          <button onClick={handleSave} disabled={saving} className="bg-brand-pink text-white px-8 py-2 rounded-xl text-xs font-bold hover:bg-opacity-90 shadow-soft transition-all uppercase tracking-wider disabled:opacity-50">
            Simpan
          </button>
        </div>
      </header>
      {/* END: MainHeader */}

      <main className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* BEGIN: LeftSidebar - Question List */}
        <aside className="w-72 bg-white border-r border-gray-100 flex flex-col p-6 overflow-y-auto no-scrollbar shrink-0">
          <div className="mb-6">
            <h2 className="font-bold text-sm text-slate-900 uppercase">Daftar Soal</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Edit pertanyaan Anda</p>
          </div>
          <div className="space-y-4 flex-1">
            {questions.map((q, index) => {
              const isActive = q.id === activeQuestionId;
              
              if (isActive) {
                return (
                  <div key={q.id} className="p-3 rounded-2xl border-2 border-brand-pink bg-pink-50/30 relative cursor-pointer" onClick={() => setActiveQuestionId(q.id)}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-brand-pink uppercase tracking-widest">{index + 1}. Kuis</span>
                      {questions.length > 1 && (
                        <Trash2 className="h-3 w-3 text-brand-pink hover:text-red-500 transition-colors" onClick={(e) => removeQuestion(q.id, e)} />
                      )}
                    </div>
                    <div className="aspect-video bg-white rounded-lg border border-pink-100 flex flex-col items-center justify-center relative overflow-hidden p-2">
                      <span className="text-[8px] font-bold text-slate-400 text-center uppercase line-clamp-2 w-full mb-1">
                        {q.text || "Kosong"}
                      </span>
                      <ImageIcon className="h-4 w-4 text-brand-pink/30 my-1" />
                      <div className="grid grid-cols-2 gap-0.5 w-full h-1.5 mt-auto">
                        <div className="bg-[#FF33A3] rounded-sm"></div>
                        <div className="bg-[#33D9FF] rounded-sm"></div>
                        <div className="bg-[#FFC700] rounded-sm"></div>
                        <div className="bg-[#00A896] rounded-sm"></div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={q.id} onClick={() => setActiveQuestionId(q.id)} className="p-4 rounded-2xl border border-gray-100 bg-white shadow-soft text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:border-brand-pink/50 hover:bg-pink-50/10 transition-all flex justify-between items-center group">
                  <span>{index + 1}. Kuis</span>
                  {questions.length > 1 && (
                    <Trash2 className="h-3 w-3 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all" onClick={(e) => removeQuestion(q.id, e)} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-8 pt-4">
            <button onClick={addQuestion} className="w-full py-3 border border-brand-pink rounded-xl text-brand-pink text-[10px] font-bold flex items-center justify-center space-x-2 uppercase tracking-widest hover:bg-brand-pink hover:text-white transition-all shadow-sm">
              <Plus className="h-4 w-4" />
              <span>Tambah Soal</span>
            </button>
          </div>
        </aside>
        {/* END: LeftSidebar */}

        {/* BEGIN: MainContent - Editor Area */}
        <section className="flex-1 bg-gray-50/30 overflow-y-auto no-scrollbar px-8 lg:px-16 py-12 flex flex-col items-center relative">
          {activeQuestion && (
            <div className="w-full max-w-4xl flex flex-col min-h-full">
              {/* Question Input */}
              <div className="w-full mb-8">
                <input 
                  type="text"
                  value={activeQuestion.text}
                  onChange={(e) => updateActiveQuestion({ text: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-2xl p-6 lg:p-8 text-lg font-medium text-slate-700 placeholder-slate-300 shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-pink/20 transition-all text-center uppercase" 
                  placeholder="Tulis pertanyaan Anda di sini..." 
                />
              </div>

              {/* Media Drop Zone */}
              <div className="w-full max-w-2xl mx-auto aspect-video bg-gray-100/50 border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center p-8 mb-10 relative overflow-hidden group hover:bg-gray-100 hover:border-gray-300 transition-all cursor-pointer">
                <div className="bg-white p-5 rounded-3xl shadow-soft mb-5 group-hover:scale-110 transition-transform">
                  <ImageIcon className="h-12 w-12 text-slate-300 group-hover:text-brand-pink transition-colors" />
                </div>
                <p className="text-slate-400 font-bold text-xs tracking-widest uppercase mb-5 group-hover:text-slate-500">Masukkan Media</p>
                <button className="bg-slate-500 text-white px-6 py-2 rounded-xl text-[10px] font-bold flex items-center space-x-2 shadow-sm hover:bg-slate-600 transition-all uppercase tracking-wider pointer-events-none">
                  <Plus className="h-3 w-3" />
                  <span>Browse</span>
                </button>
              </div>

              {/* Answer Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mt-auto">
                {activeQuestion.choices.map((choice, idx) => {
                  const Icon = ICONS[idx];
                  const bgColor = COLORS[idx];
                  const isCorrect = activeQuestion.correctChoiceId === choice.id;

                  return (
                    <div key={choice.id} className={`group relative ${bgColor} text-white p-3 lg:p-4 h-20 lg:h-24 rounded-2xl flex items-center shadow-vibrant transition-transform hover:scale-[1.02]`}>
                      <div className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-xl mr-4 shrink-0">
                        <Icon className="h-5 w-5 fill-current" />
                      </div>
                      
                      <input 
                        type="text"
                        value={choice.text}
                        onChange={(e) => updateChoice(idx, e.target.value)}
                        placeholder={`TAMBAH JAWABAN ${idx + 1}`}
                        className="flex-1 bg-transparent text-white font-bold text-lg lg:text-xl tracking-wider placeholder-white/50 focus:outline-none uppercase w-full"
                      />
                      
                      <div className="ml-3 shrink-0 flex items-center">
                        <button 
                          onClick={() => toggleCorrectAnswer(choice.id)}
                          className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center transition-all ${isCorrect ? 'bg-white shadow-soft' : 'bg-black/10 hover:bg-white/20 border border-white/30'} ${!isCorrect && 'opacity-40 group-hover:opacity-100'}`}
                        >
                          {isCorrect ? (
                            <Check className={`h-5 w-5 lg:h-6 lg:w-6 ${bgColor.replace('bg-', 'text-')}`} strokeWidth={3} />
                          ) : (
                            <Circle className="h-4 w-4 lg:h-5 lg:w-5 text-white" strokeWidth={2} />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
        {/* END: MainContent */}

        {/* BEGIN: RightSidebar - Settings Panel */}
        <aside className="w-80 bg-white border-l border-gray-100 p-6 flex flex-col shrink-0">
          {activeQuestion && (
            <>
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-pink-50 p-2 rounded-lg text-brand-pink">
                  <Settings className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-slate-900 uppercase">Pengaturan</h2>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Konfigurasi</p>
                </div>
              </div>
              
              <div className="space-y-8 flex-1">
                {/* Setting: Time Limit */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-pink"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Batas Waktu</span>
                  </div>
                  <div className="relative">
                    <select 
                      value={activeQuestion.durationSeconds}
                      onChange={(e) => updateActiveQuestion({ durationSeconds: Number(e.target.value) })}
                      className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-5 py-4 text-sm font-bold text-slate-700 shadow-soft focus:outline-none focus:ring-1 focus:ring-brand-pink/20 cursor-pointer uppercase"
                    >
                      <option value={10}>10 DETIK</option>
                      <option value={20}>20 DETIK</option>
                      <option value={30}>30 DETIK</option>
                      <option value={40}>40 DETIK</option>
                      <option value={60}>60 DETIK</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Setting: Points */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-blue"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Poin</span>
                  </div>
                  <div className="relative">
                    <select className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-5 py-4 text-sm font-bold text-slate-700 shadow-soft focus:outline-none focus:ring-1 focus:ring-brand-blue/20 cursor-pointer uppercase">
                      <option>STANDAR</option>
                      <option>GANDA</option>
                      <option>TIDAK ADA POIN</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons at bottom of sidebar */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <button 
                  onClick={() => {
                    const newQ = { ...activeQuestion, id: generateId() };
                    newQ.choices = newQ.choices.map(c => ({ ...c, id: generateId() }));
                    const correctChoiceIndex = activeQuestion.choices.findIndex(c => c.id === activeQuestion.correctChoiceId);
                    if (correctChoiceIndex !== -1) {
                      newQ.correctChoiceId = newQ.choices[correctChoiceIndex].id;
                    }
                    setQuestions([...questions, newQ]);
                    setActiveQuestionId(newQ.id);
                  }}
                  className="w-full py-4 border border-brand-pink text-brand-pink text-[10px] font-bold rounded-2xl flex items-center justify-center space-x-3 uppercase tracking-widest hover:bg-pink-50 transition-colors shadow-sm"
                >
                  <Copy className="h-4 w-4" />
                  <span>Duplikat</span>
                </button>
                <button 
                  onClick={() => removeQuestion(activeQuestion.id)}
                  className="w-full py-4 text-[#A84832] text-[10px] font-bold flex items-center justify-center space-x-3 uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Hapus Soal</span>
                </button>
              </div>
            </>
          )}
        </aside>
        {/* END: RightSidebar */}
      </main>
    </div>
  );
}
