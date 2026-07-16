import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createSocket } from '../utils/socket';
import { useAuth } from '../store/auth';
import { Socket } from "socket.io-client";
import { Users, Timer, CheckCircle, Trophy, ArrowRight } from "lucide-react";

interface QuestionDto {
  id: string;
  text: string;
  choices: { id: string; text: string }[];
  durationSeconds: number;
  mediaUrl?: string;
}

export default function HostGamePage() {
  const { pin } = useParams<{ pin: string }>();
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [question, setQuestion] = useState<QuestionDto | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [answersCount, setAnswersCount] = useState<number>(0);
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  
  const [showResult, setShowResult] = useState(false);
  const [correctChoiceId, setCorrectChoiceId] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[] | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!pin || !accessToken) {
      navigate("/");
      return;
    }

    const hostSocket = createSocket("/host", { token: accessToken });
    setSocket(hostSocket);
    hostSocket.connect();

    const handleJoin = () => hostSocket.emit("join_game", { pin });
    if (hostSocket.connected) {
      handleJoin();
    }
    hostSocket.on("connect", handleJoin);

    hostSocket.on("countdown", ({ seconds }: { seconds: number }) => {
      setCountdown(seconds);
      let current = seconds;
      if (countdownRef.current) clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        current--;
        if (current <= 0) {
          clearInterval(countdownRef.current!);
          setCountdown(null);
        } else {
          setCountdown(current);
        }
      }, 1000);
    });

    hostSocket.on("question_start", (q: QuestionDto) => {
      setQuestion(q);
      setTimeLeft(q.durationSeconds);
      setAnswersCount(0);
      setShowResult(false);
      setCorrectChoiceId(null);
      setLeaderboard(null);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            hostSocket.emit("time_up", { pin });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    hostSocket.on("player_answered", ({ totalAnswered }) => {
      setAnswersCount(totalAnswered);
    });

    hostSocket.on("joined", ({ players }) => {
      setTotalPlayers(players.length);
    });
    
    hostSocket.on("player_joined", (players) => setTotalPlayers(players.length));
    hostSocket.on("player_left", (players) => setTotalPlayers(players.length));

    hostSocket.on("question_ended", ({ correctChoiceId }) => {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeLeft(0);
      setCorrectChoiceId(correctChoiceId);
      setShowResult(true);
    });

    hostSocket.on("leaderboard", (data) => {
      setLeaderboard(data);
    });

    hostSocket.on("game_over", () => {
      hostSocket.emit("show_leaderboard", { pin });
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      hostSocket.disconnect();
    };
  }, [pin, navigate]);

  const handleNext = () => {
    if (socket) {
      socket.emit("next_question", { pin });
    }
  };

  const handleShowLeaderboard = () => {
    if (socket) {
      socket.emit("show_leaderboard", { pin });
    }
  };

  const colors = [
    "bg-brand-pink",
    "bg-brand-blue",
    "bg-brand-yellow",
    "bg-brand-teal"
  ];

  if (leaderboard) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <h1 className="text-5xl font-black text-slate-900 mb-10 flex items-center gap-4">
          <Trophy className="w-12 h-12 text-brand-yellow" fill="currentColor" /> Klasemen
        </h1>
        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-soft p-8">
          {leaderboard.map((p, i) => (
            <div key={p.socketId} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-4">
                <span className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-white ${i === 0 ? 'bg-brand-yellow' : i === 1 ? 'bg-slate-300' : i === 2 ? 'bg-amber-600' : 'bg-slate-800'}`}>
                  {i + 1}
                </span>
                <span className="text-xl font-bold text-slate-700">{p.nickname}</span>
              </div>
              <span className="text-2xl font-black text-slate-900">{p.score}</span>
            </div>
          ))}
        </div>
        <button onClick={handleNext} className="mt-10 bg-brand-blue text-white px-8 py-4 rounded-2xl font-bold text-xl hover:bg-opacity-90 flex items-center gap-2">
          Lanjut <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    );
  }

  if (countdown !== null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-blue via-brand-teal to-brand-pink flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-48 h-48 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto animate-pulse">
              <span className="text-9xl font-black text-white drop-shadow-lg" style={{ animation: 'bounceIn 0.5s ease-out' }}>
                {countdown}
              </span>
            </div>
          </div>
          <p className="text-2xl font-bold text-white/80 mt-8 tracking-widest uppercase">Bersiap-siap!</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-2xl font-bold text-slate-400">Menyiapkan soal...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="flex items-center justify-between p-6 bg-white shadow-sm z-10">
        <div className="text-2xl font-black text-slate-800">PIN: {pin}</div>
        <div className="flex gap-6">
          <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl font-bold text-slate-600">
            <Timer className="w-6 h-6" />
            <span className={`text-2xl ${timeLeft <= 5 ? 'text-brand-pink animate-bounce' : ''}`}>{timeLeft}</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl font-bold text-slate-600">
            <Users className="w-6 h-6" />
            <span className="text-2xl">{answersCount} / {totalPlayers}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-6xl mx-auto w-full">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 text-center mb-12 leading-tight">
          {question.text}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {question.choices.map((c, i) => {
            const isCorrect = correctChoiceId === c.id;
            const notCorrect = showResult && !isCorrect;
            return (
              <div 
                key={c.id} 
                className={`p-8 rounded-3xl flex items-center justify-center min-h-[160px] relative transition-all duration-500
                  ${colors[i % colors.length]} 
                  ${notCorrect ? 'opacity-30 scale-95 grayscale' : ''}
                  ${isCorrect ? 'ring-8 ring-green-400 scale-105 z-10 shadow-2xl' : 'shadow-soft'}
                `}
              >
                {isCorrect && (
                  <div className="absolute -top-6 -right-6 bg-green-400 rounded-full p-2 text-white shadow-xl animate-bounce">
                    <CheckCircle className="w-12 h-12" />
                  </div>
                )}
                <span className={`text-3xl md:text-4xl font-bold text-center ${colors[i % colors.length] === 'bg-brand-yellow' ? 'text-slate-900' : 'text-white'}`}>
                  {c.text}
                </span>
              </div>
            );
          })}
        </div>

        {showResult && (
          <div className="mt-12 flex gap-4 animate-in slide-in-from-bottom-10 fade-in duration-500">
            <button onClick={handleShowLeaderboard} className="bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold text-xl hover:bg-opacity-90">
              Lihat Klasemen
            </button>
            <button onClick={handleNext} className="bg-brand-teal text-white px-8 py-4 rounded-2xl font-bold text-xl hover:bg-opacity-90 flex items-center gap-2">
              Lanjut <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
