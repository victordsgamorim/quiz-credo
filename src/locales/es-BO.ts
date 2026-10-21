/* eslint-disable max-lines */

import type { TranslationKeys } from "./pt-BR";

export const esBO: TranslationKeys = {
  // Common
  common: {
    pageNotFound: "Esta página no existe. Revisa el enlace o vuelve al inicio.",
    backHome: "Volver al inicio",
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    cancel: "Cancelar",
    confirm: "Confirmar",
    close: "Cerrar",
    back: "Volver",
    next: "Siguiente",
    save: "Guardar",
    delete: "Eliminar",
    reset: "Reiniciar",
    edit: "Editar",
  },

  // Lobby
  lobby: {
    title: "Sala del Juego",
    subtitle: "Conéctate a un canal para comenzar",

    // Connection
    connected: "Conectado",
    disconnected: "Desconectado",
    active: "Activo",
    background: "En segundo plano",
    reconnecting: "Reconectando...",
    connectingToServer: "Conectando al servidor...",

    // Room
    roomCreated: "Sala Creada",
    roomCode: "Código de la Sala",
    shareCode: "Comparte el código a continuación",
    shareCodeDescription: "Comparte este código con otros jugadores",
    copyCode: "Copiar código",
    qrCode: "QR code",
    createRoom: "Crear Sala",
    joinRoom: "Unirse a una Sala",
    enterRoomCode: "Ingresa el código de la sala",
    yourName: "Tu nombre",
    yourNamePlaceholder: "¿Cómo quieres aparecer en la sala?",
    typeCode: "Escribe el código...",
    leaveRoom: "Salir",

    // Devices
    devices: "dispositivos conectados",
    device: "dispositivo conectado",
    admin: "Administrador",
    guest: "Invitado",
    you: "Tú",
    adminInfo: "Eres el administrador de esta sala y puedes eliminar invitados.",
    guestInfo: "Estás como invitado en esta sala.",

    // Categories
    categories: "Categorías",
    categoryVoting: "Votación de Categorías",
    selectCategories: "Selecciona {count} categorías",
    categoriesSelected: "{count} de {total} seleccionadas",
    clearSelection: "Limpiar selección",
    viewResults: "Ver resultados",
    votingClosed: "Votación cerrada",
    votingClosedDescription: "Todos ya pueden ver las categorías elegidas.",
    mostVoted: "Más votadas",
    votes: "votos",
    vote: "voto",

    // Readiness
    ready: "Listo",
    notReady: "Esperando",
    markAsReady: "Estoy listo",
    readyStatus: "Estado de preparación",
    allGuestsReady: "Todos los invitados están listos.",
    guestsReady: "{ready} de {total} invitados confirmaron.",
    waitingForGuests:
      'Marca "Estoy listo" cuando estés preparado. El administrador iniciará el juego cuando todos confirmen.',
    cannotStartYet: "El juego solo puede comenzar cuando todos los invitados estén listos.",
    selectAllCategories: "Selecciona todas las categorías antes de marcar como listo.",

    // Game start
    startGame: "Iniciar juego",
    closeChannel: "Cerrar canal",
    backToLobby: "Volver al Lobby",
    backToLobbyTooltip: "Volver a la sala y ajustar configuraciones",

    // Notifications
    resetSessionTooltip: "Reiniciar sesión y crear un nuevo ID",
    sessionRestored: "¡Bienvenido de nuevo! Tu ID de dispositivo fue recuperado.",
    backgroundConnectionMessage: "Estás en segundo plano, pero la conexión sigue activa",
    tryingToReconnect: "Intentando reconectar...",
    connectedDevices: "Dispositivos conectados",

    categoryDrawer: {
      title: "Categorías del Quiz",
      description: {
        admin: "Puedes ver los votos en tiempo real. Solo los invitados escogen las categorías.",
        votingClosed: "La votación se ha cerrado. Espera a que comience el juego.",
        open: "Selecciona hasta cinco categorías. Arrastra la barra para expandir o cerrar.",
      },
      statusLabel: "Estado",
      status: {
        votingClosed: "Votación cerrada",
        adminControl: "Tú decides cuándo termina la votación",
        waiting: "Esperando que el administrador cierre la votación",
      },
      badges: {
        selected: "Seleccionado",
        voteHint: "Toca para votar",
      },
      selectionNote:
        "Puedes cambiar tus elecciones en cualquier momento mientras estés en la sala.",
      clearSelections: "Limpiar selecciones",
      adminMessage:
        "Solo los invitados ven las opciones de voto. Este panel muestra el progreso en vivo para ayudar a decidir cuándo cerrar la votación.",
      selectedEmpty: "Todavía no hay categorías seleccionadas.",
      rankingTitle: "Categorías más votadas",
      rankingSubtitle: "Las 10 más votadas definirán las siguientes preguntas",
      resultsLocked: "El administrador debe cerrar la votación para mostrar el ranking.",
      noVotes: "Todavía no hay votos registrados. ¡Haz tu selección para aparecer en el ranking!",
      info: "Cada jugador puede votar por hasta {limit} categorías. Las 10 más populares definen los temas del juego.",
      closePanel: "Cerrar panel",
    },
    categoryPanel: {
      open: "Abrir panel de categorías",
      close: "Cerrar panel de categorías",
    },
    categoryResults: {
      title: "Resultados de las categorías",
      description: "Estas son las 10 categorías más votadas tras cerrar la votación.",
      empty: "Todavía no hay suficientes votos para generar una lista.",
    },
    votingControl: {
      title: "Control de votación",
      descriptionOpen: "Sigue los votos en tiempo real y cierra cuando estés listo.",
      buttonClose: "Cerrar votación",
    },
    readyToggle: {
      markReady: "Estoy listo",
      cancelReady: "Cancelar listo",
      tooltip: {
        changeStatus: "Cambia tu estado de listo",
        gameStarted: "El juego ya inició",
        onlySelf: "Solo el jugador puede cambiar este estado",
      },
    },
    // Home screen deck of sample questions
    deck: {
      label: "Preguntas de ejemplo",
      previous: "Pregunta anterior",
      next: "Siguiente pregunta",
      questions: {
        geography: "¿Cuál es el océano más grande del planeta?",
        history: "¿Qué civilización construyó las pirámides de Guiza?",
        art: "¿Quién pintó la Mona Lisa?",
        astronomy: "¿Qué planeta es conocido como el planeta rojo?",
        music: "¿Cuántas cuerdas tiene una guitarra común?",
        sports: "¿Cuántos jugadores por equipo hay en la cancha en el fútbol?",
        cinema: "¿Cómo se llama el cachorro de león de El Rey León?",
        mathematics: "¿Cuánto es 7 por 8?",
        biology: "¿Qué órgano bombea la sangre por el cuerpo?",
        mythology: "¿Quién es el dios del trueno en la mitología nórdica?",
        literature: "¿Quién escribió Don Quijote?",
        chemistry: "¿Cuál es el símbolo químico del oro?",
      },
    },

    categoryNames: {
      geography: "Geografía",
      mathematics: "Matemáticas",
      history: "Historia",
      science: "Ciencias",
      art: "Arte",
      sports: "Deportes",
      technology: "Tecnología",
      literature: "Literatura",
      music: "Música",
      cinema: "Cine",
      "current-events": "Actualidad",
      mythology: "Mitología",
      astronomy: "Astronomía",
      biology: "Biología",
      chemistry: "Química",
      politics: "Política",
      economics: "Economía",
      "pop-culture": "Cultura Pop",
      languages: "Idiomas",
      inventions: "Invenciones",
    },

    gameSettings: {
      title: "Configuración del Juego",
      description: "Configurar parámetros de la partida",

      questionCount: {
        label: "Número de Preguntas",
        description: "Cantidad de preguntas en el cuestionario",
      },

      timerDuration: {
        label: "Tiempo por Pregunta",
        description: "Duración del cronómetro para cada pregunta",
        unlimited: "Sin Límite",
        options: {
          60: "1 Minuto",
          90: "1:30 Minutos",
          120: "2 Minutos",
          180: "3 Minutos",
          240: "4 Minutos",
          300: "5 Minutos",
        },
      },

      maxCategorySelections: {
        label: "Máximo de Categorías por Jugador",
        description: "Cuántas categorías cada jugador puede votar",
      },

      topCategoriesCount: {
        label: "Categorías Top del Juego",
        description: "Cuántas categorías más votadas definen las preguntas",
      },

      streakThreshold: {
        label: "Aciertos para el Multiplicador",
        description: "Aciertos seguidos que activan el multiplicador de puntos (hasta ×{max})",
      },

      timeThresholds: {
        label: "Avisos de Tiempo",
        description: "Cuándo cambiar el color del cronómetro",
        lowTime: "Tiempo Bajo (amarillo)",
        criticalTime: "Tiempo Crítico (rojo)",
      },

      enableQuestionCache: {
        label: "Guardar Historial de Preguntas",
        description:
          "Activa el guardado de las preguntas respondidas en la base de datos para evitar repeticiones",
      },

      enableDebugMode: {
        label: "Modo Debug",
        description:
          "Permite que el administrador inicie el juego y responda las preguntas solo, sin invitados",
      },

      restoreDefaults: "Restaurar Predeterminados",
      adminOnly: "Solo el administrador puede cambiar estas configuraciones",
    },

    powerUpSettings: {
      title: "Configuración de los Poderes",
      description: "Elige qué poderes entran al juego y cuánto vale cada uno",
      open: "Configurar poderes",
      isEnabled: {
        label: "Poderes en el juego",
        description: "Apagado, nadie recibe ni usa poderes en esta partida",
        off: "Poderes apagados: no son parte de esta partida",
      },
      handSize: {
        label: "Poderes por jugador",
        description: "Cuántos poderes recibe cada jugador, sorteados entre los activados",
        limited: "Solo {count} activados: cada jugador recibe {count}",
      },
      allOff: "Ningún poder activado: el juego queda sin poderes",
      kinds: { boost: "Ventaja", attack: "Desventaja" },
      toggle: "Usar {power} en el juego",
      freezeQuestions: "Preguntas congeladas",
      stealPoints: "Puntos robados (como máximo)",
      bonusPoints: "Puntos de bono",
    },

    // Errors
    errors: {
      invalidCode: "Ingresa un ID de canal válido",
      enterName: "Ingresa tu nombre antes de unirte a la sala",
      waitConnection: "Espera a que se establezca la conexión",
      authRequired: "Inicia sesión para crear una sala.",
      onlyAdmin: "Solo el administrador puede iniciar el juego.",
      needGuests: "Es necesario tener al menos un invitado conectado.",
      allGuestsMustBeReady: "Todos los invitados deben confirmar que están listos.",
      deviceNotFound: "Dispositivo no encontrado. Intenta reconectar.",
      channelNotFound: "Canal no encontrado. Verifica el código e intenta nuevamente.",
      channelAlreadyExists: "Este canal ya existe. Intenta crear otro.",
      maxCategories: "Puedes elegir un máximo de {max} categorías.",
      enterChannel: "Únete a un canal antes de seleccionar categorías.",
      onlyGuestsVote: "Solo los invitados pueden votar.",
      votingClosed: "La votación ya fue cerrada.",
    },

    // Session
    sessionReset: "¡Sesión reiniciada! Nuevo ID de dispositivo creado.",
    resetSession: "Reiniciar sesión",
    deviceId: "ID del Dispositivo",
    editName: "Editar Nombre",
    editYourName: "Edita tu nombre",
    enterNewName: "Ingresa tu nuevo nombre",

    // Kick/Remove
    removeGuest: "Invitado eliminado de la sala.",
    forceLeave: {
      removedByAdmin: "Fuiste eliminado de la sala por el administrador.",
      adminLeft: "El administrador finalizó la sala.",
      adminDisconnected: "El administrador perdió la conexión y la sala fue cerrada.",
      adminInactiveTimeout: "La sala fue cerrada por inactividad del administrador.",
      default: "Fuiste eliminado de la sala.",
    },
  },

  // Quiz
  quiz: {
    title: "Millionaire Brain Quiz",
    subtitle: "¡Pon a prueba tus conocimientos y gana puntos!",
    start: "Comenzar Quiz",
    question: "Pregunta {current} de {total}",
    score: "Puntuación: {score}",
    timeRemaining: "Tiempo restante",
    correct: "¡Correcto!",
    incorrect: "¡Incorrecto!",
    submit: "Confirmar Respuesta",
    nextQuestion: "Siguiente Pregunta",
    finish: "Finalizar",
    errors: {
      fetchQuestions: "Error al obtener preguntas del servidor. Verifica tu conexión.",
      noQuestions: "No se encontraron preguntas para las categorías seleccionadas.",
    },

    startScreen: {
      subtitle: "Pon a prueba tus conocimientos y alcanza la cima!",
      howToPlay: "Cómo jugar",
      stats: {
        questions: {
          value: "10 Preguntas",
          description: "Por partida",
        },
        timer: {
          value: "1 Minuto",
          description: "Por pregunta",
        },
        points: {
          value: "Puntos",
          description: "Acumula puntos",
        },
        difficulty: {
          value: "Dificultad",
          description: "Progresiva",
        },
      },
      startButton: "Comenzar",
    },
    rulesScreen: {
      subtitle: "¡Prepárate para el desafío!",
      welcomeMessage: "¿Listo para demostrar tu conocimiento?",
      challengeMessage: "¡Responde correctamente y acumula puntos para alcanzar la cima!",
      selectedCategories: "Categorías Seleccionadas",
      howToPlay: "Reglas del Juego",
      stats: {
        questions: {
          value: "10 Preguntas",
          description: "Por partida",
        },
        timer: {
          value: "1 Minuto",
          description: "Por pregunta",
        },
        points: {
          value: "Puntos",
          description: "{count} aciertos seguidos multiplican tus puntos hasta ×{max}",
          descriptionOne: "Cada acierto seguido multiplica tus puntos, hasta ×{max}",
        },
        difficulty: {
          value: "Dificultad",
          description: "Progresiva",
        },
      },
      startButton: "Comenzar Quiz",
    },
    gameScreen: {
      scoreLabel: "Puntuación:",
      timerLabel: "Tiempo restante",
      difficulty: {
        level1: "Muy Fácil",
        level2: "Fácil",
        level3: "Medio",
        level4: "Difícil",
        level5: "Muy Difícil",
      },
      worthLabel: "Vale",
      guestsSelected: "{selected}/{total} eligieron",
      pointsSuffix: "pts",
      streak: {
        label: "Racha de aciertos",
        progress: "{count} de {total}",
        multiplier: "Multiplicador {multiplier} activo",
        frozen: "Congelado: fallar no reinicia la racha",
      },
      ranking: {
        title: "Ranking",
        points: "{points} puntos",
        you: "(tú)",
      },
      feedback: {
        correct: "🎉 ¡Correcto!",
        incorrect: "❌ ¡Incorrecto!",
        points: "+{points} puntos",
        correctAnswer: "Respuesta correcta: {answer}",
      },
      actions: {
        submit: "Confirmar Respuesta",
        nextQuestion: "Siguiente Pregunta",
        viewResults: "Ver Resultado",
        waitingForAdmin: "Esperando que el admin continúe...",
        askAudience: "Preguntar al público",
      },
      powerUps: {
        label: "Poderes",
        used: "ya usado",
        freeze: {
          name: "Congelar",
          hint: "Congela tu racha por {count} preguntas: fallar no la reinicia",
          hintOne: "Congela tu racha en esta pregunta: fallar no la reinicia",
        },
        steal: { name: "Robar", hint: "Roba hasta {points} puntos de un rival" },
        shield: { name: "Escudo", hint: "Te protege de las desventajas de esta pregunta" },
        break: { name: "Romper", hint: "Reinicia la racha y el multiplicador de un rival" },
        bonus: { name: "Bono", hint: "Gana {points} puntos de bono al instante" },
        pickTarget: "¿A quién le usas {power}?",
        noTargets: "Necesita otro jugador en la sala",
        outcomes: {
          theirShieldBlocked: "El escudo de {name} bloqueó tu {power}",
          youHit: "¡{power} alcanzó a {name}!",
          stealYouHit: "¡Le robaste {points} puntos a {name}!",
          stealNothing: "{name} no tenía puntos para robar",
          breakYouHit: "¡Rompiste la racha de {name}!",
        },
      },
    },
    timer: {
      label: "Tiempo restante",
    },

    // Results
    results: {
      title: "¡Juego terminado!",
      points: "Puntos",
      correct: "Respuestas correctas",
      ranking: "Ranking del canal",
      backToLobby: "Volver al Lobby",
      noRanking: "El ranking aparecerá cuando el administrador termine la partida.",
    },
  },

  // Language Selector
  language: {
    select: "Selecciona el idioma",
    current: "Idioma actual",
    change: "Cambiar idioma",
  },

  // Reset Password
  resetPassword: {
    title: "Restablecer Contraseña",
    subtitle: "Elige una nueva contraseña para tu cuenta",
    verifying: "Verificando enlace de restablecimiento...",
    newPassword: "Nueva contraseña",
    confirmPassword: "Confirmar nueva contraseña",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    submit: "Restablecer contraseña",
    submitting: "Restableciendo...",
    successTitle: "¡Contraseña restablecida!",
    successMessage: "Tu contraseña se cambió correctamente. Ya puedes volver al juego.",
    invalidTitle: "Enlace inválido o expirado",
    invalidMessage: "Solicita un nuevo correo de restablecimiento e inténtalo de nuevo.",
    passwordMinLength: "La contraseña debe tener al menos 6 caracteres.",
    passwordMismatch: "Las contraseñas no coinciden.",
    updateFailed: "No se pudo restablecer la contraseña. Inténtalo de nuevo.",
  },
} as const;
