import { useEffect, useRef } from "react";

import { Renderer, Camera, Transform, Geometry, Program, Mesh } from "ogl";

// ============================================
// CONFIGURAÇÕES DAS PARTÍCULAS
// ============================================
const PARTICLE_CONFIG = {
  // Quantidade de partículas (padrão: 100)
  count: 100,

  // Tamanho das partículas (padrão: 500, maior = partículas maiores)
  size: 500,

  // Velocidade de rotação (padrão: 0.1, maior = mais rápido)
  rotationSpeed: 0.1,

  // Intensidade do movimento de onda (padrão: 0.3, maior = mais movimento)
  waveIntensity: 0.3,

  // Velocidade da animação de pulso (padrão: 2.0, maior = pulsa mais rápido)
  pulseSpeed: 2.0,

  // Opacidade base (min: 0.7, max varia com pulse, padrão: 0.7 a 1.2)
  opacityMin: 0.7,
  opacityRange: 0.5, // Adiciona até 0.5 com o pulso

  // Opacidade geral do canvas (0 a 1, padrão: 0.9)
  canvasOpacity: 0.9,

  // Área de distribuição das partículas (padrão: 15, maior = mais espalhadas)
  spreadArea: 15,

  // Campo de visão da câmera (padrão: 35, menor = mais zoom)
  cameraFov: 35,

  // Distância da câmera (padrão: 15, maior = mais longe)
  cameraDistance: 15,

  // Cores (RGB de 0 a 1)
  color1: { r: 1.0, g: 0.84, b: 0.0 }, // Dourado intenso
  color2: { r: 1.0, g: 0.95, b: 0.6 }, // Dourado claro
};
// ============================================

// eslint-disable-next-line max-lines-per-function
export const ParticlesBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // eslint-disable-next-line max-lines-per-function
  useEffect(() => {
    if (!canvasRef.current) {
      console.warn("[ParticlesBackground] Canvas ref not available");
      return;
    }

    console.warn("[ParticlesBackground] Initializing particles");
    const canvas = canvasRef.current;

    try {
      const renderer = new Renderer({ canvas, dpr: 2, alpha: true });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);
      console.warn("[ParticlesBackground] WebGL context created successfully");

      const camera = new Camera(gl, { fov: PARTICLE_CONFIG.cameraFov });
      camera.position.set(0, 0, PARTICLE_CONFIG.cameraDistance);

      const scene = new Transform();

      // Vertex shader
      const vertex = /* glsl */ `
      attribute vec3 position;
      attribute vec3 random;

      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      uniform float uTime;

      varying vec3 vRandom;

      void main() {
        vRandom = random;

        // Animate position
        vec3 pos = position;

        // Wave motion (intensidade controlada por waveIntensity)
        pos.x += sin(uTime * random.x + random.y * 6.28) * ${PARTICLE_CONFIG.waveIntensity.toFixed(2)};
        pos.y += sin(uTime * random.y + random.z * 6.28) * ${PARTICLE_CONFIG.waveIntensity.toFixed(2)};
        pos.z += sin(uTime * random.z + random.x * 6.28) * ${PARTICLE_CONFIG.waveIntensity.toFixed(2)};

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = ${PARTICLE_CONFIG.size.toFixed(1)} / length(mvPosition.xyz) * (random.x + 1.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

      // Fragment shader
      const fragment = /* glsl */ `
      precision highp float;

      uniform float uTime;
      varying vec3 vRandom;

      void main() {
        vec2 uv = gl_PointCoord.xy;
        float circle = 1.0 - smoothstep(0.0, 0.5, length(uv - 0.5));

        // Gold color with variation
        vec3 color1 = vec3(${PARTICLE_CONFIG.color1.r}, ${PARTICLE_CONFIG.color1.g}, ${PARTICLE_CONFIG.color1.b});
        vec3 color2 = vec3(${PARTICLE_CONFIG.color2.r}, ${PARTICLE_CONFIG.color2.g}, ${PARTICLE_CONFIG.color2.b});
        vec3 color = mix(color1, color2, vRandom.x);

        // Pulse effect
        float pulse = sin(uTime * ${PARTICLE_CONFIG.pulseSpeed.toFixed(1)} + vRandom.y * 6.28) * 0.5 + 0.5;
        float alpha = circle * (${PARTICLE_CONFIG.opacityMin.toFixed(1)} + pulse * ${PARTICLE_CONFIG.opacityRange.toFixed(1)});

        gl_FragColor = vec4(color, alpha);
      }
    `;

      // Create particles
      const numParticles = PARTICLE_CONFIG.count;
      const position = new Float32Array(numParticles * 3);
      const random = new Float32Array(numParticles * 3);

      for (let i = 0; i < numParticles; i++) {
        const i3 = i * 3;
        position[i3 + 0] = (Math.random() - 0.5) * PARTICLE_CONFIG.spreadArea;
        position[i3 + 1] = (Math.random() - 0.5) * PARTICLE_CONFIG.spreadArea;
        position[i3 + 2] = (Math.random() - 0.5) * PARTICLE_CONFIG.spreadArea;

        random[i3 + 0] = Math.random();
        random[i3 + 1] = Math.random();
        random[i3 + 2] = Math.random();
      }

      const geometry = new Geometry(gl, {
        position: { size: 3, data: position },
        random: { size: 3, data: random },
      });

      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          uTime: { value: 0 },
        },
        transparent: true,
        depthTest: false,
      });

      const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });
      particles.setParent(scene);
      console.warn("[ParticlesBackground] Mesh created with", numParticles, "particles");

      // Animation loop
      let animationId: number;
      const startTime = Date.now();

      function update() {
        animationId = requestAnimationFrame(update);

        const time = (Date.now() - startTime) * 0.001;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        program.uniforms.uTime.value = time;

        // Slow rotation
        particles.rotation.y = time * PARTICLE_CONFIG.rotationSpeed;

        renderer.render({ scene, camera });
      }

      update();

      // Handle resize
      function resize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
      }

      window.addEventListener("resize", resize);
      resize();
      console.warn(
        "[ParticlesBackground] Animation started, canvas size:",
        window.innerWidth,
        "x",
        window.innerHeight
      );

      // Cleanup
      return () => {
        window.removeEventListener("resize", resize);
        cancelAnimationFrame(animationId);
      };
    } catch (error) {
      console.error("[ParticlesBackground] Error initializing particles:", error);
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ opacity: PARTICLE_CONFIG.canvasOpacity, width: "100%", height: "100%" }}
    />
  );
};
