import { generateGeminiSpeech } from './geminiService';

/**
 * Audio Service for Nextwaver AI Meeting Team
 * Manages Web Audio API, Microphone Capture, Spectrum Analysis,
 * Chimes/Beeps, Speech Synthesis, and Speech Recognition.
 */

class AudioService {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recognition: any = null;
  private isRecognizing = false;

  private initAudioContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Play pleasant acoustic chimes
  playTone(type: 'raise_hand' | 'enroll_success' | 'meeting_start' | 'mic_ping') {
    try {
      const ctx = this.initAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'raise_hand') {
        // Dual chime for intervention (soft marimba style)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === 'enroll_success') {
        // Upward triad for successful profile creation
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'meeting_start') {
        // Executive welcome chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.start(now);
        osc.stop(now + 0.7);
      } else {
        // Soft click
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch (e) {
      // Audio playback fails gracefully if muted
    }
  }

  // Request & attach real conference microphone
  async startMicrophone(): Promise<boolean> {
    try {
      const ctx = this.initAudioContext();
      if (!ctx) return false;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.micStream = stream;
      this.micSource = ctx.createMediaStreamSource(stream);
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.8;
      this.micSource.connect(this.analyser);

      return true;
    } catch (error) {
      console.warn('Microphone access not granted or not available:', error);
      return false;
    }
  }

  stopMicrophone() {
    this.stopChunkRecording();
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    if (this.micSource) {
      this.micSource.disconnect();
      this.micSource = null;
    }
  }

  // MediaRecorder for Audio Chunks
  startChunkRecording() {
    if (!this.micStream) return;
    try {
      this.recordedChunks = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/ogg';
      this.mediaRecorder = new MediaRecorder(this.micStream, { mimeType });
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };
      this.mediaRecorder.start(1000); // 1-second timeslice
    } catch (e) {
      console.warn('Could not start MediaRecorder for chunks:', e);
    }
  }

  stopChunkRecording(): Blob | null {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        // ignore
      }
    }
    if (this.recordedChunks.length > 0) {
      const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
      this.recordedChunks = [];
      return blob;
    }
    return null;
  }

  // Synthesizes a valid playable 16-bit PCM WAV audio file (e.g., for simulated audio downloads)
  generatePlayableWavBlob(durationSeconds: number = 2): Blob {
    const sampleRate = 22050;
    const numChannels = 1;
    const numSamples = Math.floor(sampleRate * durationSeconds);
    const byteRate = sampleRate * numChannels * 2;
    const blockAlign = numChannels * 2;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // RIFF identifier
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true); // BitsPerSample
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // Generate harmonic chime & gentle ambient wave
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Soft conference tone: 440Hz + 660Hz with envelope decay
      const envelope = Math.max(0, 1 - t / durationSeconds);
      const sampleVal =
        (Math.sin(2 * Math.PI * 440 * t) * 0.4 +
          Math.sin(2 * Math.PI * 659.25 * t) * 0.3) *
        envelope *
        0.5;
      const s = Math.max(-1, Math.min(1, sampleVal));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  // Get live audio frequency spectrum and volume
  getAudioMetrics(): { volumeLevel: number; spectrum: number[]; hasVoiceActivity: boolean } {
    if (!this.analyser) {
      return { volumeLevel: 0, spectrum: new Array(16).fill(0), hasVoiceActivity: false };
    }

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    const step = Math.floor(bufferLength / 16);
    const spectrum: number[] = [];

    for (let i = 0; i < 16; i++) {
      const val = dataArray[i * step] || 0;
      spectrum.push(Math.round((val / 255) * 100));
      sum += val;
    }

    const avg = sum / bufferLength;
    const volumeLevel = Math.min(100, Math.round((avg / 128) * 100));
    const hasVoiceActivity = volumeLevel > 14;

    return { volumeLevel, spectrum, hasVoiceActivity };
  }

  // Web Speech Synthesis (Speak out loud in Thai/English)
  speakText(text: string, voiceName?: string): Promise<void> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel(); // Stop prior speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      // Detect Thai language or select voice
      const voices = window.speechSynthesis.getVoices();
      const thaiVoice = voices.find(
        (v) => v.lang.includes('th') || v.name.toLowerCase().includes('thai')
      );
      if (thaiVoice) {
        utterance.voice = thaiVoice;
        utterance.lang = 'th-TH';
      } else {
        utterance.lang = 'th-TH';
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    });
  }

  // Play Agent Speech via Gemini 3.8 Flash Lite TTS (Real-time AI voice) or fallback
  async playAgentSpeech(
    text: string,
    voiceName: string = 'Puck',
    onStatusChange?: (status: { active: boolean; engine: 'gemini_tts' | 'browser_speech'; voice: string }) => void
  ): Promise<void> {
    try {
      if (onStatusChange) onStatusChange({ active: true, engine: 'gemini_tts', voice: voiceName });

      // First attempt Gemini 3.8 Flash Lite TTS via backend
      const geminiAudio = await generateGeminiSpeech(text, voiceName);
      if (geminiAudio.audioBase64) {
        await this.playBase64Audio(geminiAudio.audioBase64);
        if (onStatusChange) onStatusChange({ active: false, engine: 'gemini_tts', voice: voiceName });
        return;
      }
    } catch (e) {
      console.warn('Gemini TTS playback failed, falling back to browser speech:', e);
    }

    // Fallback gracefully to Web Speech
    if (onStatusChange) onStatusChange({ active: true, engine: 'browser_speech', voice: voiceName });
    await this.speakText(text, voiceName);
    if (onStatusChange) onStatusChange({ active: false, engine: 'browser_speech', voice: voiceName });
  }

  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  // Play base64 WAV audio (e.g. from Gemini TTS)
  playBase64Audio(base64Data: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const audio = new Audio(`data:audio/wav;base64,${base64Data}`);
        audio.onended = () => resolve();
        audio.onerror = (e) => reject(e);
        audio.play().catch(reject);
      } catch (err) {
        reject(err);
      }
    });
  }

  // Web Speech Recognition (Voice to Text for live room input)
  startSpeechRecognition(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (err: any) => void
  ): boolean {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API is not supported in this browser environment.');
      return false;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'th-TH';

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          onResult(finalTranscript.trim(), true);
        } else if (interimTranscript) {
          onResult(interimTranscript.trim(), false);
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn('Speech recognition event:', event.error);
        }
        if (onError) onError(event);
      };

      this.recognition.onend = () => {
        this.isRecognizing = false;
      };

      this.recognition.start();
      this.isRecognizing = true;
      return true;
    } catch (e) {
      console.warn('Could not start SpeechRecognition:', e);
      return false;
    }
  }

  stopSpeechRecognition() {
    if (this.recognition && this.isRecognizing) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isRecognizing = false;
    }
  }
}

export const audioService = new AudioService();
