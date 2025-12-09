import { Question } from "@/types/quiz";

export const questions: Question[] = [
  // Easy (Questions 1-3) - 100 points each
  {
    id: 1,
    question: "Qual é a capital do Brasil?",
    options: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador"],
    correctAnswer: 2,
    difficulty: "easy",
    points: 100,
  },
  {
    id: 2,
    question: "Quantos dias tem um ano bissexto?",
    options: ["365", "366", "364", "367"],
    correctAnswer: 1,
    difficulty: "easy",
    points: 100,
  },
  {
    id: 3,
    question: "Qual é o maior planeta do Sistema Solar?",
    options: ["Terra", "Marte", "Júpiter", "Saturno"],
    correctAnswer: 2,
    difficulty: "easy",
    points: 100,
  },
  // Medium (Questions 4-7) - 250 points each
  {
    id: 4,
    question: "Em que ano o Brasil foi descoberto por Pedro Álvares Cabral?",
    options: ["1492", "1500", "1510", "1498"],
    correctAnswer: 1,
    difficulty: "medium",
    points: 250,
  },
  {
    id: 5,
    question: "Qual elemento químico tem o símbolo 'Au'?",
    options: ["Prata", "Alumínio", "Ouro", "Argônio"],
    correctAnswer: 2,
    difficulty: "medium",
    points: 250,
  },
  {
    id: 6,
    question: "Quem pintou a Mona Lisa?",
    options: ["Michelangelo", "Leonardo da Vinci", "Rafael", "Donatello"],
    correctAnswer: 1,
    difficulty: "medium",
    points: 250,
  },
  {
    id: 7,
    question: "Qual é o rio mais longo do mundo?",
    options: ["Amazonas", "Nilo", "Mississipi", "Yangtzé"],
    correctAnswer: 1,
    difficulty: "medium",
    points: 250,
  },
  // Hard (Questions 8-10) - 500 points each
  {
    id: 8,
    question: "Em que ano terminou a Segunda Guerra Mundial?",
    options: ["1943", "1944", "1945", "1946"],
    correctAnswer: 2,
    difficulty: "hard",
    points: 500,
  },
  {
    id: 9,
    question: "Qual é a fórmula química do ácido sulfúrico?",
    options: ["H2SO3", "H2SO4", "HSO4", "H2S2O4"],
    correctAnswer: 1,
    difficulty: "hard",
    points: 500,
  },
  {
    id: 10,
    question: "Quem escreveu 'Os Lusíadas'?",
    options: ["Fernando Pessoa", "Machado de Assis", "Luís de Camões", "José Saramago"],
    correctAnswer: 2,
    difficulty: "hard",
    points: 500,
  },
];

export const getShuffledQuestions = (): Question[] => {
  const easy = questions.filter((q) => q.difficulty === "easy");
  const medium = questions.filter((q) => q.difficulty === "medium");
  const hard = questions.filter((q) => q.difficulty === "hard");

  const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  return [
    ...shuffleArray(easy).slice(0, 3),
    ...shuffleArray(medium).slice(0, 4),
    ...shuffleArray(hard).slice(0, 3),
  ];
};
