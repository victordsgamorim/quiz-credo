import { useRef } from "react";

import { ArrowRight, Send, Volume2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import { Question } from "@/types/quiz";

const ACTION_BUTTON_CLASS =
  "h-11 w-11 sm:h-12 sm:w-12 bg-primary/20 text-primary hover:bg-primary/30 border-2 border-primary/40 rounded-lg gold-glow";

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
}: ActionPanelProps) => {
  const { t } = useLocale();
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      void audioRef.current.play();
    }
  };

  // In socket mode, only ADMIN can see and use the buttons. Guests wait for server sync.
  const canInteract = !isSocketMode || isAdmin;

  return (
    <div>
      <audio ref={audioRef} src={`${import.meta.env.BASE_URL}assets/audios/ask.mp3`} />
      {canInteract && (
        <div className="flex gap-2 items-center">
          {!isShowingFeedback && (
            <Button
              onClick={handlePlayAudio}
              size="icon"
              className={ACTION_BUTTON_CLASS}
              title={t.quiz.gameScreen.actions.askAudience}
              aria-label={t.quiz.gameScreen.actions.askAudience}
            >
              <Volume2 className="w-6 h-6" />
            </Button>
          )}
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
      )}
    </div>
  );
};

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
  const nextLabel = isLastQuestion
    ? t.quiz.gameScreen.actions.viewResults
    : t.quiz.gameScreen.actions.nextQuestion;

  // In socket mode, only ADMIN can advance. Guests wait for server sync.
  const canAdvance = !isSocketMode || isAdmin;

  if (!canAdvance) {
    return null;
  }

  return (
    <Button
      onClick={onNextQuestion}
      size="icon"
      className={ACTION_BUTTON_CLASS}
      title={nextLabel}
      aria-label={nextLabel}
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

  // Admin can always submit (even without selecting an answer) to control the game flow
  const isDisabled = !isAdmin && selectedAnswer === null;

  return (
    <Button
      onClick={onSubmit}
      disabled={isDisabled}
      size="icon"
      className={`${ACTION_BUTTON_CLASS} disabled:opacity-50 disabled:hover:bg-primary/20`}
      title={t.quiz.gameScreen.actions.submit}
      aria-label={t.quiz.gameScreen.actions.submit}
    >
      <Send className="w-6 h-6" />
    </Button>
  );
};
