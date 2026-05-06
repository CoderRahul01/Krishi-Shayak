import { PREFERRED_VOICES } from '../App';

class AgriVoiceService {
  private synth: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking: boolean = false;
  private language: string = 'en';

  constructor() {
    this.synth = window.speechSynthesis;
  }

  setLanguage(lang: string) {
    this.language = lang;
  }

  private async getBestVoice(lang: string): Promise<SpeechSynthesisVoice | null> {
    let voices = this.synth.getVoices();
    if (voices.length === 0) {
      await new Promise(resolve => {
        const timer = setTimeout(resolve, 1000);
        this.synth.onvoiceschanged = () => {
          clearTimeout(timer);
          resolve(true);
        };
      });
      voices = this.synth.getVoices();
    }

    const voiceLangs: Record<string, string> = {
      hi: 'hi-IN', mr: 'mr-IN', te: 'te-IN', ta: 'ta-IN',
      bn: 'bn-IN', gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN',
      pa: 'pa-IN', en: 'en-IN'
    };
    
    const targetLang = voiceLangs[lang] || 'en-IN';
    const available = voices.filter(v => 
      v.lang.toLowerCase().includes(lang.toLowerCase()) || 
      v.lang.toLowerCase().includes(targetLang.toLowerCase())
    );

    const preferred = PREFERRED_VOICES[lang] || [];
    for (const name of preferred) {
      const found = available.find(v => v.name.toLowerCase().includes(name.toLowerCase()));
      if (found) return found;
    }

    return available.find(v => /google|online|network|neural|premium/i.test(v.name)) || available[0] || null;
  }

  /**
   * Speaks text with "Humanistic Prosody"
   * Breaks text into emotional chunks and adds randomized micro-delays and pitch shifts.
   */
  async speak(text: string, onStart?: () => void, onEnd?: () => void) {
    this.synth.cancel();
    this.isSpeaking = true;
    if (onStart) onStart();

    const voice = await this.getBestVoice(this.language);
    
    // Clean text but keep prosody markers
    const cleanText = text.replace(/[*#`]/g, '').trim();
    // Split into natural "breathing" chunks
    const chunks = cleanText.match(/[^,.!?;...]+[,.!?;...]*|[,.!?;...]+/g) || [cleanText];

    for (const chunk of chunks) {
      if (!this.isSpeaking) break;

      const utterance = new SpeechSynthesisUtterance(chunk.trim());
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      }

      // Humanistic delivery parameters
      const baseRate = this.language === 'en' ? 0.96 : 0.86;
      // Micro-variation to avoid robotic "metronome" effect
      utterance.rate = baseRate + (Math.random() * 0.06 - 0.03);
      utterance.pitch = 1.04 + (Math.random() * 0.04);
      utterance.volume = 1.0;

      const isEnding = /[.!?]/.test(chunk);
      const breathGap = isEnding ? 500 : 200;

      await new Promise((resolve) => {
        utterance.onend = () => setTimeout(resolve, breathGap);
        utterance.onerror = () => resolve(false);
        this.synth.speak(utterance);
      });
    }

    this.isSpeaking = false;
    if (onEnd) onEnd();
  }

  stop() {
    this.isSpeaking = false;
    this.synth.cancel();
  }
}

export const agriVoice = new AgriVoiceService();
