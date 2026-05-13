export type AudioChunkCallback = (data: Int16Array) => void;
export type AudioLevelCallback = (level: number) => void;

// Target: 16kHz mono PCM for Whisper
const TARGET_SAMPLE_RATE = 16000;
// ScriptProcessor buffer size: 4096 samples @ native rate
const BUFFER_SIZE = 4096;

class MicrophoneService {
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private silentGain: GainNode | null = null;
  private stream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private isRecording: boolean = false;
  private nativeSampleRate: number = 48000;
  private downsampleRatio: number = 1;

  /**
   * Downsample a Float32 buffer from nativeSampleRate → TARGET_SAMPLE_RATE
   * using simple decimation (nearest-neighbour, good enough for speech).
   */
  private downsample(input: Float32Array): Float32Array {
    if (this.downsampleRatio === 1) return input;
    const outputLength = Math.floor(input.length / this.downsampleRatio);
    const output = new Float32Array(outputLength);
    for (let i = 0; i < outputLength; i++) {
      output[i] = input[Math.floor(i * this.downsampleRatio)];
    }
    return output;
  }

  async start(onAudioChunk: AudioChunkCallback, onLevel: AudioLevelCallback): Promise<MediaStream> {
    if (this.isRecording) throw new Error('Recording already in progress');

    console.log('[MIC] Requesting getUserMedia...');
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
        sampleRate: { ideal: TARGET_SAMPLE_RATE },
      },
    });
    console.log('[MIC] getUserMedia granted ✅');

    // Do NOT force sampleRate in AudioContext — many browsers silently reject 16000
    // and fall back to system default (usually 48000). We downsample manually.
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.nativeSampleRate = this.audioContext.sampleRate;
    this.downsampleRatio = this.nativeSampleRate / TARGET_SAMPLE_RATE;

    console.log(
      `[MIC] AudioContext sampleRate: ${this.nativeSampleRate}Hz` +
        (this.downsampleRatio !== 1
          ? ` → will downsample to ${TARGET_SAMPLE_RATE}Hz (ratio ${this.downsampleRatio.toFixed(2)})`
          : ' (native 16kHz ✅)')
    );

    const source = this.audioContext.createMediaStreamSource(this.stream);

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;

    this.processor = this.audioContext.createScriptProcessor(BUFFER_SIZE, 1, 1);

    // ⚠️ ScriptProcessorNode MUST be connected to destination for onaudioprocess to fire.
    // Without this the browser audio graph is inactive and the callback never runs (0 chunks).
    // We use a GainNode set to 0 so the processor is "connected" but outputs total silence —
    // no audio feedback loop, but the processor events work correctly.
    const silentGain = this.audioContext.createGain();
    silentGain.gain.value = 0;
    this.silentGain = silentGain;

    source.connect(this.analyser);
    this.analyser.connect(this.processor);
    this.processor.connect(silentGain);
    silentGain.connect(this.audioContext.destination);

    let chunkCount = 0;
    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0); // Float32, native SR

      // --- Audio Level (RMS) ---
      let sumSq = 0;
      for (let i = 0; i < inputData.length; i++) sumSq += inputData[i] * inputData[i];
      const rms = Math.sqrt(sumSq / inputData.length);
      onLevel(rms);

      // --- Downsample to 16kHz ---
      const downsampled = this.downsample(inputData);

      // --- Convert Float32 → Int16 PCM ---
      const int16Data = new Int16Array(downsampled.length);
      for (let i = 0; i < downsampled.length; i++) {
        const clamped = Math.max(-1, Math.min(1, downsampled[i]));
        int16Data[i] = clamped * 0x7fff;
      }

      chunkCount++;
      if (chunkCount % 20 === 0) {
        // Log every 20 chunks (~2s at 100ms chunks) to avoid console spam
        console.log(
          `[MIC] chunk #${chunkCount} | samples: ${int16Data.length} | bytes: ${int16Data.byteLength} | rms: ${rms.toFixed(4)}`
        );
      }

      // ✅ slice(0) ensures a fresh ArrayBuffer copy — avoids detached buffer on send
      onAudioChunk(int16Data);
    };

    this.isRecording = true;
    console.log(`[MIC] Stream started 🎙️ | BufferSize: ${BUFFER_SIZE} | NativeSR: ${this.nativeSampleRate}Hz → Target: ${TARGET_SAMPLE_RATE}Hz`);
    return this.stream;
  }

  stop() {
    if (this.processor) {
      this.processor.disconnect();
      this.processor.onaudioprocess = null;
      this.processor = null;
    }

    if (this.silentGain) {
      this.silentGain.disconnect();
      this.silentGain = null;
    }

    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.isRecording = false;
    console.log('[MIC] Stream fully stopped & cleaned up 🛑');
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  get isActive(): boolean {
    return this.isRecording;
  }
}

export const micService = new MicrophoneService();
