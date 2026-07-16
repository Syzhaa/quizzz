import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { createSocket } from '../utils/socket';
import { Socket } from "socket.io-client";
import { CheckCircle, XCircle, Timer, Trophy } from "lucide-react";

interface QuestionDto {
  id: string;
  text: string;
  choices: { id: string; text: string }[];
  durationSeconds: number;
  mediaUrl?: string;
}

export default function PlayerGamePage() {
  const { pin } = useParams<{ pin: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const nickname = location.state?.nickname;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [question, setQuestion] = useState<QuestionDto | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  const [hasAnswered, setHasAnswered] = useState(false);
  
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [scoreGained, setScoreGained] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  
  const [leaderboard, setLeaderboard] = useState<any[] | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!pin || !nickname) {
      navigate("/");
      return;
    }

    const playerSocket = createSocket("/player");
    setSocket(playerSocket);
    playerSocket.connect();

    const handleJoin = () => playerSocket.emit("join_game", { pin, nickname });
    if (playerSocket.connected) {
      handleJoin();
    }
    playerSocket.on("connect", handleJoin);

    playerSocket.on("countdown", ({ seconds }: { seconds: number }) => {
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

    playerSocket.on("question_start", (q: QuestionDto) => {
      setQuestion(q);
      setTimeLeft(q.durationSeconds);
      setHasAnswered(false);
      setShowResult(false);
      setIsCorrect(null);
      setScoreGained(0);
      setLeaderboard(null);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    playerSocket.on("answer_result", (data) => {
      setIsCorrect(data.isCorrect);
      setScoreGained(data.scoreGained);
      setCurrentScore(data.currentScore);
    });

    playerSocket.on("question_ended", () => {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeLeft(0);
      setShowResult(true);
    });

    playerSocket.on("leaderboard", (data) => {
      setLeaderboard(data);
    });

    playerSocket.on("game_over", () => {
      setGameOver(true);
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      playerSocket.disconnect();
    };
  }, [pin, navigate]);

  const handleChoiceSelect = (choiceId: string) => {
    if (!hasAnswered && !showResult && socket) {
      setHasAnswered(true);
      socket.emit("submit_answer", { pin, choiceId });
    }
  };

  const colors = [
    "bg-brand-pink",
    "bg-brand-blue",
    "bg-brand-yellow",
    "bg-brand-teal"
  ];

  if (leaderboard || gameOver) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-black text-slate-900 mb-8 flex items-center gap-3 text-center">
          <Trophy className="w-10 h-10 text-brand-yellow" fill="currentColor" /> Akhir Permainan
        </h1>
        <div className="bg-white p-8 rounded-3xl shadow-soft text-center w-full max-w-sm">
          <p className="text-slate-500 font-bold mb-2">Total Skor Anda</p>
          <div className="text-6xl font-black text-brand-blue mb-8">{currentScore}</div>
          <p className="text-slate-400 text-sm">Lihat papan klasemen di layar Host!</p>
        </div>
      </div>
    );
  }

  if (countdown !== null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-blue via-brand-teal to-brand-pink flex items-center justify-center">
        <div className="text-center">
          <div className="w-36 h-36 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto animate-pulse">
            <span className="text-8xl font-black text-white drop-shadow-lg">
              {countdown}
            </span>
          </div>
          <p className="text-xl font-bold text-white/80 mt-6 tracking-widest uppercase">Bersiap-siap!</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 border-4 border-brand-pink border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-slate-700">Bersiaplah!</h2>
          <p className="text-slate-500 mt-2">Perhatikan layar utama...</p>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-500 ${isCorrect ? 'bg-green-400' : 'bg-red-400'}`}>
        {isCorrect ? (
          <CheckCircle className="w-32 h-32 text-white mb-6 animate-in zoom-in duration-500" />
        ) : (
          <XCircle className="w-32 h-32 text-white mb-6 animate-in zoom-in duration-500" />
        )}
        <h1 className="text-5xl font-black text-white mb-4 text-center">
          {isCorrect ? 'BENAR!' : 'SALAH!'}
        </h1>
        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 text-center">
          <p className="text-white/80 font-bold mb-1">Skor didapat</p>
          <p className="text-4xl font-black text-white">+{scoreGained}</p>
        </div>
        <p className="text-white mt-12 font-bold animate-pulse">Menunggu soal berikutnya...</p>
      </div>
    );
  }

  if (hasAnswered) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-soft">
          <div className="w-16 h-16 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-slate-700">Jawaban terkirim!</h2>
          <p className="text-slate-500 mt-2">Menunggu pemain lain...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-white shadow-sm z-10">
        <div className="font-bold text-slate-500 text-sm">PIN: {pin}</div>
        <div className={`flex items-center gap-2 font-bold px-3 py-1 rounded-lg ${timeLeft <= 5 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
          <Timer className="w-4 h-4" />
          <span>{timeLeft}s</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 w-full max-w-lg mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow-soft mb-6 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">{question.text}</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 flex-1 content-start">
          {question.choices.map((c, i) => (
            <button
              key={c.id}
              onClick={() => handleChoiceSelect(c.id)}
              className={`${colors[i % colors.length]} w-full p-6 rounded-2xl shadow-sm transform transition-all active:scale-95 active:shadow-inner text-left`}
            >
              <span className={`text-xl font-bold ${colors[i % colors.length] === 'bg-brand-yellow' ? 'text-slate-900' : 'text-white'}`}>
                {c.text}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
