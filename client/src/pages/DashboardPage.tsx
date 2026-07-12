import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { getQuizzes, createQuiz, deleteQuiz, duplicateQuiz, Quiz } from '../services/quiz-api';

export default function DashboardPage() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await getQuizzes();
      setQuizzes(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const handleCreate = async () => {
    try {
      const quiz = await createQuiz('Untitled Quiz');
      navigate(`/admin/quiz/${quiz._id}/edit`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await deleteQuiz(id);
      setQuizzes(q => q.filter(quiz => quiz._id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateQuiz(id);
      loadQuizzes();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black">Dashboard</h1>
          <p className="mt-2 font-bold text-gray-700">
            Welcome, <span className="text-neo-pink">{admin?.name}</span>
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleCreate} className="btn-neo bg-neo-cyan">
            + New Quiz
          </button>
          <button onClick={logout} className="btn-neo bg-red-400">
            Logout
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card-neo text-center font-bold">Loading quizzes...</div>
      ) : error ? (
        <div className="card-neo bg-red-100 text-center font-bold text-red-600">{error}</div>
      ) : quizzes.length === 0 ? (
        <div className="card-neo text-center font-bold text-gray-500">
          You don't have any quizzes yet. Click "+ New Quiz" to start!
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="card-neo flex flex-col justify-between">
              <div>
                <h3 className="mb-2 text-xl font-bold line-clamp-2">{quiz.title}</h3>
                <p className="mb-4 text-sm font-bold text-gray-600">
                  {quiz.questions.length} Questions
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate(`/admin/quiz/${quiz._id}/edit`)}
                  className="btn-neo bg-neo-yellow py-2 text-sm"
                >
                  Edit
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDuplicate(quiz._id)}
                    className="btn-neo flex-1 bg-white py-2 text-sm"
                  >
                    Duplicate
                  </button>
                  <button
                    onClick={() => handleDelete(quiz._id)}
                    className="btn-neo flex-1 bg-red-400 py-2 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
