/* eslint-disable max-lines */

import type { TranslationKeys } from "./pt-BR";

export const esBO: TranslationKeys = {
  // Common
  common: {
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
    codeCopied: "¡ID del canal copiado!",
    createRoom: "Crear Sala",
    createRoomDescription: "Genera un código automáticamente",
    joinRoom: "Unirse a una Sala",
    joinRoomDescription: "Ingresa el código de la sala",
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
    gameStarting: "¡Juego iniciado! ¡Buena suerte!",
    backToLobby: "Volver al Lobby",
    backToLobbyTooltip: "Volver a la sala y ajustar configuraciones",

    // Notifications
    roomCodeCreated: "Código de sala: {code}",
    sessionLeft: "Saliste del canal. Sesión reiniciada.",
    categorySelectionsCleared: "Selecciones de categorías limpiadas.",
    readyToPlay: "¡Estás listo para jugar!",
    notReadyMessage: "Saliste del estado de listo.",
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

      timeThresholds: {
        label: "Avisos de Tiempo",
        description: "Cuándo cambiar el color del cronómetro",
        lowTime: "Tiempo Bajo (amarillo)",
        criticalTime: "Tiempo Crítico (rojo)",
      },

      restoreDefaults: "Restaurar Predeterminados",
      adminOnly: "Solo el administrador puede cambiar estas configuraciones",
    },

    // Errors
    errors: {
      invalidCode: "Ingresa un ID de canal válido",
      enterName: "Ingresa tu nombre antes de unirte a la sala",
      waitConnection: "Espera a que se establezca la conexión",
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
    returningSession: "Reanudando sesión anterior en el canal: {channel}",
    joinedViaQrCode: "Se unió vía código QR a la sala: {code}",
    resetSession: "Reiniciar sesión",
    deviceId: "ID del Dispositivo",
    editName: "Editar Nombre",
    editYourName: "Edita tu nombre",
    enterNewName: "Ingresa tu nuevo nombre",
    nameUpdated: "¡Nombre actualizado con éxito!",

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
          description: "Acumula puntos",
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
      pointsSuffix: "pts",
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
} as const;
