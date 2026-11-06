import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { LanguageMenu } from "@/components/lobby/LanguageMenu";
import { TutorialContent } from "@/components/tutorial/TutorialContent";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";

/*
 * The tutorial's page (/tutorial), opened from the home screen: the game's rules with the default
 * settings. Inside a room, the lobby opens the same tutorial in a dialog instead (TutorialDialog),
 * so the player stays in their room.
 */
const Tutorial = () => {
  const { t } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();

  // Back to where the player came from; to the home screen when the page was opened by its link
  const handleBack = () => {
    if (location.key === "default") {
      void navigate("/", { replace: true });
    } else {
      void navigate(-1);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Like the lobby's header: the way back on the left, the languages on the right */}
      <TutorialContent
        start={
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            title={t.tutorial.back}
            aria-label={t.tutorial.back}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
        }
        end={<LanguageMenu isFlagOnly />}
      />
    </div>
  );
};

export default Tutorial;
