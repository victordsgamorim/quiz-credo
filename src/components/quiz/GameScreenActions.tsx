import { ArrowRight, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
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
  isAdmin: boolean;
  isSocketMode: boolean;
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
  isAdmin,
  isSocketMode,
}: ActionPanelProps) => (
  <div className="mt-auto">
    {isShowingFeedback ? (
      <FeedbackActions
        question={question}
        isCorrect={isCorrect}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        onNextQuestion={onNextQuestion}
        isAdmin={isAdmin}
        isSocketMode={isSocketMode}
      />
    ) : (
      <SubmitAnswerButton
        onSubmit={onSubmit}
        selectedAnswer={selectedAnswer}
        isAdmin={isAdmin}
        isSocketMode={isSocketMode}
      />
    )}
  </div>
);

const FeedbackActions = ({
  onNextQuestion,
  questionNumber,
  totalQuestions,
  isAdmin,
  isSocketMode,
}: {
  question: Question;
  isCorrect: boolean;
  onNextQuestion: () => void;
  questionNumber: number;
  totalQuestions: number;
  isAdmin: boolean;
  isSocketMode: boolean;
}) => {
  const { t } = useLocale();
  const isLastQuestion = questionNumber >= totalQuestions;

  // In socket mode, only ADMIN can advance. Guests wait for server sync.
  const canAdvance = !isSocketMode || isAdmin;

  if (!canAdvance) {
    return null;
  }

  return (
    <Button
      onClick={onNextQuestion}
      size="icon"
      className="h-12 w-12 bg-primary/20 text-primary hover:bg-primary/30 border-2 border-primary/40 rounded-lg gold-glow"
      title={
        isLastQuestion
          ? t.quiz.gameScreen.actions.viewResults
          : t.quiz.gameScreen.actions.nextQuestion
      }
    >
      <ArrowRight className="w-6 h-6" />
    </Button>
  );
};

const SubmitAnswerButton = ({
  onSubmit,
  selectedAnswer,
  isAdmin,
  isSocketMode,
}: {
  onSubmit: () => void;
  selectedAnswer: number | null;
  isAdmin: boolean;
  isSocketMode: boolean;
}) => {
  const { t } = useLocale();

  // In socket mode, only ADMIN can submit. Guests wait for admin to submit.
  const canSubmit = !isSocketMode || isAdmin;

  if (!canSubmit) {
    return null;
  }

  return (
    <Button
      onClick={onSubmit}
      disabled={selectedAnswer === null}
      size="icon"
      className="h-12 w-12 bg-primary/20 text-primary hover:bg-primary/30 border-2 border-primary/40 rounded-lg gold-glow disabled:opacity-50 disabled:hover:bg-primary/20"
      title={t.quiz.gameScreen.actions.submit}
    >
      <Send className="w-6 h-6" />
    </Button>
  );
};
