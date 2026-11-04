/* eslint-disable max-lines */

export const ptBR = {
  // Common
  common: {
    pageNotFound: "Esta página não existe. Confira o link ou volte ao início.",
    backHome: "Voltar ao início",
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
    qrCode: "QR code",
    createRoom: "Criar Sala",
    joinRoom: "Entrar em uma Sala",
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
    closeChannel: "Fechar canal",
    backToLobby: "Voltar ao Lobby",
    backToLobbyTooltip: "Voltar para a sala e ajustar configurações",

    // Notifications
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
      selectedEmpty: "Nenhuma categoria selecionada ainda.",
      rankingTitle: "Categorias mais votadas",
      rankingSubtitle: "As 10 mais votadas serão usadas nas próximas perguntas",
      resultsLocked:
        "O administrador precisa encerrar a votação para revelar o ranking das categorias.",
      noVotes: "Ainda não há votos registrados. Faça sua seleção para participar do ranking!",
      info: "Cada jogador pode votar em até {limit} categorias. As 10 mais populares definem os temas do jogo.",
      closePanel: "Fechar painel",
    },
    roomMenu: {
      open: "Opções da sala",
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
    // Home screen deck of sample questions
    deck: {
      label: "Perguntas de exemplo",
      previous: "Pergunta anterior",
      next: "Próxima pergunta",
      questions: {
        geography: "Qual é o maior oceano do planeta?",
        history: "Qual civilização construiu as pirâmides de Gizé?",
        art: "Quem pintou a Mona Lisa?",
        astronomy: "Qual planeta é conhecido como o planeta vermelho?",
        music: "Quantas cordas tem um violão comum?",
        sports: "Quantos jogadores de cada time ficam em campo no futebol?",
        cinema: "Como se chama o leãozinho de O Rei Leão?",
        mathematics: "Quanto é 7 vezes 8?",
        biology: "Qual órgão bombeia o sangue pelo corpo?",
        mythology: "Quem é o deus do trovão na mitologia nórdica?",
        literature: "Quem escreveu Dom Quixote?",
        chemistry: "Qual é o símbolo químico do ouro?",
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

    gameSettings: {
      title: "Configurações do Jogo",
      description: "Configure os parâmetros da partida",

      questionCount: {
        label: "Número de Perguntas",
        description: "Quantidade de perguntas no quiz",
      },

      timerDuration: {
        label: "Tempo por Pergunta",
        description: "Duração do timer para cada pergunta",
        unlimited: "Sem Limite",
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
        label: "Máximo de Categorias por Jogador",
        description: "Quantas categorias cada jogador pode votar",
      },

      topCategoriesCount: {
        label: "Categorias Top do Jogo",
        description: "Quantas categorias mais votadas definem as perguntas",
      },

      streakThreshold: {
        label: "Acertos para o Multiplicador",
        description: "Acertos seguidos que ativam o multiplicador de pontos (até ×{max})",
      },

      timeThresholds: {
        label: "Avisos de Tempo",
        description: "Quando mudar a cor do timer",
        lowTime: "Tempo Baixo (amarelo)",
        criticalTime: "Tempo Crítico (vermelho)",
      },

      enableQuestionCache: {
        label: "Salvar Histórico de Perguntas",
        description:
          "Ativa o salvamento das perguntas respondidas no banco de dados para evitar repetições",
      },

      enableDebugMode: {
        label: "Modo Debug",
        description:
          "Permite que o administrador inicie o jogo e responda às perguntas sozinho, sem convidados",
      },

      restoreDefaults: "Restaurar Padrões",
      adminOnly: "Apenas o administrador pode alterar estas configurações",
    },

    powerUpSettings: {
      title: "Configurações dos Power-ups",
      description: "Escolha quais power-ups entram no jogo e quanto vale cada um",
      open: "Configurar power-ups",
      isEnabled: {
        label: "Power-ups no jogo",
        description: "Desligado, ninguém recebe nem usa power-ups nesta partida",
        off: "Power-ups desligados: eles não fazem parte desta partida",
      },
      handSize: {
        label: "Power-ups por jogador",
        description: "Quantos power-ups cada jogador recebe, sorteados entre os ligados",
        limited: "Só {count} ligados: cada jogador recebe {count}",
      },
      allOff: "Nenhum power-up ligado: o jogo fica sem power-ups",
      kinds: { boost: "Vantagem", attack: "Desvantagem" },
      toggle: "Usar {power} no jogo",
      freezeQuestions: "Perguntas congeladas",
      stealPoints: "Pontos roubados (no máximo)",
      bonusPoints: "Pontos de bônus",
      cutPercent: "Pontos que o alvo ainda ganha",
    },

    // Errors
    errors: {
      invalidCode: "Digite um ID de canal válido",
      enterName: "Digite seu nome antes de entrar na sala",
      waitConnection: "Aguarde a conexão ser estabelecida",
      authRequired: "Faça login para criar uma sala.",
      adminRequired: "Sua conta não tem permissão de administrador.",
      roomFull: "A sala está cheia.",
      tooManyRooms: "O servidor está com muitas salas abertas. Tente novamente em instantes.",
      rateLimited: "Muitas tentativas. Aguarde um pouco e tente novamente.",
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
    resetSession: "Reiniciar sessão",
    deviceId: "ID do Dispositivo",
    editName: "Editar Nome",
    editYourName: "Editar seu nome",
    enterNewName: "Digite seu novo nome",

    // Kick/Remove
    removeGuest: "Convidado removido da sala.",
    forceLeave: {
      removedByAdmin: "Você foi removido da sala pelo administrador.",
      adminLeft: "O administrador encerrou a sala.",
      adminDisconnected: "O administrador perdeu a conexão e a sala foi encerrada.",
      adminInactiveTimeout: "A sala foi encerrada por inatividade do administrador.",
      closedWhileOffline: "A sala foi encerrada enquanto você estava sem conexão.",
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
    errors: {
      fetchQuestions: "Erro ao buscar perguntas do servidor. Verifique sua conexão.",
      noQuestions: "Nenhuma pergunta encontrada para as categorias selecionadas.",
    },

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
    // The game's rules, one card each, with the room's settings
    rulesScreen: {
      howToPlay: "Regras do Jogo",
      previous: "Regra anterior",
      next: "Próxima regra",
      rules: {
        questions: {
          title: "Perguntas",
          description: "Quem somar mais pontos no final vence",
        },
        timer: {
          title: "Tempo",
          description: "Para responder cada pergunta",
          unlimited: "Sem limite de tempo para responder",
        },
        streak: {
          title: "Sequência",
          description: "{count} acertos seguidos multiplicam seus pontos até ×{max}",
          descriptionOne: "Cada acerto seguido multiplica seus pontos, até ×{max}",
        },
        difficulty: {
          title: "Dificuldade",
          description: "As perguntas ficam mais difíceis e valem mais pontos",
        },
        categories: {
          title: "Categorias",
          all: "Todas as categorias",
        },
        // Titled with the power-ups' name in the game (gameScreen.powerUps.label)
        powerUps: {
          description: "Cada jogador ganha {count} para usar uma vez cada",
          descriptionOne: "Cada jogador ganha 1 para usar uma vez",
          off: "Desligados nesta partida",
        },
      },
      startButton: "Começar o Quiz",
      backToLobby: "Retornar ao Lobby",
      waitingForAdmin: "Aguardando o administrador começar",
    },
    gameScreen: {
      scoreLabel: "Pontos:",
      timerLabel: "Tempo restante",
      difficulty: {
        level1: "Muito Fácil",
        level2: "Fácil",
        level3: "Médio",
        level4: "Difícil",
        level5: "Muito Difícil",
      },
      worthLabel: "Vale",
      guestsSelected: "{selected}/{total} escolheram",
      pointsSuffix: "pts",
      streak: {
        label: "Sequência de acertos",
        progress: "{count} de {total}",
        multiplier: "Multiplicador {multiplier} ativo",
        frozen: "Congelado: errar não zera a sequência",
      },
      ranking: {
        title: "Ranking",
        you: "(você)",
      },
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
        waitingForAdmin: "Aguardando admin continuar...",
        askAudience: "Perguntar à plateia",
      },
      powerUps: {
        label: "Poderes",
        used: "já usado",
        freeze: {
          name: "Congelar",
          hint: "Congela sua sequência por {count} perguntas: errar não zera",
          hintOne: "Congela sua sequência nesta pergunta: errar não zera",
        },
        steal: { name: "Roubar", hint: "Rouba até {points} pontos de um adversário" },
        shield: { name: "Escudo", hint: "Protege você das desvantagens desta pergunta" },
        break: { name: "Quebrar", hint: "Zera a sequência e o multiplicador de um adversário" },
        bonus: { name: "Bônus", hint: "Ganha {points} pontos de bônus na hora" },
        cut: {
          name: "Cortar",
          hint: "Um adversário ganha só {percent}% dos pontos desta pergunta",
        },
        pickTarget: "Em quem usar {power}?",
        noTargets: "Precisa de outro jogador na sala",
        lastQuestion: "Os poderes não valem na última pergunta",
        outcomes: {
          theirShieldBlocked: "O escudo de {name} bloqueou seu {power}",
          youHit: "{power} acertou {name}!",
          stealYouHit: "Você roubou {points} pontos de {name}!",
          stealNothing: "{name} não tinha pontos para roubar",
          breakYouHit: "Você quebrou a sequência de {name}!",
          cutYouHit: "Você cortou os pontos de {name} nesta pergunta!",
        },
      },
    },
    timer: {
      label: "Tempo restante",
    },
    // The admin away: the game paused until they're back, or until the room closes
    adminAway: {
      title: "O administrador se desconectou",
      description:
        "O jogo está pausado até o administrador voltar. Se a contagem chegar ao fim, a sala será encerrada.",
      timeLeft: "A sala será encerrada em {time}",
      leave: "Sair da sala",
    },
    quitGame: {
      title: "Quer mesmo voltar?",
      description: "Se voltar, você desiste do jogo e sai da sala.",
      quit: "Sim, quero desistir",
      stay: "Continuar no jogo",
    },

    // Results
    results: {
      title: "Fim de Jogo!",
      points: "Pontos",
      // Read aloud for the "7/10" beside each player: their right answers, out of the game's
      correctOf: "{correct} de {total} acertos",
      ranking: "Ranking do Canal",
      podium: "Pódio",
      place: "{position}º lugar",
      backToLobby: "Voltar ao Lobby",
      noRanking: "O ranking será exibido quando o administrador finalizar o jogo.",
    },
  },

  // The tutorial: the game's rules, with the game's own pieces to try out (the /tutorial page, and
  // the lobby's dialog)
  tutorial: {
    open: "Como jogar",
    title: "Como jogar",
    intro:
      "Responda com a sua turma, acerte em sequência para multiplicar os pontos e use poderes para virar o jogo.",
    back: "Voltar",
    close: "Fechar o tutorial",
    tabsLabel: "Partes do tutorial",
    // The sample players of the ranking and of the list a disadvantage is used on
    player: "Jogador {number}",
    tabs: {
      game: "A partida",
      points: "Pontos",
      powerUps: "Poderes",
    },
    game: {
      room: {
        title: "Do lobby à primeira pergunta",
        steps: {
          create: "O administrador cria a sala e mostra o código ou o QR code.",
          join: "Cada jogador entra pelo celular com o código e escolhe um nome.",
          vote: "Cada jogador vota nas categorias que quer ver nas perguntas.",
          ready: 'Com as categorias escolhidas, cada um marca "Estou pronto".',
          start: "Com todos prontos, o administrador começa o jogo.",
        },
      },
      question: {
        title: "Perguntas e respostas",
        description:
          "Cada pergunta tem quatro alternativas. Toque na sua: dá para trocar até o tempo acabar ou o administrador revelar a certa. A tela do administrador lê a pergunta em voz alta.",
        label: "Pergunta 1",
        text: "Qual planeta é conhecido como o planeta vermelho?",
        options: {
          a: "Vênus",
          b: "Marte",
          c: "Júpiter",
          d: "Saturno",
        },
        pick: "Escolha uma alternativa para revelar a resposta.",
        reveal: "Revelar resposta",
        again: "Tentar de novo",
        correct: "Acertou! A certa brilha em verde e mostra os pontos ganhos.",
        wrong: "Errou: a sua fica vermelha e a certa aparece em verde.",
      },
      timer: {
        title: "O tempo",
        description:
          "Cada pergunta tem um tempo para ser respondida. A barra esvazia, fica dourada quando o tempo está acabando e vermelha nos últimos segundos. Quando o tempo acaba, a pergunta fecha: quem não respondeu fica sem pontos. O administrador também pode deixar as perguntas sem limite de tempo.",
        replay: "Ver de novo",
      },
      difficulty: {
        title: "Dificuldade",
        description:
          "As perguntas começam fáceis e ficam mais difíceis ao longo do jogo. Quanto mais difícil, mais pontos vale.",
      },
      categories: {
        title: "Categorias",
        description:
          "As perguntas saem das categorias mais votadas no lobby. Cada pergunta sorteia uma delas, e nenhuma se repete antes de todas aparecerem. Sem votos, valem todas.",
      },
    },
    points: {
      worth: {
        title: "Quanto vale cada pergunta",
        description:
          'Acertar dá os pontos da pergunta, que aparecem em "Vale" no topo da tela, ao lado do seu placar. Errar ou não responder dá zero, e responder mais rápido não vale mais.',
      },
      streak: {
        title: "Barra de sequência",
        description:
          "Cada acerto seguido enche a barra. Quando ela fica cheia, se energiza e seus pontos passam a ser multiplicados; cada novo acerto aumenta o multiplicador, até ×{max}. Um erro esvazia a barra.",
        hit: "Acertar",
        miss: "Errar",
        worth: "A próxima pergunta de {points} pontos vale {total}",
      },
      ranking: {
        title: "Ranking",
        description:
          "Durante o jogo, o ranking ao vivo mostra a posição de cada um, já contando os pontos roubados e os bônus. Depois da última pergunta, os três primeiros sobem ao pódio.",
        climb: "Somar {points} pontos",
        reset: "Recomeçar",
      },
    },
    powerUps: {
      try: "Experimentar",
      tryLabel: "Experimentar {power}",
      rules: {
        title: "Regras",
        hand: "No começo do jogo, cada jogador recebe alguns poderes, sorteados.",
        once: "Cada poder vale uma vez por jogo: depois de usado, fica cinza.",
        onePerQuestion: "Um poder por pergunta: os outros esperam a próxima.",
        open: "Só enquanto a pergunta está aberta, antes de a resposta aparecer ou o tempo acabar.",
        lastQuestion: "Não valem na última pergunta.",
        players: "Só quem responde recebe poderes, então o administrador fica de fora.",
      },
      advantages: {
        title: "Vantagens",
        description: "Agem em você, assim que você toca nelas.",
      },
      disadvantages: {
        title: "Desvantagens",
        description: "Agem num adversário que você escolhe na lista de jogadores.",
      },
      // What each one does, in a few words (their hints in the game, without the numbers)
      summaries: {
        freeze: "Congela sua sequência por algumas perguntas: errar não zera",
        steal: "Rouba pontos de um adversário",
        shield: "Protege você das desvantagens desta pergunta",
        break: "Zera a sequência e o multiplicador de um adversário",
        bonus: "Ganha pontos de bônus na hora",
        cut: "Um adversário ganha só parte dos pontos desta pergunta",
      },
      details: {
        shield:
          "Vale até para as desvantagens usadas antes do escudo, na mesma pergunta. Na pergunta seguinte, já não protege.",
        freeze:
          "Conta a pergunta em que você o usa. Acertar enche a barra como sempre, e o poder não dá pontos.",
        bonus:
          "Os pontos entram no placar na hora, mesmo que você erre a resposta. O multiplicador não conta.",
        steal:
          "Os pontos saem do placar do adversário e vão para o seu. Quem tem menos perde só o que tem: ninguém fica abaixo de zero.",
        break:
          "Vale a partir da pergunta em que é usado: a resposta dele ali já vale ×1. Os pontos que ele já tem ficam, e Congelar não impede a quebra.",
        cut: "Vale para a resposta dele nesta pergunta, seja qual for a dificuldade ou o multiplicador: se acertar, leva só uma parte dos pontos. A sequência dele continua contando, e dois cortes na mesma pergunta não se somam.",
      },
      blocked: "Bloqueado",
    },
  },

  // Language Selector
  language: {
    select: "Selecione o idioma",
    current: "Idioma atual",
    change: "Trocar idioma",
  },

  // Reset Password
  resetPassword: {
    title: "Redefinir Senha",
    subtitle: "Escolha uma nova senha para a sua conta",
    verifying: "Verificando link de redefinição...",
    newPassword: "Nova senha",
    confirmPassword: "Confirmar nova senha",
    showPassword: "Mostrar senha",
    hidePassword: "Ocultar senha",
    submit: "Redefinir senha",
    submitting: "Redefinindo...",
    successTitle: "Senha redefinida!",
    successMessage: "Sua senha foi alterada com sucesso. Você já pode voltar ao jogo.",
    invalidTitle: "Link inválido ou expirado",
    invalidMessage: "Solicite um novo e-mail de redefinição de senha e tente novamente.",
    passwordMinLength: "A senha deve ter pelo menos 6 caracteres.",
    passwordMismatch: "As senhas não coincidem.",
    updateFailed: "Não foi possível redefinir a senha. Tente novamente.",
  },
} as const;

export type TranslationKeys = typeof ptBR;
