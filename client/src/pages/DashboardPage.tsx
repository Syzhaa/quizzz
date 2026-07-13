import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { getQuizzes, createQuiz, deleteQuiz, duplicateQuiz, Quiz } from '../services/quiz-api';
import { createGameSession } from '../services/game-api';
import { Plus, BarChart, Play, Users, Search, MoreHorizontal, Circle, Clock, Edit3, Trash2 } from 'lucide-react';

export default function DashboardPage() {
  const { logout, admin } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await getQuizzes();
      setQuizzes(data);
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('expired')) {
        logout();
      } else {
        setError(err.message || 'Failed to load quizzes');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const handleCreate = async () => {
    try {
      const newQuiz = await createQuiz('New Quiz');
      navigate(`/admin/quiz/${newQuiz._id}/edit`);
    } catch (err: any) {
      alert(err.message || 'Failed to create quiz');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await deleteQuiz(id);
      setQuizzes(quizzes.filter((q) => q._id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete quiz');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateQuiz(id);
      loadQuizzes();
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate quiz');
    }
  };

  const handleHost = async (id: string) => {
    try {
      const pin = await createGameSession(id);
      navigate(`/admin/game/${pin}/lobby`);
    } catch (err: any) {
      alert(err.message || 'Failed to host game');
    }
  };

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(q => q.title.toLowerCase().includes(search.toLowerCase()));
  }, [quizzes, search]);

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-10 font-sans px-4 md:px-8 py-8">
      
      {/* HERO / WELCOME SECTION */}
      <section className="bg-white rounded-3xl p-8 md:p-10 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-gray-100">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Halo, {admin?.name || 'Admin'}! 👋</h2>
          <p className="text-slate-500 font-medium">Siap untuk membuat kuis interaktif hari ini?</p>
        </div>
        <button onClick={handleCreate} className="px-8 py-4 bg-brand-pink text-white rounded-xl shadow-soft font-bold tracking-wider hover:bg-opacity-90 active:scale-[0.98] transition-all flex items-center gap-2">
          <Plus strokeWidth={3} className="w-5 h-5" />
          BUAT KUIS
        </button>
      </section>

      {/* QUICK STATS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 flex items-center gap-6">
          <div className="w-14 h-14 bg-brand-blue/10 text-brand-blue rounded-2xl flex items-center justify-center">
             <BarChart strokeWidth={2.5} className="w-7 h-7" />
          </div>
          <div>
            <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Total Kuis</p>
            <p className="font-black text-3xl text-slate-800">{quizzes.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 flex items-center gap-6">
          <div className="w-14 h-14 bg-brand-teal/10 text-brand-teal rounded-2xl flex items-center justify-center">
             <Play strokeWidth={2.5} className="w-7 h-7" />
          </div>
          <div>
            <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Dimainkan</p>
            <p className="font-black text-3xl text-slate-800">0</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 flex items-center gap-6">
          <div className="w-14 h-14 bg-brand-yellow/20 text-brand-yellow rounded-2xl flex items-center justify-center">
             <Users strokeWidth={2.5} className="w-7 h-7" />
          </div>
          <div>
            <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Pemain</p>
            <p className="font-black text-3xl text-slate-800">0</p>
          </div>
        </div>
      </section>

      {/* QUIZ LIST SECTION */}
      <section className="flex flex-col gap-6 mt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 flex-wrap gap-4">
          <h3 className="text-xl font-bold text-slate-800">Kuis Milikmu</h3>
          
          {/* Search Bar */}
          <div className="flex items-center bg-white border border-gray-100 rounded-xl px-4 py-2 w-full md:w-80 shadow-sm focus-within:ring-2 focus-within:ring-brand-pink/20 transition-all">
            <Search strokeWidth={2} className="text-slate-300 mr-3 w-5 h-5" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kuis..." 
              className="w-full text-sm font-medium focus:outline-none bg-transparent placeholder:text-slate-400 text-slate-700"
            />
          </div>
        </div>

        {/* Quiz Container */}
        {loading ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center font-bold text-slate-400 text-sm tracking-widest uppercase">Memuat Kuis...</div>
        ) : error ? (
          <div className="bg-red-50 rounded-3xl p-12 text-center font-bold text-red-500 text-sm">{error}</div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center font-bold text-slate-400 text-sm tracking-widest uppercase">KUIS TIDAK DITEMUKAN</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredQuizzes.map((quiz, idx) => {
              const bgColors = ['bg-[#FF33A3]', 'bg-[#33D9FF]', 'bg-[#FFC700]', 'bg-[#00A896]', 'bg-[#9D4EDD]'];
              const colorClass = bgColors[idx % bgColors.length];
              return (
                <div key={quiz._id} className="bg-white rounded-2xl flex flex-col border border-gray-100 shadow-soft hover:-translate-y-1 hover:shadow-vibrant transition-all overflow-hidden group">
                  
                  {/* Thumbnail Area */}
                  <div className={`h-32 ${colorClass} relative flex flex-col justify-between p-4 overflow-hidden`}>
                     <div className="flex justify-between items-start z-10">
                       <span className="bg-white/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase">
                         {quiz.questions.length} SOAL
                       </span>
                       <button onClick={() => handleDuplicate(quiz._id)} title="Duplicate Quiz" className="bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm rounded-lg p-1.5 transition-all">
                         <MoreHorizontal strokeWidth={2.5} className="w-4 h-4" />
                       </button>
                     </div>
                     {/* Decorative geometric shape */}
                     <div className="absolute -right-4 -bottom-4 opacity-20 pointer-events-none">
                       <Circle strokeWidth={8} className="w-24 h-24 text-white" fill="transparent" />
                     </div>
                  </div>
                  
                  {/* Content Area */}
                  <div className="p-5 flex flex-col flex-1">
                     <h4 className="font-bold text-lg text-slate-800 mb-1 line-clamp-2 leading-tight flex-1">
                       {quiz.title}
                     </h4>
                    
                    <div className="flex items-center justify-between text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-4 mb-5">
                      <span className="flex items-center gap-1.5"><Clock strokeWidth={2.5} className="w-3 h-3" /> HARI INI</span>
                      <span className="flex items-center gap-1.5"><Users strokeWidth={2.5} className="w-3 h-3" /> 0 x</span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 mt-auto">
                      <button onClick={() => handleHost(quiz._id)} className="flex-1 py-2.5 bg-brand-pink text-white rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2" title="Host Game">
                        <Play strokeWidth={2.5} fill="currentColor" className="w-3.5 h-3.5" /> HOST
                      </button>
                      <button onClick={() => navigate(`/admin/quiz/${quiz._id}/edit`)} className="w-10 h-10 bg-gray-50 text-slate-600 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-all">
                        <Edit3 strokeWidth={2} className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(quiz._id)} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 flex items-center justify-center transition-all">
                        <Trash2 strokeWidth={2} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
