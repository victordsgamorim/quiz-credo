const ADJECTIVES = [
  "Rápido",
  "Sábio",
  "Brilhante",
  "Astuto",
  "Perspicaz",
  "Genial",
  "Esperto",
  "Atento",
  "Lógico",
  "Criativo",
  "Focado",
  "Inteligente",
  "Audaz",
  "Corajoso",
  "Confiante",
  "Estratégico",
  "Talentoso",
  "Habilidoso",
  "Ágil",
  "Dinâmico",
];

const NOUNS = [
  "Cérebro",
  "Mestre",
  "Gênio",
  "Sábio",
  "Pensador",
  "Estrategista",
  "Campeão",
  "Vencedor",
  "Expert",
  "Prodígio",
  "Craque",
  "Virtuoso",
  "Ninja",
  "Guerreiro",
  "Herói",
  "Desafiante",
  "Competidor",
  "Jogador",
  "Aventureiro",
  "Explorador",
];

/**
 * Generates a random guest name in the format "Adjective Noun + Number"
 * Example: "Rápido Cérebro 42"
 *
 * @returns A randomly generated guest name string
 */
export function generateRandomGuestName(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const number = Math.floor(Math.random() * 100);

  return `${adjective} ${noun} ${number}`;
}
