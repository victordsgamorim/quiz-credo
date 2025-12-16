import { ArrowRight, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLocale, interpolate } from "@/contexts/LocaleContext";
import { Question } from "@/types/quiz";

type ActionPanelProps = {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  isShowingFeedback: boolean;
  isCorrect: boolean;
  onSubmit: () => void;
  onNextQuestion: () => void;
};

export const ActionPanel = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  isShowingFeedback,
  isCorrect,
  onSubmit,
  onNextQuestion,
}: ActionPanelProps) => (
  <div className="mt-auto">
    {isShowingFeedback ? (
      <FeedbackActions
        question={question}
        isCorrect={isCorrect}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        onNextQuestion={onNextQuestion}
      />
    ) : (
      <SubmitAnswerButton onSubmit={onSubmit} selectedAnswer={selectedAnswer} />
    )}
  </div>
);

const FeedbackActions = ({
  question,
  isCorrect,
  onNextQuestion,
  questionNumber,
  totalQuestions,
}: {
  question: Question;
  isCorrect: boolean;
  onNextQuestion: () => void;
  questionNumber: number;
  totalQuestions: number;
}) => {
  const { t } = useLocale();
  const isLastQuestion = questionNumber >= totalQuestions;

  return (
    <div className="space-y-4">
      <FeedbackBanner isCorrect={isCorrect} question={question} />
      <Button
        onClick={onNextQuestion}
        className="w-full h-14 text-lg font-display font-semibold bg-accent text-accent-foreground hover:bg-accent/90 blue-glow"
      >
        {isLastQuestion ? (
          t.quiz.gameScreen.actions.viewResults
        ) : (
          <>
            {t.quiz.gameScreen.actions.nextQuestion}
            <ArrowRight className="w-5 h-5 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
};

const FeedbackBanner = ({ isCorrect, question }: { isCorrect: boolean; question: Question }) => {
  const { t } = useLocale();
  const feedbackStyles = isCorrect
    ? "bg-success/20 border border-success/50"
    : "bg-destructive/20 border border-destructive/50";

  return (
    <div className={`text-center p-4 rounded-xl animate-scale-in ${feedbackStyles}`}>
      <p
        className={`text-xl font-bold font-display ${isCorrect ? "text-success" : "text-destructive"}`}
      >
        {isCorrect ? t.quiz.gameScreen.feedback.correct : t.quiz.gameScreen.feedback.incorrect}
      </p>
      {isCorrect ? (
        <p className="text-sm text-muted-foreground mt-1">
          {interpolate(t.quiz.gameScreen.feedback.points, { points: question.points })}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground mt-1">
          {interpolate(t.quiz.gameScreen.feedback.correctAnswer, {
            answer: question.options[question.correctAnswer],
          })}
        </p>
      )}
    </div>
  );
};

const SubmitAnswerButton = ({
  onSubmit,
  selectedAnswer,
}: {
  onSubmit: () => void;
  selectedAnswer: number | null;
}) => {
  const { t } = useLocale();

  return (
    <Button
      onClick={onSubmit}
      disabled={selectedAnswer === null}
      className="w-full h-14 text-lg font-display font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gold-glow disabled:opacity-50 disabled:shadow-none"
    >
      <Send className="w-5 h-5 mr-2" />
      {t.quiz.gameScreen.actions.submit}
    </Button>
  );
};
