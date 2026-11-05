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
    roomMenu: {
      open: "Opciones de la sala",
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
      gossip: "Chisme",
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
      cutPercent: "Puntos que aún gana el objetivo",
    },

    // Errors
    errors: {
      invalidCode: "Ingresa un ID de canal válido",
      enterName: "Ingresa tu nombre antes de unirte a la sala",
      waitConnection: "Espera a que se establezca la conexión",
      authRequired: "Inicia sesión para crear una sala.",
      adminRequired: "Tu cuenta no tiene permiso de administrador.",
      roomFull: "La sala está llena.",
      tooManyRooms:
        "El servidor tiene demasiadas salas abiertas. Inténtalo de nuevo en un momento.",
      rateLimited: "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
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
      closedWhileOffline: "La sala se cerró mientras estabas sin conexión.",
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
    // The game's rules, one card each, with the room's settings
    rulesScreen: {
      howToPlay: "Reglas del Juego",
      previous: "Regla anterior",
      next: "Siguiente regla",
      rules: {
        questions: {
          title: "Preguntas",
          description: "Gana quien sume más puntos al final",
        },
        timer: {
          title: "Tiempo",
          description: "Para responder cada pregunta",
          unlimited: "Sin límite de tiempo para responder",
        },
        streak: {
          title: "Racha",
          description: "{count} aciertos seguidos multiplican tus puntos hasta ×{max}",
          descriptionOne: "Cada acierto seguido multiplica tus puntos, hasta ×{max}",
        },
        difficulty: {
          title: "Dificultad",
          description: "Las preguntas se vuelven más difíciles y valen más puntos",
        },
        categories: {
          title: "Categorías",
          all: "Todas las categorías",
        },
        // Titled with the power-ups' name in the game (gameScreen.powerUps.label)
        powerUps: {
          description: "Cada jugador recibe {count} para usar una vez cada uno",
          descriptionOne: "Cada jugador recibe 1 para usar una vez",
          off: "Desactivados en esta partida",
        },
      },
      startButton: "Comenzar Quiz",
      backToLobby: "Volver al Lobby",
      waitingForAdmin: "Esperando que el administrador comience",
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
        cut: {
          name: "Cortar",
          hint: "Un rival solo gana el {percent}% de los puntos de esta pregunta",
        },
        pickTarget: "¿A quién le usas {power}?",
        noTargets: "Necesita otro jugador en la sala",
        lastQuestion: "Los poderes no valen en la última pregunta",
        outcomes: {
          theirShieldBlocked: "El escudo de {name} bloqueó tu {power}",
          youHit: "¡{power} alcanzó a {name}!",
          stealYouHit: "¡Le robaste {points} puntos a {name}!",
          stealNothing: "{name} no tenía puntos para robar",
          breakYouHit: "¡Rompiste la racha de {name}!",
          cutYouHit: "¡Cortaste los puntos de {name} en esta pregunta!",
        },
      },
    },
    timer: {
      label: "Tiempo restante",
    },
    adminAway: {
      title: "El administrador se desconectó",
      description:
        "El juego está en pausa hasta que el administrador vuelva. Si la cuenta regresiva llega a cero, la sala se cerrará.",
      timeLeft: "La sala se cerrará en {time}",
      leave: "Salir de la sala",
    },
    quitGame: {
      title: "¿De verdad quieres volver?",
      description: "Si vuelves, abandonas el juego y sales de la sala.",
      quit: "Sí, quiero abandonar",
      stay: "Seguir jugando",
    },

    // Results
    results: {
      title: "¡Juego terminado!",
      points: "Puntos",
      correctOf: "{correct} de {total} aciertos",
      ranking: "Ranking del canal",
      podium: "Podio",
      place: "Puesto {position}",
      backToLobby: "Volver al Lobby",
      noRanking: "El ranking aparecerá cuando el administrador termine la partida.",
    },
  },

  tutorial: {
    open: "Cómo jugar",
    title: "Cómo jugar",
    intro:
      "Responde con tu grupo, acierta seguido para multiplicar los puntos y usa poderes para dar vuelta el juego.",
    back: "Volver",
    close: "Cerrar el tutorial",
    tabsLabel: "Partes del tutorial",
    // The sample players of the ranking and of the list a disadvantage is used on
    player: "Jugador {number}",
    tabs: {
      game: "La partida",
      points: "Puntos",
      powerUps: "Poderes",
    },
    game: {
      room: {
        title: "Del lobby a la primera pregunta",
        steps: {
          create: "El administrador crea la sala y muestra el código o el código QR.",
          join: "Cada jugador entra desde su celular con el código y elige un nombre.",
          vote: "Cada jugador vota por las categorías que quiere en las preguntas.",
          ready: 'Con las categorías elegidas, cada uno marca "Estoy listo".',
          start: "Cuando todos están listos, el administrador comienza el juego.",
        },
      },
      question: {
        title: "Preguntas y respuestas",
        description:
          "Cada pregunta tiene cuatro opciones. Toca la tuya: puedes cambiarla hasta que se acabe el tiempo o el administrador revele la correcta. La pantalla del administrador lee la pregunta en voz alta.",
        label: "Pregunta 1",
        text: "¿Qué planeta es conocido como el planeta rojo?",
        options: {
          a: "Venus",
          b: "Marte",
          c: "Júpiter",
          d: "Saturno",
        },
        pick: "Elige una opción para revelar la respuesta.",
        reveal: "Revelar respuesta",
        again: "Intentar de nuevo",
        correct: "¡Acertaste! La correcta brilla en verde y muestra los puntos ganados.",
        wrong: "Fallaste: la tuya se pone roja y la correcta aparece en verde.",
      },
      timer: {
        title: "El tiempo",
        description:
          "Cada pregunta tiene un tiempo para ser respondida. La barra se vacía, se pone dorada cuando el tiempo se acaba y roja en los últimos segundos. Cuando se acaba el tiempo, la pregunta se cierra: quien no respondió se queda sin puntos. El administrador también puede dejar las preguntas sin límite de tiempo.",
        replay: "Ver de nuevo",
      },
      difficulty: {
        title: "Dificultad",
        description:
          "Las preguntas empiezan fáciles y se vuelven más difíciles a lo largo del juego. Cuanto más difícil, más puntos vale.",
      },
      categories: {
        title: "Categorías",
        description:
          "Las preguntas salen de las categorías más votadas en el lobby. Cada pregunta sortea una de ellas, y ninguna se repite antes de que salgan todas. Sin votos, valen todas.",
      },
    },
    points: {
      worth: {
        title: "Cuánto vale cada pregunta",
        description:
          'Acertar da los puntos de la pregunta, que aparecen en "Vale" arriba de la pantalla, junto a tu puntuación. Fallar o no responder da cero, y responder más rápido no vale más.',
      },
      streak: {
        title: "Barra de racha",
        description:
          "Cada acierto seguido llena la barra. Cuando se llena, se energiza y tus puntos pasan a multiplicarse; cada nuevo acierto sube el multiplicador, hasta ×{max}. Un fallo vacía la barra.",
        hit: "Acertar",
        miss: "Fallar",
        worth: "La próxima pregunta de {points} puntos vale {total}",
      },
      ranking: {
        title: "Ranking",
        description:
          "Durante el juego, el ranking en vivo muestra la posición de cada uno, contando también los puntos robados y los bonos. Después de la última pregunta, los tres primeros suben al podio.",
        climb: "Sumar {points} puntos",
        reset: "Empezar de nuevo",
      },
    },
    powerUps: {
      try: "Probar",
      tryLabel: "Probar {power}",
      rules: {
        title: "Reglas",
        hand: "Al empezar el juego, cada jugador recibe algunos poderes, sorteados.",
        once: "Cada poder vale una vez por juego: después de usarlo, queda gris.",
        onePerQuestion: "Un poder por pregunta: los demás esperan a la siguiente.",
        open: "Solo mientras la pregunta está abierta, antes de que aparezca la respuesta o se acabe el tiempo.",
        lastQuestion: "No valen en la última pregunta.",
        players: "Solo quien responde recibe poderes, así que el administrador se queda afuera.",
      },
      advantages: {
        title: "Ventajas",
        description: "Actúan sobre ti, apenas las tocas.",
      },
      disadvantages: {
        title: "Desventajas",
        description: "Actúan sobre un rival que eliges en la lista de jugadores.",
      },
      // What each one does, in a few words (their hints in the game, without the numbers)
      summaries: {
        freeze: "Congela tu racha por algunas preguntas: fallar no la reinicia",
        steal: "Roba puntos de un rival",
        shield: "Te protege de las desventajas de esta pregunta",
        break: "Reinicia la racha y el multiplicador de un rival",
        bonus: "Gana puntos de bono al instante",
        cut: "Un rival solo gana una parte de los puntos de esta pregunta",
      },
      details: {
        shield:
          "Vale incluso para las desventajas usadas antes del escudo, en la misma pregunta. En la pregunta siguiente ya no protege.",
        freeze:
          "Cuenta la pregunta en la que lo usas. Acertar llena la barra como siempre, y el poder no da puntos.",
        bonus:
          "Los puntos entran en tu puntuación al instante, aunque falles la respuesta. El multiplicador no cuenta.",
        steal:
          "Los puntos salen de la puntuación del rival y van a la tuya. Quien tiene menos pierde solo lo que tiene: nadie queda por debajo de cero.",
        break:
          "Vale desde la pregunta en que se usa: su respuesta ahí ya vale ×1. Los puntos que ya tiene se quedan, y Congelar no lo impide.",
        cut: "Vale para su respuesta a esta pregunta, sea cual sea la dificultad o el multiplicador: si acierta, solo se lleva una parte de los puntos. Su racha sigue contando, y dos cortes en la misma pregunta no se suman.",
      },
      blocked: "Bloqueado",
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
