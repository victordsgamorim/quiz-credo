setcpm(15);

// Acordes eletrônicos suaves
const pad = note(`
  [d4,f4,a4,c5]
  [g3,b3,d4,f4]
  [c4,e4,g4,b4]
  [c4,e4,g4,c5]
`)
  .s("sawtooth")
  .lpf(1100)
  .attack(0.06)
  .decay(0.2)
  .sustain(0.35)
  .release(0.12)
  .clip(0.75)
  .gain(0.16)
  .room(0.12)
  .orbit(1);

// Melodia eletrônica com síntese FM
const melody = note("a4 c5 d5 ~ b4 d5 e5 [c5,e5,g5]")
  .s("sine")
  .fm(3)
  .fmh(1.5)
  .fmdecay(0.15)
  .fmsustain(0)
  .attack(0.005)
  .decay(0.2)
  .sustain(0.12)
  .release(0.1)
  .clip(0.65)
  .gain(0.22)
  .delay(0.12)
  .delaytime(0.15)
  .delayfeedback(0.1)
  .orbit(2);

// Baixo eletrônico
const bass = note("d2 g2 c2 c2")
  .s("sawtooth")
  .lpf(220)
  .attack(0.01)
  .decay(0.22)
  .sustain(0.35)
  .release(0.12)
  .clip(0.7)
  .gain(0.25);

// Batida discreta
const beat = s("bd ~ hh ~ bd ~ hh ~").gain(0.14).orbit(3);

// Vinheta sem repetição
stack(pad, melody, bass, beat).filterHaps((h) => h.whole.begin < 1);
