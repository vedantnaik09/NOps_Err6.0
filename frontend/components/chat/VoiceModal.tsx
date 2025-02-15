import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, Loader2, X, Square } from 'lucide-react';
import SpeakingAnimation from './SpeakingAnimation';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscription: (text: string) => Promise<void>;
  isSpeaking: boolean;
  onDiscard: () => void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const VoiceModal: React.FC<VoiceModalProps> = ({ 
  isOpen, 
  onClose, 
  onTranscription, 
  isSpeaking,
  onDiscard 
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const isSpeechRecognitionSupported = (): boolean => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  };

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(true);
    setTranscript('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const current = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join(' ');
      setTranscript(current);
    };

    recognition.onend = () => {
      if (isListening && recognitionRef.current) {
        recognition.start();
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setIsListening(false);
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (error) {
      console.error('Error starting recognition:', error);
      setIsListening(false);
    }
  }, [isListening]);

  const stopListening = useCallback(async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    console.log('Final transcript:', transcript);
    if (transcript) {
      setIsProcessing(true);
      try {
        await onTranscription(transcript);
      } catch (error) {
        console.error('Error processing transcription:', error);
      }
      setIsProcessing(false);
    }
  }, [transcript, onTranscription]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleStopSpeaking = () => {
    window.speechSynthesis.cancel();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  if (!isOpen) return null;

  if (!isSpeechRecognitionSupported()) {
    return (
      <div className="fixed inset-0 max-h-screen bg-[#0A0A0F] bg-opacity-80 flex items-center justify-center z-50">
        <div className="bg-[#1F1F2E] rounded-lg p-6 max-w-md w-full m-4">
          <p className="text-red-500">
            Speech recognition is not supported in your browser. Please try using Chrome.
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-700 rounded-lg text-white"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-[#0A0A0F] bg-opacity-80 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalContentRef}
        className="bg-[#1F1F2E] rounded-lg p-6 max-w-md w-full m-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Voice Input</h2>
          <button 
            onClick={onClose} 
            className="p-1"
            disabled={isSpeaking || isProcessing}
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>
        
        <div className="flex flex-col items-center space-y-4 py-8">
          {isSpeaking ? (
            <div className="flex flex-col items-center space-y-3">
              <div className="flex items-center space-x-4">
                <SpeakingAnimation />
              </div>
              <div className="text-center text-gray-300">
                Assistant is speaking...
                <button
                  onClick={handleStopSpeaking}
                  className="p-2 rounded-full hover:bg-gray-700 transition-colors text-red-500 font-semibold"
                  title="Stop speaking"
                >
                  Stop Speaking
                </button>
              </div>
            </div>
          ) : (
            <>
              <button 
                onClick={toggleListening}
                className="focus:outline-none transition-transform hover:scale-105"
                disabled={isProcessing}
              >
                {isListening ? (
                  <div className="animate-pulse">
                    <Mic className="h-12 w-12 text-red-500" />
                  </div>
                ) : (
                  <Mic className="h-12 w-12 text-gray-400" />
                )}
              </button>
              
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                  <span className="text-white">Processing...</span>
                </div>
              ) : (
                <p className="text-center text-gray-300">
                  {isListening 
                    ? 'Click microphone to stop recording' 
                    : 'Click microphone to start recording'}
                </p>
              )}
              
              {transcript && (
                <div className="mt-4 p-3 bg-[#0A0A0F] rounded-lg w-full">
                  <p className="text-sm text-gray-300">{transcript}</p>
                </div>
              )}

              <div className="flex space-x-2 mt-4">
                {transcript && !isListening && (
                  <>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      disabled={isProcessing}
                    >
                      Done
                    </button>
                    <button
                      onClick={onDiscard}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      disabled={isProcessing}
                    >
                      Discard
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceModal;