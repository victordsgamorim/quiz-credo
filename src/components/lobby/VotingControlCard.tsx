import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocale } from "@/contexts/LocaleContext";

type VotingControlCardProps = {
  isVotingClosed: boolean;
  onCloseVoting: () => void;
};

/*
 * Card component for controlling category voting status.
 */
export const VotingControlCard = ({ isVotingClosed, onCloseVoting }: VotingControlCardProps) => {
  const { t } = useLocale();
  return (
    <Card className="glass-card p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <p className="font-semibold">{t.lobby.votingControl.title}</p>
          <p className="text-sm text-muted-foreground">
            {isVotingClosed
              ? t.lobby.votingClosedDescription
              : t.lobby.votingControl.descriptionOpen}
          </p>
        </div>
        <Button
          onClick={onCloseVoting}
          disabled={isVotingClosed}
          className="w-full sm:w-auto"
          variant={isVotingClosed ? "outline" : "default"}
        >
          {isVotingClosed ? t.lobby.votingClosed : t.lobby.votingControl.buttonClose}
        </Button>
      </div>
    </Card>
  );
};
