import { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { createSocket } from '../utils/socket';
import { Socket } from 'socket.io-client';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function PlayerLobbyPage() {
  const { pin } = useParams<{ pin: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const nickname = location.state?.nickname;

  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [, setSocket] = useState<Socket | null>(null);
  const [finalNickname, setFinalNickname] = useState(nickname);
  const finalNicknameRef = useRef(nickname);

  useEffect(() => {
    if (!pin || !nickname) {
      navigate('/');
      return;
    }

    const playerSocket = createSocket('/player');
    setSocket(playerSocket);
    playerSocket.connect();

    playerSocket.on('connect', () => {
      playerSocket.emit('join_game', { pin, nickname });
    });

    playerSocket.on('joined', (data) => {
      setStatus('connected');
      setFinalNickname(data.nickname);
      finalNicknameRef.current = data.nickname;
    });

    playerSocket.on('error', (err) => {
      setStatus('error');
      setErrorMsg(err.message || 'Terjadi kesalahan');
    });

    playerSocket.on('game_started', () => {
      navigate(`/game/${pin}/play`, { state: { nickname: finalNicknameRef.current || nickname } });
    });

    return () => {
      playerSocket.disconnect();
    };
  }, [pin, nickname, navigate]);

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-soft max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-brand-pink mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Gagal Bergabung</h2>
          <p className="text-slate-500 mb-6">{errorMsg}</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-brand-pink text-white font-bold rounded-xl hover:bg-opacity-90 transition-all tracking-widest text-sm">
            KEMBALI KE AWAL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-teal p-6 font-sans relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-white/95 backdrop-blur-md p-10 rounded-3xl shadow-vibrant max-w-lg w-full text-center z-10 border border-white/50">
        {status === 'connecting' ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-brand-teal animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Menghubungkan...</h2>
            <p className="text-slate-500 font-medium">Sedang bergabung ke permainan</p>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-brand-teal/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-12 h-12 text-brand-teal" strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">Siap, {finalNickname}!</h2>
            <p className="text-slate-500 font-medium text-lg mb-8">Kamu sudah masuk. Lihat layar utama!</p>
            
            <div className="w-full bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center justify-center">
              <div className="flex space-x-2 mb-4">
                <div className="w-3 h-3 bg-brand-pink rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-3 h-3 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-3 h-3 bg-brand-yellow rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <p className="text-slate-600 font-bold tracking-widest text-sm uppercase">Menunggu host memulai kuis</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
