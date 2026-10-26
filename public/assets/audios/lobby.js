/*
 THE FINAL ANSWER
 Cinematic Orchestral Suspense

 120 BPM | 4/4 | 30 bars | 60 seconds

 Mystery -> Rising Tension -> Suspense
 -> Dramatic Climax -> Hope -> Loop

 No oscillators
 No electronic drums
 No synth pads
*/

setcpm(30);

// ========================================
// 1-6: MYSTERY
// ========================================

const mystery = stack(
  note("<[d3,a3] [d3,f3] [bb2,f3] [a2,e3] [g2,d3] [a2,e3]>")
    .s("gm_string_ensemble_1")
    .attack(0.3)
    .release(0.8)
    .gain(0.28)
    .room(0.45),

  note("<d2 d2 bb1 a1 g1 a1>").s("gm_cello").attack(0.15).release(0.7).gain(0.32),

  note("d4 e4 a4 ~").s("gm_violin").attack(0.12).release(0.6).gain(0.14).slow(2)
);

// ========================================
// 7-14: RISING TENSION
// ========================================

const tension = stack(
  note("<[d3,f3,a3] [bb2,d3,f3] [g2,bb2,d3] [a2,c#3,e3]>")
    .s("gm_string_ensemble_1")
    .attack(0.22)
    .release(0.65)
    .gain(0.34)
    .room(0.35),

  note("d3 ~ a3 ~ f3 ~ a3 ~").s("gm_pizzicato_strings").gain(0.18).release(0.15),

  note("<d2 bb1 g1 a1>").s("gm_cello").attack(0.12).release(0.5).gain(0.35),

  note("d3 ~ ~ a2").s("gm_timpani").gain(0.12)
);

// ========================================
// 15-22: SUSTAINED SUSPENSE
// ========================================

const suspense = stack(
  note("<[d3,f3,a3] [bb2,d3,f3] [g2,bb2,d3] [a2,c#3,e3]>")
    .s("gm_french_horn")
    .attack(0.3)
    .release(0.8)
    .gain(0.38)
    .room(0.5),

  note("<[d4,a4] [bb3,f4] [g3,d4] [a3,e4]>")
    .s("gm_string_ensemble_1")
    .attack(0.25)
    .release(0.7)
    .gain(0.35),

  note("d3 a3 d3 a3").s("gm_pizzicato_strings").gain(0.24).release(0.12),

  note("d2 ~ a2 ~").s("gm_timpani").gain(0.22)
);

// ========================================
// 23-27: DRAMATIC CLIMAX
// Gradual transition from tension to hope
// ========================================

const climax = stack(
  // French horns gradually become softer
  note("<[d3,f3,a3,d4] [c3,g3,c4] [bb2,f3,bb3] [a2,e3,a3] [d3,f#3,a3]>")
    .s("gm_french_horn")
    .attack("<.08 .10 .20 .35 .50>")
    .release(1.2)
    .gain("<.54 .50 .38 .26 .16>")
    .room(0.55),

  // Strings change from minor to major
  note("<[d4,f4,a4] [c4,e4,g4] [bb3,d4,f4] [a3,c#4,e4] [d4,f#4,a4]>")
    .s("gm_string_ensemble_1")
    .attack("<.12 .15 .25 .40 .50>")
    .release(1.5)
    .gain("<.45 .42 .35 .28 .22>")
    .room(0.55),

  // Timpani gradually disappear
  note("<[d2 a2 d2 a2] [d2 a2 d2 a2] [d2 ~ a2 ~] [d2 ~ ~ ~] [~ ~ ~ ~]>")
    .s("gm_timpani")
    .gain("<.42 .38 .28 .16 0>")
    .room(0.35),

  // Contrabass becomes softer
  note("<d2 c2 bb1 a1 d2>")
    .s("gm_contrabass")
    .attack("<.05 .08 .15 .25 .35>")
    .release(1)
    .gain("<.42 .38 .30 .22 .16>")
    .room(0.35),

  // Warm string layer enters near the end
  note("<~ ~ ~ [a3,c#4,e4] [d4,f#4,a4]>")
    .s("gm_string_ensemble_1")
    .attack(0.5)
    .release(1.4)
    .gain("<0 0 0 .12 .20>")
    .room(0.6)
);

// ========================================
// 28-30: HOPE AND SMOOTH RETURN
// ========================================

const hope = stack(
  // Warm harmony, gradually becoming quiet
  note("<[d3,f#3,a3] [g3,b3,d4] [d3,e3,a3]>")
    .s("gm_string_ensemble_1")
    .attack(0.35)
    .release(1.2)
    .gain("<.28 .23 .17>")
    .room(0.55),

  // French horns continue from the climax
  note("<[d3,a3] [g3,d4] [d3,a3]>")
    .s("gm_french_horn")
    .attack(0.4)
    .release(1.1)
    .gain("<.18 .15 .12>")
    .room(0.5),

  // Original motif returns
  note("d4 e4 a4 ~").s("gm_violin").attack(0.15).release(0.7).gain(0.14),

  // Low cello prepares the next loop
  note("<d2 g2 d2>").s("gm_cello").attack(0.2).release(0.8).gain("<.24 .23 .28>").room(0.35),

  // Gentle timpani pulse
  note("<[d2 ~ ~ ~] [~ ~ ~ ~] [d2 ~ ~ a2]>").s("gm_timpani").gain("<.10 0 .08>")
);

// ========================================
// COMPLETE 30-BAR ARRANGEMENT
// ========================================

arrange([6, mystery], [8, tension], [8, suspense], [5, climax], [3, hope]);
