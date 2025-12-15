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
    resetSession: "Reiniciar sesión",
    deviceId: "ID del Dispositivo",

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

    // Results
    results: {
      title: "¡Quiz Finalizado!",
      yourScore: "Tu puntuación",
      correctAnswers: "Respuestas correctas",
      playAgain: "Jugar de Nuevo",
      ranking: "Clasificación",
      position: "Posición",
      player: "Jugador",
      stats: "Estadísticas",
    },
  },

  // Language Selector
  language: {
    select: "Selecciona el idioma",
    current: "Idioma actual",
    change: "Cambiar idioma",
  },
} as const;
