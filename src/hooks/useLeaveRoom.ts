import { useCallback } from "react";

import { useBackgroundMusicContext } from "@/contexts/BackgroundMusicContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useCategoryStorage } from "@/hooks/useCategoryStorage";
import type { useSocket } from "@/hooks/useSocket";

/*
 * Leaves the device's room from its lobby, for the home screen: the lobby's leave button, and back
 * from the lobby. The room forgets the device (the admin's leave closes it), and the device starts
 * over with a new session.
 */
export const useLeaveRoom = (socket: ReturnType<typeof useSocket>) => {
  const { stopIntroMusic } = useBackgroundMusicContext();
  const { unlockLocaleChange } = useLocale();
  const { clearPersistedCategories } = useCategoryStorage();
  const { currentChannel, leaveChannel, clearDeviceSession, connect } = socket;

  return useCallback(() => {
    stopIntroMusic();
    leaveChannel();
    clearDeviceSession();
    if (currentChannel) {
      clearPersistedCategories(currentChannel);
    }
    unlockLocaleChange();
    setTimeout(() => connect(), 500);
  }, [
    stopIntroMusic,
    leaveChannel,
    clearDeviceSession,
    currentChannel,
    clearPersistedCategories,
    unlockLocaleChange,
    connect,
  ]);
};
