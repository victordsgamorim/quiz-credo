import { useRef } from "react";

import { ArrowRight, Send, Volume2 } from "lucide-react";

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
}: ActionPanelProps) => {
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
    <div className="mt-auto">
      <audio ref={audioRef} src={`${import.meta.env.BASE_URL}assets/audios/ask.mp3`} />
      {canInteract && (
        <div className="flex gap-2 items-center">
          {!isShowingFeedback && (
            <Button
              onClick={handlePlayAudio}
              size="icon"
              className="h-12 w-12 bg-primary/20 text-primary hover:bg-primary/30 border-2 border-primary/40 rounded-lg gold-glow"
              title="Ask the audience"
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

  // Admin can always submit (even without selecting an answer) to control the game flow
  const isDisabled = !isAdmin && selectedAnswer === null;

  return (
    <Button
      onClick={onSubmit}
      disabled={isDisabled}
      size="icon"
      className="h-12 w-12 bg-primary/20 text-primary hover:bg-primary/30 border-2 border-primary/40 rounded-lg gold-glow disabled:opacity-50 disabled:hover:bg-primary/20"
      title={t.quiz.gameScreen.actions.submit}
    >
      <Send className="w-6 h-6" />
    </Button>
  );
};
