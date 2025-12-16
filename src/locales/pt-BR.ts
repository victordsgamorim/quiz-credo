/* eslint-disable max-lines */

export const ptBR = {
  // Common
  common: {
    loading: "Carregando...",
    error: "Erro",
    success: "Sucesso",
    cancel: "Cancelar",
    confirm: "Confirmar",
    close: "Fechar",
    back: "Voltar",
    next: "Próximo",
    save: "Salvar",
    delete: "Excluir",
    reset: "Resetar",
    edit: "Editar",
  },

  // Lobby
  lobby: {
    title: "Lobby do Jogo",
    subtitle: "Conecte-se a um canal para começar",

    // Connection
    connected: "Conectado",
    disconnected: "Desconectado",
    active: "Ativo",
    background: "Em segundo plano",
    reconnecting: "Reconectando...",
    connectingToServer: "Conectando ao servidor...",

    // Room
    roomCreated: "Sala Criada",
    roomCode: "Código da Sala",
    shareCode: "Compartilhe o código abaixo",
    shareCodeDescription: "Compartilhe este código com outros jogadores",
    copyCode: "Copiar código",
    codeCopied: "ID do canal copiado!",
    createRoom: "Criar Sala",
    createRoomDescription: "Gera um código automaticamente",
    joinRoom: "Entrar em uma Sala",
    joinRoomDescription: "Digite o código da sala",
    enterRoomCode: "Digite o código da sala",
    yourName: "Seu nome",
    yourNamePlaceholder: "Como você quer aparecer na sala?",
    typeCode: "Digite o código...",
    leaveRoom: "Sair",

    // Devices
    devices: "dispositivos conectados",
    device: "dispositivo conectado",
    admin: "Administrador",
    guest: "Convidado",
    you: "Você",
    adminInfo: "Você é o administrador desta sala e pode remover convidados.",
    guestInfo: "Você está como convidado nesta sala.",

    // Categories
    categories: "Categorias",
    categoryVoting: "Votação de Categorias",
    selectCategories: "Selecione {count} categorias",
    categoriesSelected: "{count} de {total} selecionadas",
    clearSelection: "Limpar seleção",
    viewResults: "Ver resultados",
    votingClosed: "Votação encerrada",
    votingClosedDescription: "Todos já podem ver as categorias escolhidas.",
    mostVoted: "Mais votadas",
    votes: "votos",
    vote: "voto",

    // Readiness
    ready: "Pronto",
    notReady: "Aguardando",
    markAsReady: "Estou pronto",
    readyStatus: "Status de prontidão",
    allGuestsReady: "Todos os convidados estão prontos.",
    guestsReady: "{ready} de {total} convidados confirmaram.",
    waitingForGuests:
      'Marque "Estou pronto" quando estiver preparado. O administrador iniciará o jogo quando todos confirmarem.',
    cannotStartYet: "O jogo só pode começar quando todos os convidados estiverem prontos.",
    selectAllCategories: "Selecione todas as categorias antes de marcar como pronto.",

    // Game start
    startGame: "Iniciar jogo",
    gameStarting: "Jogo iniciado! Boa sorte!",

    // Notifications
    roomCodeCreated: "Código da sala: {code}",
    sessionLeft: "Você saiu do canal. Sessão reiniciada.",
    categorySelectionsCleared: "Seleções de categorias limpas.",
    readyToPlay: "Você está pronto para jogar!",
    notReadyMessage: "Você saiu do estado de pronto.",
    resetSessionTooltip: "Resetar sessão e criar novo ID",
    sessionRestored: "Bem-vindo de volta! Seu device ID foi recuperado.",
    backgroundConnectionMessage: "Você está em segundo plano, mas a conexão permanece ativa",
    tryingToReconnect: "Tentando reconectar...",
    connectedDevices: "Dispositivos Conectados",

    categoryDrawer: {
      title: "Categorias do Quiz",
      description: {
        admin:
          "Você acompanha os votos em tempo real. Apenas os convidados escolhem as categorias.",
        votingClosed: "A votação foi encerrada. Aguarde o início do jogo.",
        open: "Selecione até cinco categorias. Arraste a barra para expandir ou fechar.",
      },
      statusLabel: "Status",
      status: {
        votingClosed: "Votação encerrada",
        adminControl: "Você controla quando a votação termina",
        waiting: "Aguardando o administrador encerrar a votação",
      },
      badges: {
        selected: "Selecionado",
        voteHint: "Clique para votar",
      },
      selectionNote: "Você pode alterar suas escolhas a qualquer momento enquanto estiver na sala.",
      clearSelections: "Limpar seleções",
      adminMessage:
        "Apenas convidados exibem opções de voto. Este painel mostra o progresso em tempo real para ajudar na decisão de encerrar a votação.",
      rankingTitle: "Categorias mais votadas",
      rankingSubtitle: "As 10 mais votadas serão usadas nas próximas perguntas",
      resultsLocked:
        "O administrador precisa encerrar a votação para revelar o ranking das categorias.",
      noVotes: "Ainda não há votos registrados. Faça sua seleção para participar do ranking!",
      info: "Cada jogador pode votar em até {limit} categorias. As 10 mais populares definem os temas do jogo.",
      closePanel: "Fechar painel",
    },
    categoryPanel: {
      open: "Abrir painel de categorias",
      close: "Fechar painel de categorias",
    },
    categoryResults: {
      title: "Resultados das Categorias",
      description: "Estas são as 10 categorias mais votadas após o encerramento da votação.",
      empty: "Ainda não tivemos votos suficientes para gerar uma lista.",
    },
    votingControl: {
      title: "Controle de votação",
      descriptionOpen: "Acompanhe os votos em tempo real e encerre quando estiver pronto.",
      buttonClose: "Encerrar votação",
    },
    readyToggle: {
      markReady: "Estou pronto",
      cancelReady: "Cancelar pronto",
      tooltip: {
        changeStatus: "Altere seu status de pronto",
        gameStarted: "O jogo já foi iniciado",
        onlySelf: "Apenas o próprio jogador pode alterar este status",
      },
    },
    categoryNames: {
      geography: "Geografia",
      mathematics: "Matemática",
      history: "História",
      science: "Ciências",
      art: "Arte",
      sports: "Esportes",
      technology: "Tecnologia",
      literature: "Literatura",
      music: "Música",
      cinema: "Cinema",
      "current-events": "Atualidades",
      mythology: "Mitologia",
      astronomy: "Astronomia",
      biology: "Biologia",
      chemistry: "Química",
      politics: "Política",
      economics: "Economia",
      "pop-culture": "Cultura Pop",
      languages: "Idiomas",
      inventions: "Invenções",
    },

    // Errors
    errors: {
      invalidCode: "Digite um ID de canal válido",
      enterName: "Digite seu nome antes de entrar na sala",
      waitConnection: "Aguarde a conexão ser estabelecida",
      onlyAdmin: "Apenas o administrador pode iniciar o jogo.",
      needGuests: "É necessário ter pelo menos um convidado conectado.",
      allGuestsMustBeReady: "Todos os convidados precisam confirmar que estão prontos.",
      deviceNotFound: "Dispositivo não encontrado. Tente reconectar.",
      channelNotFound: "Canal não encontrado. Verifique o código e tente novamente.",
      channelAlreadyExists: "Este canal já existe. Tente criar outro.",
      maxCategories: "Você pode escolher no máximo {max} categorias.",
      enterChannel: "Entre em um canal antes de selecionar categorias.",
      onlyGuestsVote: "Apenas os convidados podem votar.",
      votingClosed: "A votação já foi encerrada.",
    },

    // Session
    sessionReset: "Sessão reiniciada! Novo ID de device criado.",
    returningSession: "Retomando sessão anterior no canal: {channel}",
    resetSession: "Reiniciar sessão",
    deviceId: "ID do Dispositivo",

    // Kick/Remove
    removeGuest: "Convidado removido da sala.",
    forceLeave: {
      removedByAdmin: "Você foi removido da sala pelo administrador.",
      adminLeft: "O administrador encerrou a sala.",
      adminDisconnected: "O administrador perdeu a conexão e a sala foi encerrada.",
      adminInactiveTimeout: "A sala foi encerrada por inatividade do administrador.",
      default: "Você foi removido da sala.",
    },
  },

  // Quiz
  quiz: {
    title: "Millionaire Brain Quiz",
    subtitle: "Teste seus conhecimentos e ganhe pontos!",
    start: "Começar Quiz",
    question: "Pergunta {current} de {total}",
    score: "Pontuação: {score}",
    timeRemaining: "Tempo restante",
    correct: "Correto!",
    incorrect: "Incorreto!",
    submit: "Confirmar Resposta",
    nextQuestion: "Próxima Pergunta",
    finish: "Finalizar",

    startScreen: {
      subtitle: "Teste seus conhecimentos e alcance o topo!",
      howToPlay: "Como Jogar",
      stats: {
        questions: {
          value: "10 Perguntas",
          description: "Por partida",
        },
        timer: {
          value: "1 Minuto",
          description: "Por pergunta",
        },
        points: {
          value: "Pontos",
          description: "Acumule pontos",
        },
        difficulty: {
          value: "Dificuldade",
          description: "Progressiva",
        },
      },
      startButton: "Começar",
    },
    gameScreen: {
      scoreLabel: "Pontos:",
      timerLabel: "Tempo restante",
      difficulty: {
        easy: "Fácil",
        medium: "Médio",
        hard: "Difícil",
      },
      worthLabel: "Vale",
      pointsSuffix: "pts",
      feedback: {
        correct: "🎉 Correto!",
        incorrect: "❌ Incorreto!",
        points: "+{points} pontos",
        correctAnswer: "Resposta correta: {answer}",
      },
      actions: {
        submit: "Confirmar Resposta",
        nextQuestion: "Próxima Pergunta",
        viewResults: "Ver Resultado",
      },
    },
    timer: {
      label: "Tempo restante",
    },

    // Results
    results: {
      finishTitle: "Fim de Jogo!",
      performance: {
        excellent: "Excelente! Você é um gênio! 🧠",
        good: "Muito bom! Continue assim! 💪",
        solid: "Bom trabalho! Pode melhorar! 📚",
        keepTrying: "Continue praticando! Você consegue! 🎯",
      },
      statLabels: {
        gamesPlayed: "Partidas jogadas",
        bestScore: "Melhor pontuação",
        averageScore: "Média de pontos",
        accuracy: "Taxa de acerto",
      },
      title: "Quiz Finalizado!",
      yourScore: "Sua pontuação",
      correctAnswers: "Respostas corretas",
      playAgain: "Jogar Novamente",
      ranking: "Ranking",
      position: "Posição",
      player: "Jogador",
      stats: "Estatísticas",
    },
  },

  // Language Selector
  language: {
    select: "Selecione o idioma",
    current: "Idioma atual",
    change: "Trocar idioma",
  },
} as const;

export type TranslationKeys = typeof ptBR;
