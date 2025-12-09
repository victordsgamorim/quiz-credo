import { Question } from '@/types/quiz';
import { QuestionCard } from './QuestionCard';
import { AnswerOption } from './AnswerOption';
import { Timer } from './Timer';
import { ProgressBar } from './ProgressBar';
import { Button } from '@/components/ui/button';
import { useTimer } from '@/hooks/useTimer';
import { ArrowRight, Send } from 'lucide-react';

interface GameScreenProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  score: number;
  selectedAnswer: number | null;
  showFeedback: boolean;
  onSelectAnswer: (index: number) => void;
  onSubmitAnswer: (elapsedTime: number) => void;
  onNextQuestion: () => void;
}

const TIMER_DURATION = 60; // 1 minute

export const GameScreen = ({
  question,
  questionNumber,
  totalQuestions,
  score,
  selectedAnswer,
  showFeedback,
  onSelectAnswer,
  onSubmitAnswer,
  onNextQuestion,
}: GameScreenProps) => {
  const handleTimeUp = (elapsed: number) => {
    if (!showFeedback) {
      onSubmitAnswer(elapsed);
    }
  };

  const { timeLeft, progress, isLowTime, isCriticalTime, getElapsedTime, stop } = useTimer({
    duration: TIMER_DURATION,
    onTimeUp: handleTimeUp,
    isActive: !showFeedback,
  });

  const handleSubmit = () => {
    stop();
    onSubmitAnswer(getElapsedTime());
  };

  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <div className="min-h-screen flex flex-col p-4 pb-8">
      {/* Header */}
      <header className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Pontos:</span>
            <span className="gold-text font-bold text-xl font-display">{score}</span>
          </div>
          <ProgressBar current={questionNumber - 1} total={totalQuestions} />
        </div>
        <Timer
          timeLeft={timeLeft}
          progress={progress}
          isLowTime={isLowTime}
          isCriticalTime={isCriticalTime}
        />
      </header>

      {/* Question */}
      <div className="mb-6">
        <QuestionCard
          question={question}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
        />
      </div>

      {/* Answer Options */}
      <div className="flex-1 grid grid-cols-1 gap-3 sm:gap-4 mb-6">
        {question.options.map((option, index) => (
          <AnswerOption
            key={index}
            option={option}
            index={index}
            isSelected={selectedAnswer === index}
            isCorrect={isCorrect}
            showFeedback={showFeedback}
            correctAnswerIndex={question.correctAnswer}
            onSelect={onSelectAnswer}
            disabled={showFeedback}
          />
        ))}
      </div>

      {/* Action Button */}
      <div className="mt-auto">
        {!showFeedback ? (
          <Button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="w-full h-14 text-lg font-display font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gold-glow disabled:opacity-50 disabled:shadow-none"
          >
            <Send className="w-5 h-5 mr-2" />
            Confirmar Resposta
          </Button>
        ) : (
          <div className="space-y-4">
            <div className={`text-center p-4 rounded-xl animate-scale-in ${
              isCorrect ? 'bg-success/20 border border-success/50' : 'bg-destructive/20 border border-destructive/50'
            }`}>
              <p className={`text-xl font-bold font-display ${isCorrect ? 'text-success' : 'text-destructive'}`}>
                {isCorrect ? '🎉 Correto!' : '❌ Incorreto!'}
              </p>
              {isCorrect && (
                <p className="text-sm text-muted-foreground mt-1">
                  +{question.points} pontos
                </p>
              )}
              {!isCorrect && (
                <p className="text-sm text-muted-foreground mt-1">
                  Resposta correta: {question.options[question.correctAnswer]}
                </p>
              )}
            </div>
            <Button
              onClick={onNextQuestion}
              className="w-full h-14 text-lg font-display font-semibold bg-accent text-accent-foreground hover:bg-accent/90 blue-glow"
            >
              {questionNumber < totalQuestions ? (
                <>
                  Próxima Pergunta
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              ) : (
                'Ver Resultado'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
