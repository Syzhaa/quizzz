import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Play, AlertCircle } from 'lucide-react';
import { getGameSessionStatus } from '../services/game-api';
import { io, Socket } from 'socket.io-client';

export default function HostLobbyPage() {
  const { pin } = useParams<{ pin: string }>();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!pin) return;

    // Cek status sesi game melalui API
    getGameSessionStatus(pin)
      .then((data) => {
        if (data.status !== 'waiting') {
          setError('Sesi kuis sudah dimulai atau telah berakhir');
        } else {
          // Koneksi Socket.io ke namespace /host
          const hostSocket = io('/host');
          setSocket(hostSocket);

          hostSocket.on('connect', () => {
            hostSocket.emit('join_game', { pin });
          });

          hostSocket.on('joined', (data) => {
            setPlayers(data.players || []);
          });

          hostSocket.on('player_joined', (updatedPlayers) => {
            setPlayers(updatedPlayers);
          });

          hostSocket.on('player_left', (updatedPlayers) => {
            setPlayers(updatedPlayers);
          });

          hostSocket.on('error', (err) => {
            setError(err.message);
          });
        }
      })
      .catch((err) => {
        setError(err.message);
      });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [pin]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-soft max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-brand-pink mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Oops!</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button onClick={() => navigate('/admin/dashboard')} className="px-6 py-2 bg-brand-pink text-white font-bold rounded-xl hover:bg-opacity-90 transition-all tracking-widest text-sm">
            KEMBALI KE DASHBOARD
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-pink/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-brand-blue/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="lg:px-[100px] px-8 py-6 flex items-center justify-between z-10">
        <div className="bg-brand-pink text-white font-bold px-5 py-2 rounded-xl text-lg tracking-widest shadow-soft">
          QUIZZZZZ
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white px-5 py-2 rounded-xl font-bold text-slate-700 flex items-center gap-2 shadow-sm border border-gray-100">
            <Users className="w-5 h-5 text-brand-blue" />
            <span className="text-xl">{players.length}</span>
          </div>
          <button onClick={() => alert('Fitur bermain kuis (menampilkan soal) akan segera hadir!')} className="bg-brand-teal text-white font-bold px-6 py-3 rounded-xl tracking-widest flex items-center gap-2 shadow-vibrant hover:bg-opacity-90 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0" disabled={players.length === 0}>
            <Play fill="currentColor" className="w-5 h-5" /> MULAI SEKARANG
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row items-start justify-center gap-8 z-10 lg:px-[100px] px-8 py-10 w-full">
        
        {/* Left Column: PIN Card */}
        <div className="w-full lg:w-auto flex-shrink-0 flex flex-col items-center lg:items-start text-center lg:text-left">
          <p className="text-slate-500 font-semibold tracking-widest uppercase mb-4 text-sm w-full text-center">Gabung ke permainan di www.quizzzzz.com</p>
          <div className="bg-white px-10 py-12 rounded-3xl shadow-soft border-4 border-slate-900 flex flex-col items-center justify-center min-w-[320px]">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2 text-center">PIN PERMAINAN</p>
            <h1 className="text-8xl lg:text-7xl xl:text-[6.5rem] 2xl:text-[8rem] font-black text-slate-900 tracking-tighter leading-none text-center">{pin}</h1>
          </div>
        </div>

        {/* Right Column: Players Card */}
        <div className="w-full flex-1 bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl shadow-soft p-8 min-h-[400px]">
          <h2 className="text-slate-800 font-black text-xl mb-6 flex items-center gap-3">
            Peserta Bergabung
            <span className="bg-brand-blue text-white text-sm px-3 py-1 rounded-full">{players.length}</span>
          </h2>

          {players.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 font-medium py-20 animate-pulse">
              Menunggu pemain untuk bergabung...
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 items-start content-start">
              {players.map((p, i) => {
                const colors = ['bg-brand-pink', 'bg-brand-blue', 'bg-brand-yellow text-slate-800', 'bg-brand-teal', 'bg-purple-500'];
                const colorClass = colors[i % colors.length];
                return (
                  <div key={p.socketId} className={`w-fit px-5 py-2.5 rounded-2xl font-bold shadow-sm border border-black/5 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300 ${colorClass} ${colorClass.includes('text-slate-800') ? '' : 'text-white'}`}>
                    {p.nickname}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
