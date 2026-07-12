import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuiz, updateQuiz, Question } from '../services/quiz-api';

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export default function QuizEditPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeQIndex, setActiveQIndex] = useState(0);

  useEffect(() => {
    if (!quizId) return;
    getQuiz(quizId)
      .then(q => {
        setTitle(q.title);
        setQuestions(q.questions);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load quiz');
        setLoading(false);
      });
  }, [quizId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateQuiz(quizId!, { title, questions });
      alert('Saved successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    const newChoices = [
      { id: generateId(), text: 'Option 1' },
      { id: generateId(), text: 'Option 2' },
    ];
    const newQ: Question = {
      id: generateId(),
      text: 'New Question',
      durationSeconds: 20,
      choices: newChoices,
      correctChoiceId: newChoices[0].id,
    };
    setQuestions([...questions, newQ]);
    setActiveQIndex(questions.length);
  };

  const removeQuestion = (index: number) => {
    const newQs = questions.filter((_, i) => i !== index);
    setQuestions(newQs);
    if (activeQIndex >= newQs.length) {
      setActiveQIndex(Math.max(0, newQs.length - 1));
    }
  };

  const updateActiveQuestion = (updates: Partial<Question>) => {
    const newQs = [...questions];
    newQs[activeQIndex] = { ...newQs[activeQIndex], ...updates };
    setQuestions(newQs);
  };

  if (loading) return <div className="text-center font-bold">Loading editor...</div>;
  if (error) return <div className="text-center font-bold text-red-500">{error}</div>;

  const activeQ = questions[activeQIndex];

  return (
    <div className="w-full flex-1 flex flex-col gap-4">
      {/* Header */}
      <div className="card-neo flex items-center justify-between py-4">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="input-neo w-1/2 text-xl font-bold"
          placeholder="Quiz Title"
        />
        <div className="flex gap-4">
          <button onClick={() => navigate('/admin/dashboard')} className="btn-neo bg-gray-200">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-neo bg-neo-green">
            {saving ? 'Saving...' : 'Save Quiz'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6">
        {/* Sidebar */}
        <div className="card-neo w-64 flex flex-col gap-2 p-4">
          <h2 className="mb-2 font-black">Questions</h2>
          {questions.map((q, idx) => (
            <div
              key={q.id}
              onClick={() => setActiveQIndex(idx)}
              className={`cursor-pointer border-2 border-black p-2 font-bold transition-transform active:scale-95 ${
                idx === activeQIndex ? 'bg-neo-yellow shadow-neo-sm' : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between">
                <span className="truncate">{idx + 1}. {q.text || 'Empty'}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); removeQuestion(idx); }}
                  className="text-red-500 hover:text-red-700"
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
          <button onClick={addQuestion} className="btn-neo mt-4 bg-neo-cyan py-2 text-sm">
            + Add Question
          </button>
        </div>

        {/* Editor Content */}
        <div className="card-neo flex-1 p-6">
          {!activeQ ? (
            <div className="flex h-full items-center justify-center font-bold text-gray-400">
              No question selected. Add one to start.
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div>
                <label className="mb-1 block font-bold">Question Text</label>
                <textarea
                  value={activeQ.text}
                  onChange={e => updateActiveQuestion({ text: e.target.value })}
                  className="input-neo min-h-[100px] w-full"
                  placeholder="Enter your question here..."
                />
              </div>

              <div>
                <label className="mb-1 block font-bold">Duration (seconds)</label>
                <input
                  type="number"
                  min="5"
                  value={activeQ.durationSeconds}
                  onChange={e => updateActiveQuestion({ durationSeconds: parseInt(e.target.value) || 5 })}
                  className="input-neo w-32"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="font-bold">Choices (2 - 4)</label>
                  {activeQ.choices.length < 4 && (
                    <button
                      onClick={() => {
                        updateActiveQuestion({
                          choices: [...activeQ.choices, { id: generateId(), text: 'New Option' }]
                        });
                      }}
                      className="btn-neo py-1 px-3 text-xs bg-neo-cyan"
                    >
                      + Add Choice
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {activeQ.choices.map((choice, cIdx) => {
                    const isCorrect = choice.id === activeQ.correctChoiceId;
                    return (
                      <div key={choice.id} className={`flex flex-col gap-2 border-4 border-black p-3 ${isCorrect ? 'bg-neo-green' : 'bg-white'}`}>
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer font-bold">
                            <input
                              type="radio"
                              name={`correct-${activeQ.id}`}
                              checked={isCorrect}
                              onChange={() => updateActiveQuestion({ correctChoiceId: choice.id })}
                              className="h-5 w-5 border-2 border-black"
                            />
                            Correct Answer
                          </label>
                          {activeQ.choices.length > 2 && (
                            <button
                              onClick={() => {
                                const newChoices = activeQ.choices.filter(c => c.id !== choice.id);
                                let newCorrectId = activeQ.correctChoiceId;
                                if (isCorrect) newCorrectId = newChoices[0].id;
                                updateActiveQuestion({ choices: newChoices, correctChoiceId: newCorrectId });
                              }}
                              className="text-red-500 font-bold hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={choice.text}
                          onChange={e => {
                            const newChoices = [...activeQ.choices];
                            newChoices[cIdx].text = e.target.value;
                            updateActiveQuestion({ choices: newChoices });
                          }}
                          className="input-neo w-full bg-white"
                          placeholder="Option text..."
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
