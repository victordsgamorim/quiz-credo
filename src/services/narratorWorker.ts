/*
 * The narrator's voice, off the page's thread (see narrator.ts): Piper, the voice engine behind
 * TTSLocal, turns each line into speech in the browser with ONNX Runtime. The voice's model
 * downloads from Hugging Face the first time and stays in the browser's private files (OPFS).
 */
import piperDataUrl from "@diffusionstudio/piper-wasm/build/piper_phonemize.data?url";
import piperWasmUrl from "@diffusionstudio/piper-wasm/build/piper_phonemize.wasm?url";
import { INFERENCE_PROGRESS_URL, TtsSession, type Progress } from "@mintplex-labs/piper-tts-web";
import onnxWasmUrl from "onnxruntime-web/ort-wasm-simd-threaded.wasm?url";

export type NarratorRequest =
  | { type: "load"; voiceId: string }
  | { type: "synthesize"; id: number; text: string };

export type NarratorResponse =
  // How much of the voice's model downloaded, from 0 to 100
  | { type: "progress"; percent: number }
  | { type: "ready" }
  | { type: "load-failed"; message: string }
  // A line's speech, as a WAV file
  | { type: "audio"; id: number; audio: Blob }
  | { type: "synthesis-failed"; id: number; message: string };

let session: Promise<TtsSession> | null = null;
// One line at a time, in the order they were asked for
let synthesis = Promise.resolve();

const post = (message: NarratorResponse) => self.postMessage(message);

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : JSON.stringify(error);

// The library sets its phonemizer up again for every line: from memory, it costs no request
const toObjectUrl = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  return URL.createObjectURL(await response.blob());
};

const createSession = async (voiceId: string) => {
  const [piperWasm, piperData] = await Promise.all([
    toObjectUrl(piperWasmUrl),
    toObjectUrl(piperDataUrl),
  ]);
  let lastPercent = -1;

  return TtsSession.create({
    voiceId,
    wasmPaths: {
      // Typed as a folder, but the library hands it to ONNX Runtime's wasmPaths as is, which also
      // takes the file's own URL (the build adds a hash to its name)
      onnxWasm: { wasm: onnxWasmUrl } as unknown as string,
      piperWasm,
      piperData,
    },
    progress: ({ url, loaded, total }: Progress) => {
      // The library also reports here how far a long line's synthesis went
      if (url === INFERENCE_PROGRESS_URL || total <= 0) return;
      const percent = Math.floor((loaded / total) * 100);
      if (percent === lastPercent) return;
      lastPercent = percent;
      post({ type: "progress", percent });
    },
  });
};

const load = (voiceId: string) => {
  session = createSession(voiceId);
  session.then(
    () => post({ type: "ready" }),
    (error: unknown) => post({ type: "load-failed", message: getErrorMessage(error) })
  );
};

const synthesize = (id: number, text: string) => {
  synthesis = synthesis.then(async () => {
    try {
      if (session === null) throw new Error("No voice loaded");
      const audio = await (await session).predict(text);
      post({ type: "audio", id, audio });
    } catch (error) {
      post({ type: "synthesis-failed", id, message: getErrorMessage(error) });
    }
  });
};

self.onmessage = ({ data }: MessageEvent<NarratorRequest>) => {
  if (data.type === "load") {
    load(data.voiceId);
  } else {
    synthesize(data.id, data.text);
  }
};
