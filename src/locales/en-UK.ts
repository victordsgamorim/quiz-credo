/* eslint-disable max-lines */

import type { TranslationKeys } from "./pt-BR";

export const enUK: TranslationKeys = {
  // Common
  common: {
    pageNotFound: "This page doesn't exist. Check the link or go back to the start.",
    backHome: "Back to start",
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
    qrCode: "QR code",
    createRoom: "Create Room",
    joinRoom: "Join a Room",
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
    closeChannel: "Close channel",
    backToLobby: "Back to Lobby",
    backToLobbyTooltip: "Return to room and adjust settings",

    // Notifications
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
    roomMenu: {
      open: "Room options",
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
    // Home screen deck of sample questions
    deck: {
      label: "Sample questions",
      previous: "Previous question",
      next: "Next question",
      questions: {
        geography: "Which is the largest ocean on the planet?",
        history: "Which civilisation built the pyramids of Giza?",
        art: "Who painted the Mona Lisa?",
        astronomy: "Which planet is known as the red planet?",
        music: "How many strings does a standard guitar have?",
        sports: "How many players per team are on the pitch in football?",
        cinema: "What is the lion cub in The Lion King called?",
        mathematics: "What is 7 times 8?",
        biology: "Which organ pumps blood around the body?",
        mythology: "Who is the god of thunder in Norse mythology?",
        literature: "Who wrote Don Quixote?",
        chemistry: "What is the chemical symbol for gold?",
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
      gossip: "Gossip",
    },

    gameSettings: {
      title: "Game Settings",
      description: "Configure match parameters",

      questionCount: {
        label: "Number of Questions",
        description: "Total questions in the quiz",
      },

      timerDuration: {
        label: "Time per Question",
        description: "Timer duration for each question",
        unlimited: "Unlimited",
        options: {
          60: "1 Minute",
          90: "1:30 Minutes",
          120: "2 Minutes",
          180: "3 Minutes",
          240: "4 Minutes",
          300: "5 Minutes",
        },
      },

      maxCategorySelections: {
        label: "Max Categories per Player",
        description: "How many categories each player can vote for",
      },

      topCategoriesCount: {
        label: "Top Game Categories",
        description: "How many top-voted categories define the questions",
      },

      streakThreshold: {
        label: "Streak for Multiplier",
        description: "Correct answers in a row that start the points multiplier (up to ×{max})",
      },

      timeThresholds: {
        label: "Time Warnings",
        description: "When to change timer color",
        lowTime: "Low Time (yellow)",
        criticalTime: "Critical Time (red)",
      },

      enableQuestionCache: {
        label: "Save Question History",
        description: "Enables saving answered questions to the database to avoid repetitions",
      },

      enableDebugMode: {
        label: "Debug Mode",
        description:
          "Lets the administrator start the game and answer the questions alone, without guests",
      },

      restoreDefaults: "Restore Defaults",
      adminOnly: "Only the administrator can change these settings",
    },

    powerUpSettings: {
      title: "Power-up Settings",
      description: "Choose which power-ups are in the game and what each one is worth",
      open: "Set up power-ups",
      isEnabled: {
        label: "Power-ups in the game",
        description: "Off, nobody gets or uses power-ups in this game",
        off: "Power-ups off: they aren't part of this game",
      },
      handSize: {
        label: "Power-ups per player",
        description: "How many power-ups each player gets, drawn from the ones turned on",
        limited: "Only {count} turned on: each player gets {count}",
      },
      allOff: "No power-up turned on: the game has no power-ups",
      kinds: { boost: "Advantage", attack: "Disadvantage" },
      toggle: "Use {power} in the game",
      freezeQuestions: "Frozen questions",
      stealPoints: "Points stolen (at most)",
      bonusPoints: "Bonus points",
      cutPercent: "Points the target still gets",
    },

    // Errors
    errors: {
      invalidCode: "Enter a valid channel ID",
      enterName: "Enter your name before joining the room",
      waitConnection: "Wait for the connection to be established",
      authRequired: "Sign in to create a room.",
      adminRequired: "Your account doesn't have administrator permission.",
      roomFull: "The room is full.",
      tooManyRooms: "The server has too many rooms open. Try again in a moment.",
      rateLimited: "Too many attempts. Wait a moment and try again.",
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
    resetSession: "Reset session",
    deviceId: "Device ID",
    editName: "Edit Name",
    editYourName: "Edit your name",
    enterNewName: "Enter your new name",

    // Kick/Remove
    removeGuest: "Guest removed from room.",
    forceLeave: {
      removedByAdmin: "You were removed from the room by the administrator.",
      adminLeft: "The administrator ended the room.",
      adminDisconnected: "The administrator lost connection and the room was closed.",
      adminInactiveTimeout: "The room was closed due to administrator inactivity.",
      closedWhileOffline: "The room was closed while you were offline.",
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
    // The game's rules, one card each, with the room's settings
    rulesScreen: {
      howToPlay: "Game Rules",
      previous: "Previous rule",
      next: "Next rule",
      rules: {
        questions: {
          title: "Questions",
          description: "Whoever scores the most points wins",
        },
        timer: {
          title: "Time",
          description: "To answer each question",
          unlimited: "No time limit to answer",
        },
        streak: {
          title: "Streak",
          description: "{count} correct answers in a row multiply your points up to ×{max}",
          descriptionOne: "Every correct answer in a row multiplies your points, up to ×{max}",
        },
        difficulty: {
          title: "Difficulty",
          description: "Questions get harder and are worth more points",
        },
        categories: {
          title: "Categories",
          all: "All categories",
        },
        // Titled with the power-ups' name in the game (gameScreen.powerUps.label)
        powerUps: {
          description: "Each player gets {count} to use once each",
          descriptionOne: "Each player gets 1 to use once",
          off: "Turned off for this game",
        },
      },
      startButton: "Start Quiz",
      backToLobby: "Return to Lobby",
      waitingForAdmin: "Waiting for the admin to start",
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
      guestsSelected: "{selected}/{total} have chosen",
      pointsSuffix: "pts",
      streak: {
        label: "Answer streak",
        progress: "{count} of {total}",
        multiplier: "{multiplier} multiplier active",
        frozen: "Frozen: a wrong answer won't reset the streak",
      },
      ranking: {
        title: "Leaderboard",
        you: "(you)",
      },
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
        askAudience: "Ask the audience",
      },
      powerUps: {
        label: "Power-ups",
        used: "already used",
        freeze: {
          name: "Freeze",
          hint: "Freezes your streak for {count} questions: a miss won't reset it",
          hintOne: "Freezes your streak on this question: a miss won't reset it",
        },
        steal: { name: "Steal", hint: "Steals up to {points} points from an opponent" },
        shield: { name: "Shield", hint: "Protects you from this question's disadvantages" },
        break: { name: "Break", hint: "Resets an opponent's streak and multiplier" },
        bonus: { name: "Bonus", hint: "Get {points} bonus points at once" },
        cut: { name: "Cut", hint: "An opponent only gets {percent}% of this question's points" },
        pickTarget: "Who gets {power}?",
        noTargets: "Needs another player in the room",
        lastQuestion: "Power-ups don't work on the last question",
        outcomes: {
          theirShieldBlocked: "{name}'s shield blocked your {power}",
          youHit: "{power} hit {name}!",
          stealYouHit: "You stole {points} points from {name}!",
          stealNothing: "{name} had no points to steal",
          breakYouHit: "You broke {name}'s streak!",
          cutYouHit: "You cut {name}'s points on this question!",
        },
      },
    },
    timer: {
      label: "Time remaining",
    },
    adminAway: {
      title: "The administrator has disconnected",
      description:
        "The game is paused until the administrator comes back. If the countdown runs out, the room will close.",
      timeLeft: "The room closes in {time}",
      leave: "Leave room",
    },
    quitGame: {
      title: "Do you really want to go back?",
      description: "If you go back, you give up the game and leave the room.",
      quit: "Yes, I give up",
      stay: "Keep playing",
    },

    // Results
    results: {
      title: "Game Over!",
      points: "Points",
      correctOf: "{correct} of {total} correct",
      ranking: "Channel Ranking",
      podium: "Podium",
      place: "Place {position}",
      backToLobby: "Back to Lobby",
      noRanking: "Ranking will show up once the admin finishes the game.",
    },
  },

  tutorial: {
    open: "How to play",
    title: "How to play",
    intro:
      "Answer with your group, get answers right in a row to multiply your points, and use power-ups to turn the game around.",
    back: "Back",
    close: "Close the tutorial",
    tabsLabel: "Parts of the tutorial",
    // The sample players of the ranking and of the list a disadvantage is used on
    player: "Player {number}",
    tabs: {
      game: "The game",
      points: "Points",
      powerUps: "Power-ups",
    },
    game: {
      room: {
        title: "From the lobby to the first question",
        steps: {
          create: "The admin creates the room and shows its code or QR code.",
          join: "Each player joins on their phone with the code and picks a name.",
          vote: "Each player votes for the categories they want in the questions.",
          ready: 'With their categories picked, everyone taps "I\'m ready".',
          start: "Once everyone is ready, the admin starts the game.",
        },
      },
      question: {
        title: "Questions and answers",
        description:
          "Each question has four options. Tap yours: you can change it until time runs out or the admin reveals the right one. The admin's screen reads the question aloud.",
        label: "Question 1",
        text: "Which planet is known as the red planet?",
        options: {
          a: "Venus",
          b: "Mars",
          c: "Jupiter",
          d: "Saturn",
        },
        pick: "Pick an option to reveal the answer.",
        reveal: "Reveal answer",
        again: "Try again",
        correct: "Right! The correct answer lights up green and shows the points earned.",
        wrong: "Wrong: yours turns red and the right one shows in green.",
      },
      timer: {
        title: "Time",
        description:
          "Each question has a time limit. The bar drains, turns gold when time is running out and red in the last seconds. When time runs out the question closes: anyone who hasn't answered gets no points. The admin can also leave the questions without a time limit.",
        replay: "Watch again",
      },
      difficulty: {
        title: "Difficulty",
        description:
          "Questions start easy and get harder as the game goes on. The harder the question, the more points it's worth.",
      },
      categories: {
        title: "Categories",
        description:
          "Questions come from the most voted categories in the lobby. Each question draws one of them, and none repeats before all of them have come up. With no votes, all of them count.",
      },
    },
    points: {
      worth: {
        title: "What each question is worth",
        description:
          "A right answer earns the question's points, shown as \"Worth\" at the top of the screen, beside your score. A wrong answer or no answer earns nothing, and answering faster isn't worth more.",
      },
      streak: {
        title: "Streak bar",
        description:
          "Every right answer in a row fills the bar. Once it's full it supercharges and your points get multiplied; every further right answer raises the multiplier, up to ×{max}. A wrong answer empties the bar.",
        hit: "Get it right",
        miss: "Get it wrong",
        worth: "The next {points}-point question is worth {total}",
      },
      ranking: {
        title: "Leaderboard",
        description:
          "During the game, the live leaderboard shows everyone's place, counting stolen and bonus points too. After the last question, the top three take the podium.",
        climb: "Add {points} points",
        reset: "Start over",
      },
    },
    powerUps: {
      try: "Try it",
      tryLabel: "Try {power}",
      rules: {
        title: "Rules",
        hand: "At the start of the game, each player is dealt a few power-ups at random.",
        once: "Each power-up works once per game: once used, it turns grey.",
        onePerQuestion: "One power-up per question: the others wait for the next one.",
        open: "Only while the question is open, before the answer shows or time runs out.",
        lastQuestion: "They don't work on the last question.",
        players: "Only players who answer get power-ups, so the admin sits them out.",
      },
      advantages: {
        title: "Advantages",
        description: "They act on you, as soon as you tap them.",
      },
      disadvantages: {
        title: "Disadvantages",
        description: "They act on an opponent you pick from the list of players.",
      },
      // What each one does, in a few words (their hints in the game, without the numbers)
      summaries: {
        freeze: "Freezes your streak for a few questions: a miss won't reset it",
        steal: "Steals points from an opponent",
        shield: "Protects you from this question's disadvantages",
        break: "Resets an opponent's streak and multiplier",
        bonus: "Get bonus points at once",
        cut: "An opponent only gets part of this question's points",
      },
      details: {
        shield:
          "It even works on disadvantages used before the shield, on the same question. On the next question it no longer protects you.",
        freeze:
          "It counts the question you use it on. Right answers fill the bar as usual, and it gives no points.",
        bonus:
          "The points go into your score at once, even if you get the answer wrong. The multiplier doesn't count.",
        steal:
          "The points leave the opponent's score and go to yours. Someone with fewer loses only what they have: nobody goes below zero.",
        break:
          "It works from the question it's used on: their answer there is already worth ×1. The points they have stay, and Freeze doesn't stop it.",
        cut: "It works on their answer to this question, whatever its level or the multiplier: if they get it right, they only get part of the points. Their streak still counts, and two cuts on the same question don't add up.",
      },
      blocked: "Blocked",
    },
  },

  // Language Selector
  language: {
    select: "Select language",
    current: "Current language",
    change: "Change language",
  },

  // Reset Password
  resetPassword: {
    title: "Reset Password",
    subtitle: "Choose a new password for your account",
    verifying: "Verifying reset link...",
    newPassword: "New password",
    confirmPassword: "Confirm new password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    submit: "Reset password",
    submitting: "Resetting...",
    successTitle: "Password reset!",
    successMessage: "Your password has been changed successfully. You can go back to the game now.",
    invalidTitle: "Invalid or expired link",
    invalidMessage: "Please request a new password reset email and try again.",
    passwordMinLength: "Password must be at least 6 characters long.",
    passwordMismatch: "Passwords do not match.",
    updateFailed: "Could not reset the password. Please try again.",
  },
} as const;
