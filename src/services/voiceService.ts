import { PREFERRED_VOICES } from '../App';

class AgriVoiceService {
  private synth: SpeechSynthesis;
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

    // High quality fallbacks
    const premiumFallback = available.find(v => /google|online|network|neural|wavenet|premium/i.test(v.name));
    if (premiumFallback) return premiumFallback;

    return available[0] || null;
  }

  /**
   * Speaks text with "Humanistic Prosody"
   * Breaks text into emotional chunks and adds randomized micro-delays and pitch shifts.
   */
  async speak(text: string, onStart?: () => void, onEnd?: () => void) {
    this.stop(); // Clear previous
    this.isSpeaking = true;
    if (onStart) onStart();

    const voice = await this.getBestVoice(this.language);
    
    // Convert text to a truly spoken format
    const cleanText = text
      .replace(/[*#`]/g, '')
      .replace(/(\d+)\.(\d+)/g, '$1 point $2') // Read decimals naturally
      .trim();

    // Split into natural "breathing" chunks (comma, period, etc)
    const chunks = cleanText.match(/[^,.!?;...]+[,.!?;...]*|[,.!?;...]+/g) || [cleanText];

    for (const chunk of chunks) {
      if (!this.isSpeaking) break;

      const trimmedChunk = chunk.trim();
      if (!trimmedChunk) continue;

      const utterance = new SpeechSynthesisUtterance(trimmedChunk);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      }

      // Humanistic Prosody: Slightly slower and warmer
      const isEnglish = this.language === 'en';
      const baseRate = isEnglish ? 0.94 : 0.84;
      
      // Randomize slightly to sound like a person thinking
      utterance.rate = baseRate + (Math.random() * 0.04 - 0.02);
      utterance.pitch = 1.05 + (Math.random() * 0.04);
      utterance.volume = 1.0;

      const isEnding = /[.!?]/.test(chunk);
      // Breathing gap: Longer for periods, shorter for commas
      const breathGap = isEnding ? 500 : 250;

      await new Promise((resolve) => {
        utterance.onend = () => {
          // Add a tiny "thinking" delay for realism
          const thinkingDelay = Math.random() * 100;
          setTimeout(resolve, breathGap + thinkingDelay);
        };
        utterance.onerror = (e) => {
          console.error("TTS Chunk Error:", e);
          resolve(false);
        };
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
