/* eslint-disable max-lines */

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
    reset: "Reset",
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
    backToLobby: "Back to Lobby",
    backToLobbyTooltip: "Return to room and adjust settings",

    // Notifications
    roomCodeCreated: "Room code: {code}",
    sessionLeft: "You left the channel. Session reset.",
    categorySelectionsCleared: "Category selections cleared.",
    readyToPlay: "You are ready to play!",
    notReadyMessage: "You left the ready state.",
    resetSessionTooltip: "Reset session and create a new ID",
    sessionRestored: "Welcome back! Your device ID was restored.",
    backgroundConnectionMessage: "You're in the background, but the connection remains active",
    tryingToReconnect: "Trying to reconnect...",
    connectedDevices: "Connected Devices",

    categoryDrawer: {
      title: "Quiz Categories",
      description: {
        admin: "You can monitor the votes in real time. Only guests pick categories.",
        votingClosed: "Voting has closed. Wait for the game to begin.",
        open: "Select up to five categories. Drag the handle to expand or close.",
      },
      statusLabel: "Status",
      status: {
        votingClosed: "Voting closed",
        adminControl: "You control when voting ends",
        waiting: "Waiting for the admin to close voting",
      },
      badges: {
        selected: "Selected",
        voteHint: "Tap to vote",
      },
      selectionNote: "You can tweak your choices anytime while you are in the room.",
      clearSelections: "Clear selections",
      adminMessage:
        "Only guests see voting options. This panel displays live progress to help decide when to close voting.",
      selectedEmpty: "No categories selected yet.",
      rankingTitle: "Most voted categories",
      rankingSubtitle: "The top 10 picks will shape the next questions",
      resultsLocked: "The administrator must close voting to reveal the category ranking.",
      noVotes: "No votes recorded yet. Cast your selections to appear on the ranking!",
      info: "Each player can vote for up to {limit} categories. The 10 most popular themes will define the game topics.",
      closePanel: "Close panel",
    },
    categoryPanel: {
      open: "Open category panel",
      close: "Close category panel",
    },
    categoryResults: {
      title: "Category Results",
      description: "These are the 10 most voted categories after voting has closed.",
      empty: "We still don't have enough votes to build a list.",
    },
    votingControl: {
      title: "Category control",
      descriptionOpen: "Monitor votes in real time and close when you're ready.",
      buttonClose: "Close voting",
    },
    readyToggle: {
      markReady: "I'm ready",
      cancelReady: "Cancel ready",
      tooltip: {
        changeStatus: "Change your ready status",
        gameStarted: "The game has already started",
        onlySelf: "Only the player can change this status",
      },
    },
    categoryNames: {
      geography: "Geography",
      mathematics: "Mathematics",
      history: "History",
      science: "Science",
      art: "Art",
      sports: "Sports",
      technology: "Technology",
      literature: "Literature",
      music: "Music",
      cinema: "Cinema",
      "current-events": "Current Events",
      mythology: "Mythology",
      astronomy: "Astronomy",
      biology: "Biology",
      chemistry: "Chemistry",
      politics: "Politics",
      economics: "Economics",
      "pop-culture": "Pop Culture",
      languages: "Languages",
      inventions: "Inventions",
    },

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
    errors: {
      fetchQuestions: "Error fetching questions from server. Check your connection.",
      noQuestions: "No questions found for the selected categories.",
    },

    startScreen: {
      subtitle: "Test your knowledge and reach the top!",
      howToPlay: "How to Play",
      stats: {
        questions: {
          value: "10 Questions",
          description: "Per match",
        },
        timer: {
          value: "1 Minute",
          description: "Per question",
        },
        points: {
          value: "Points",
          description: "Accumulate points",
        },
        difficulty: {
          value: "Difficulty",
          description: "Progressive",
        },
      },
      startButton: "Start",
    },
    rulesScreen: {
      subtitle: "Get ready for the challenge!",
      welcomeMessage: "Ready to showcase your knowledge?",
      challengeMessage: "Answer correctly and accumulate points to reach the top!",
      selectedCategories: "Selected Categories",
      howToPlay: "Game Rules",
      stats: {
        questions: {
          value: "10 Questions",
          description: "Per match",
        },
        timer: {
          value: "1 Minute",
          description: "Per question",
        },
        points: {
          value: "Points",
          description: "Accumulate points",
        },
        difficulty: {
          value: "Difficulty",
          description: "Progressive",
        },
      },
      startButton: "Start Quiz",
    },
    gameScreen: {
      scoreLabel: "Score:",
      timerLabel: "Time remaining",
      difficulty: {
        level1: "Very Easy",
        level2: "Easy",
        level3: "Medium",
        level4: "Hard",
        level5: "Very Hard",
      },
      worthLabel: "Worth",
      pointsSuffix: "pts",
      feedback: {
        correct: "🎉 Correct!",
        incorrect: "❌ Incorrect!",
        points: "+{points} points",
        correctAnswer: "Correct answer: {answer}",
      },
      actions: {
        submit: "Submit Answer",
        nextQuestion: "Next Question",
        viewResults: "View Result",
        waitingForAdmin: "Waiting for admin to continue...",
      },
    },
    timer: {
      label: "Time remaining",
    },

    // Results
    results: {
      title: "Game Over!",
      points: "Points",
      correct: "Correct Answers",
      ranking: "Channel Ranking",
      backToLobby: "Back to Lobby",
      noRanking: "Ranking will show up once the admin finishes the game.",
    },
  },

  // Language Selector
  language: {
    select: "Select language",
    current: "Current language",
    change: "Change language",
  },
} as const;
