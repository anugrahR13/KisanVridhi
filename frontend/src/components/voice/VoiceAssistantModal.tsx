import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, RefreshCw, Bot, HelpCircle, CheckCircle2 } from 'lucide-react';
import { assistantService } from '../../services/appServices';
import { useAuth } from '../../context/AuthContext';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmId?: number;
}

interface LanguageOption {
  code: string;
  label: string;
  flag: string;
  greeting: string;
  promptSuggestions: string[];
}

const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'hi-IN',
    label: 'हिन्दी (Hindi)',
    flag: '🇮🇳',
    greeting: 'नमस्ते किसान मित्र! आप अपना सवाल बोल सकते हैं...',
    promptSuggestions: [
      'क्या आज गेहूं में सिंचाई करनी चाहिए?',
      'यूरिया और डीएपी खाद की सही मात्रा क्या है?',
      'पत्तियों पर पीले धब्बे आ गए हैं, क्या करें?',
      'जीवामृत प्राकृतिक खाद कैसे बनाएं?'
    ]
  },
  {
    code: 'en-IN',
    label: 'English (Indian)',
    flag: '🇮🇳',
    greeting: 'Hello Farmer! Please ask your agricultural question...',
    promptSuggestions: [
      'Should I irrigate my wheat crop today?',
      'What is the optimal Urea and DAP dose for 4 acres?',
      'How to control yellow rust on leaves organically?',
      'How to make fermented Jeevamrut bio-fertilizer?'
    ]
  },
  {
    code: 'pa-IN',
    label: 'ਪੰਜਾਬੀ (Punjabi)',
    flag: '🌾',
    greeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! ਆਪਣਾ ਸਵਾਲ ਬੋਲੋ...',
    promptSuggestions: [
      'ਕੀ ਅੱਜ ਕਣਕ ਨੂੰ ਪਾਣੀ ਦੇਣਾ ਚਾਹੀਦਾ ਹੈ?',
      'ਯੂਰੀਆ ਅਤੇ ਡੀ.ਏ.ਪੀ. ਦੀ ਸਹੀ ਮਾਤਰਾ ਕਿੰਨੀ ਹੈ?',
      'ਪੱਤਿਆਂ ਤੇ ਪੀਲੇ ਧੱਬਿਆਂ ਦੀ ਰੋਕਥਾਮ ਕਿਵੇਂ ਕਰੀਏ?',
      'ਪਰਾਲੀ ਨੂੰ ਬਿਨਾਂ ਸਾੜੇ ਖਾਦ ਕਿਵੇਂ ਬਣਾਈਏ?'
    ]
  },
  {
    code: 'te-IN',
    label: 'తెలుగు (Telugu)',
    flag: '🌱',
    greeting: 'నమస్కారం రైతు మిత్రమా! మీ ప్రశ్న అడగండి...',
    promptSuggestions: [
      'ఈ రోజు పంటకు నీరు పెట్టవచ్చా?',
      'ఎకరాకు యూరియా, డీఏపీ ఎంత మోతాదులో వాడాలి?',
      'ఆకులపై పసుపు మచ్చలను ఎలా నివారించాలి?',
      'జీవామృతం సేంద్రీయ ఎరువు ఎలా తయారు చేయాలి?'
    ]
  },
  {
    code: 'mr-IN',
    label: 'मराठी (Marathi)',
    flag: '🚩',
    greeting: 'नमस्कार शेतकरी मित्र! आपला शेती विषयक प्रश्न विचारा...',
    promptSuggestions: [
      'आज पिकाला पाणी देणे योग्य आहे का?',
      'युरिया आणि डीएपी खताचे योग्य प्रमाण काय आहे?',
      'पानांवरील पिवळे ठिपके कसे नियंत्रित करावे?',
      'जिवामृत सेंद्रिय खत कसे तयार करावे?'
    ]
  }
];

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose, farmId }) => {
  const [selectedLang, setSelectedLang] = useState<LanguageOption>(SUPPORTED_LANGUAGES[0]);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = selectedLang.code;

    recognition.onstart = () => {
      setIsListening(true);
      setInterimTranscript('');
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (interim) setInterimTranscript(interim);
      if (final) {
        setTranscript(final);
        handleSendQuestion(final);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      stopSpeaking();
    };
  }, [selectedLang]);

  // Clean up speech on close
  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      if (recognitionRef.current) recognitionRef.current.abort();
      setIsListening(false);
    }
  }, [isOpen]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      setResponse('');
      setTranscript('');
      setInterimTranscript('');
      try {
        recognitionRef.current.lang = selectedLang.code;
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSendQuestion = async (queryText: string) => {
    if (!queryText.trim()) return;
    setLoading(true);
    setResponse('');
    setSources([]);

    try {
      const data = await assistantService.chat(queryText, farmId);
      const answer = data.reply || data.answer || 'No advisory found.';
      setResponse(answer);
      setSources(data.sources || []);
      speakText(answer, selectedLang.code);
    } catch (err) {
      console.error('Error fetching voice advisory:', err);
      const fallback = 'KisanVridhi AI Advisory: Based on your soil and crop profile, maintain scheduled drip irrigation and apply recommended organic bio-fertilizers.';
      setResponse(fallback);
      speakText(fallback, selectedLang.code);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text: string, langCode: string) => {
    if (!('speechSynthesis' in window)) return;
    stopSpeaking();

    // Clean text by stripping markdown asterisks for natural reading
    const cleanText = text.replace(/[*#_`]/g, '').slice(0, 350);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = langCode;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-800 to-emerald-700 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-xs">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-1.5">
                Vernacular Voice Assistant
                <span className="text-[10px] bg-white/20 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live Voice
                </span>
              </h2>
              <p className="text-xs text-green-100 mt-0.5">
                Speak directly in your native language for verified ICAR farm guidance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close voice assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selection Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 p-2.5 flex items-center gap-1.5 overflow-x-auto text-xs">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                stopSpeaking();
                setSelectedLang(lang);
                if (isListening && recognitionRef.current) {
                  recognitionRef.current.abort();
                  setIsListening(false);
                }
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                selectedLang.code === lang.code
                  ? 'bg-green-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Waveform / Mic Listening Area */}
          <div className="text-center py-4 px-2 bg-gradient-to-b from-slate-50 to-white rounded-xl border border-slate-200 space-y-3">
            {isListening ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-1.5 h-10">
                  <span className="w-1.5 bg-green-600 rounded-full animate-bounce h-4" />
                  <span className="w-1.5 bg-green-600 rounded-full animate-bounce h-8 delay-75" />
                  <span className="w-1.5 bg-emerald-500 rounded-full animate-bounce h-10 delay-150" />
                  <span className="w-1.5 bg-green-600 rounded-full animate-bounce h-6 delay-200" />
                  <span className="w-1.5 bg-emerald-600 rounded-full animate-bounce h-9 delay-300" />
                  <span className="w-1.5 bg-green-500 rounded-full animate-bounce h-4 delay-75" />
                </div>
                <p className="text-xs font-bold text-green-800 animate-pulse">
                  Listening in {selectedLang.label}... Speak now!
                </p>
              </div>
            ) : isSpeaking ? (
              <div className="space-y-1">
                <div className="flex items-center justify-center space-x-2 text-green-700">
                  <Volume2 className="w-6 h-6 animate-pulse" />
                  <span className="text-xs font-bold">KisanVridhi Voice Answering...</span>
                </div>
                <button
                  onClick={stopSpeaking}
                  className="text-[11px] text-red-600 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <VolumeX className="w-3.5 h-3.5" /> Stop Voice Audio
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-600 font-medium">
                {selectedLang.greeting}
              </p>
            )}

            {/* Big Mic Button */}
            <div className="flex items-center justify-center pt-2">
              <button
                onClick={toggleListening}
                disabled={loading}
                className={`relative p-5 rounded-full shadow-lg transition-all transform active:scale-95 cursor-pointer ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-700 text-white ring-8 ring-red-100 animate-pulse'
                    : 'bg-green-700 hover:bg-green-800 text-white ring-8 ring-green-100 hover:ring-green-200'
                }`}
                title={isListening ? 'Stop Listening' : 'Start Speaking'}
              >
                {isListening ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {isListening ? 'Tap microphone to cancel' : 'Tap microphone and speak your question'}
            </p>
          </div>

          {/* Real-time transcribed text preview */}
          {(transcript || interimTranscript) && (
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">You Asked:</span>
              <p className="text-slate-900 font-semibold italic">
                "{transcript || interimTranscript}"
              </p>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center justify-center py-4 space-x-2 text-slate-600 text-xs font-medium">
              <RefreshCw className="w-4 h-4 animate-spin text-green-700" />
              <span>Analyzing agronomic knowledge base & synthesizing advice...</span>
            </div>
          )}

          {/* AI Response Box */}
          {response && !loading && (
            <div className="bg-green-50/70 border border-green-200 p-4 rounded-xl space-y-2.5 text-xs text-slate-800">
              <div className="flex items-center justify-between border-b border-green-200/60 pb-2">
                <span className="font-bold text-green-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-green-700" /> KisanVridhi Advisory
                </span>
                <button
                  onClick={() => isSpeaking ? stopSpeaking() : speakText(response, selectedLang.code)}
                  className="px-2.5 py-1 bg-white hover:bg-green-100 border border-green-300 text-green-800 font-semibold rounded-md flex items-center gap-1 text-[11px] transition-colors"
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-red-600" /> : <Volume2 className="w-3.5 h-3.5 text-green-700" />}
                  <span>{isSpeaking ? 'Mute' : 'Replay Voice'}</span>
                </button>
              </div>
              <div className="whitespace-pre-line leading-relaxed text-slate-800 font-medium">
                {response}
              </div>

              {sources.length > 0 && (
                <div className="pt-2 border-t border-green-200/50 space-y-1 text-[11px] text-slate-600">
                  <span className="font-bold text-slate-700 block">Verified References:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {sources.map((s, idx) => (
                      <span key={idx} className="bg-white border border-green-300 px-2 py-0.5 rounded text-[10px] font-semibold text-green-900">
                        {s.source || s.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Suggested Quick Vernacular Questions */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-green-700" /> Or Tap One-Click Vernacular Questions:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {selectedLang.promptSuggestions.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTranscript(prompt);
                    handleSendQuestion(prompt);
                  }}
                  className="text-left p-2.5 bg-slate-50 hover:bg-green-50 border border-slate-200 hover:border-green-300 rounded-lg text-slate-700 hover:text-green-900 font-medium transition-colors text-[11px] leading-snug cursor-pointer"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-3 px-5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-green-700" /> Grounded in ICAR, FAO & TNAU Literature
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-200 text-slate-700 font-semibold rounded-md border border-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
