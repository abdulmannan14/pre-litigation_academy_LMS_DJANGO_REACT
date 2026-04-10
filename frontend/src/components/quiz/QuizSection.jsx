import { useState } from 'react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Spinner from '../common/Spinner';
import { submitQuiz } from '../../api/quizApi';

export default function QuizSection({ quiz, lessonId, onComplete }) {
  const [answers, setAnswers] = useState({});  // { [questionIndex]: 'A'|'B'|'C'|'D' }
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);   // API response
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  if (!quiz) return null;

  const questions = quiz.questions || [];

  const handleSelect = (qIdx, optKey) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: optKey }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    // Build payload: { [question.id]: 'A'/'B'/'C'/'D' }
    const payload = {};
    questions.forEach((q, idx) => {
      payload[String(q.id)] = answers[idx];
    });

    setSubmitting(true);
    setApiError(null);
    try {
      const { data } = await submitQuiz(quiz.id, payload);
      setResult(data);
      setSubmitted(true);
      onComplete && onComplete(data.score, data.total_questions);
    } catch (err) {
      setApiError(
        err.response?.data?.detail ||
        'Failed to submit quiz. Please check your connection.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    setApiError(null);
  };

  // Build a lookup from question ID → result
  const resultByQuestionId = {};
  if (result?.results) {
    result.results.forEach((r) => { resultByQuestionId[r.question_id] = r; });
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-textDark">Lesson Quiz</h2>
        <Badge variant="default">{questions.length} Questions</Badge>
      </div>

      {/* Score banner */}
      {submitted && result && (
        <div className={`mb-6 p-4 rounded-2xl border flex items-center justify-between ${
          result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div>
            <p className={`font-semibold ${result.passed ? 'text-green-700' : 'text-red-600'}`}>
              {result.passed ? '🎉 Passed!' : '❌ Try Again'}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              You scored {result.score}/{result.total_questions} ({result.percentage}%)
            </p>
          </div>
          {!result.passed && (
            <Button onClick={handleRetry} variant="outline" size="sm">
              Retry Quiz
            </Button>
          )}
        </div>
      )}

      {/* API error */}
      {apiError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {apiError}
        </div>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question, qIdx) => {
          const selectedKey = answers[qIdx];
          const qResult = resultByQuestionId[question.id];
          const options = question.options || [];

          return (
            <div key={question.id} className="bg-white rounded-2xl border border-[#F0E8E5] p-5">
              <p className="font-medium text-textDark mb-4 leading-relaxed">
                <span className="text-secondary font-bold mr-2">{qIdx + 1}.</span>
                {question.text}
              </p>

              <div className="space-y-2.5">
                {options.map(({ key, text }) => {
                  const isSelected = selectedKey === key;
                  const showCorrect = submitted && qResult?.correct_answer === key;
                  const showWrong = submitted && isSelected && !qResult?.is_correct;

                  return (
                    <button
                      key={key}
                      onClick={() => handleSelect(qIdx, key)}
                      disabled={submitted}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-150 ${
                        showCorrect
                          ? 'bg-green-50 border-green-400 text-green-700 font-medium'
                          : showWrong
                          ? 'bg-red-50 border-red-400 text-red-600'
                          : isSelected && !submitted
                          ? 'bg-accent border-secondary text-secondary font-medium'
                          : 'border-[#E5DDD9] text-textDark hover:border-secondary hover:bg-accent/30 disabled:cursor-default'
                      }`}
                    >
                      <span className="flex items-start gap-3">
                        <span className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold ${
                          showCorrect
                            ? 'bg-green-500 border-green-500 text-white'
                            : showWrong
                            ? 'bg-red-500 border-red-500 text-white'
                            : isSelected && !submitted
                            ? 'bg-secondary border-secondary text-white'
                            : 'border-gray-300 text-gray-400'
                        }`}>
                          {showCorrect ? '✓' : showWrong ? '✗' : key}
                        </span>
                        {text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {submitted && qResult && (
                <div className={`mt-3 p-3 rounded-xl text-xs leading-relaxed ${
                  qResult.is_correct ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  <span className="font-semibold">Explanation: </span>
                  {qResult.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit */}
      {!submitted && (
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSubmit}
            variant="primary"
            size="lg"
            disabled={submitting || Object.keys(answers).length < questions.length}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                Submitting...
              </span>
            ) : (
              `Submit Quiz (${Object.keys(answers).length}/${questions.length} answered)`
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
