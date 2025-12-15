import type { TranslationKeys } from "./pt-BR";

export const enUK: TranslationKeys = {
  // Common
  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    confirm: "Confirm",
    close: "Close",
    back: "Back",
    next: "Next",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
  },

  // Lobby
  lobby: {
    title: "Game Lobby",
    subtitle: "Connect to a channel to begin",

    // Connection
    connected: "Connected",
    disconnected: "Disconnected",
    active: "Active",
    background: "In background",
    reconnecting: "Reconnecting...",
    connectingToServer: "Connecting to server...",

    // Room
    roomCreated: "Room Created",
    roomCode: "Room Code",
    shareCode: "Share the code below",
    shareCodeDescription: "Share this code with other players",
    copyCode: "Copy code",
    codeCopied: "Channel ID copied!",
    createRoom: "Create Room",
    createRoomDescription: "Generates a code automatically",
    joinRoom: "Join a Room",
    joinRoomDescription: "Enter the room code",
    enterRoomCode: "Enter the room code",
    yourName: "Your name",
    yourNamePlaceholder: "How do you want to appear in the room?",
    typeCode: "Type the code...",
    leaveRoom: "Leave",

    // Devices
    devices: "devices connected",
    device: "device connected",
    admin: "Administrator",
    guest: "Guest",
    you: "You",
    adminInfo: "You are the administrator of this room and can remove guests.",
    guestInfo: "You are a guest in this room.",

    // Categories
    categories: "Categories",
    categoryVoting: "Category Voting",
    selectCategories: "Select {count} categories",
    categoriesSelected: "{count} of {total} selected",
    clearSelection: "Clear selection",
    viewResults: "View results",
    votingClosed: "Voting closed",
    votingClosedDescription: "Everyone can now see the chosen categories.",
    mostVoted: "Most voted",
    votes: "votes",
    vote: "vote",

    // Readiness
    ready: "Ready",
    notReady: "Waiting",
    markAsReady: "I'm ready",
    readyStatus: "Readiness status",
    allGuestsReady: "All guests are ready.",
    guestsReady: "{ready} of {total} guests confirmed.",
    waitingForGuests:
      "Mark \"I'm ready\" when you're prepared. The administrator will start the game when everyone confirms.",
    cannotStartYet: "The game can only start when all guests are ready.",
    selectAllCategories: "Select all categories before marking as ready.",

    // Game start
    startGame: "Start game",
    gameStarting: "Game started! Good luck!",

    // Errors
    errors: {
      invalidCode: "Enter a valid channel ID",
      enterName: "Enter your name before joining the room",
      waitConnection: "Wait for the connection to be established",
      onlyAdmin: "Only the administrator can start the game.",
      needGuests: "At least one guest must be connected.",
      allGuestsMustBeReady: "All guests must confirm they are ready.",
      deviceNotFound: "Device not found. Try reconnecting.",
      channelNotFound: "Channel not found. Check the code and try again.",
      channelAlreadyExists: "This channel already exists. Try creating another one.",
      maxCategories: "You can choose a maximum of {max} categories.",
      enterChannel: "Join a channel before selecting categories.",
      onlyGuestsVote: "Only guests can vote.",
      votingClosed: "Voting has already been closed.",
    },

    // Session
    sessionReset: "Session reset! New device ID created.",
    returningSession: "Resuming previous session in channel: {channel}",
    resetSession: "Reset session",
    deviceId: "Device ID",

    // Kick/Remove
    removeGuest: "Guest removed from room.",
    forceLeave: {
      removedByAdmin: "You were removed from the room by the administrator.",
      adminLeft: "The administrator ended the room.",
      adminDisconnected: "The administrator lost connection and the room was closed.",
      adminInactiveTimeout: "The room was closed due to administrator inactivity.",
      default: "You were removed from the room.",
    },
  },

  // Quiz
  quiz: {
    title: "Millionaire Brain Quiz",
    subtitle: "Test your knowledge and earn points!",
    start: "Start Quiz",
    question: "Question {current} of {total}",
    score: "Score: {score}",
    timeRemaining: "Time remaining",
    correct: "Correct!",
    incorrect: "Incorrect!",
    submit: "Submit Answer",
    nextQuestion: "Next Question",
    finish: "Finish",

    // Results
    results: {
      title: "Quiz Completed!",
      yourScore: "Your score",
      correctAnswers: "Correct answers",
      playAgain: "Play Again",
      ranking: "Ranking",
      position: "Position",
      player: "Player",
      stats: "Statistics",
    },
  },

  // Language Selector
  language: {
    select: "Select language",
    current: "Current language",
    change: "Change language",
  },
} as const;
