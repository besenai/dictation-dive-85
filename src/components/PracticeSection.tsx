import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic } from "lucide-react";
import { toast } from "sonner";
import { type Subtitle } from '@/utils/subtitleParser';

interface PracticeSectionProps {
  currentSubtitle: Subtitle;
  userInput: string;
  setUserInput: (value: string) => void;
  showResult: boolean;
  onCheckAnswer: () => void;
  selectedLanguage: string;
}

export const PracticeSection = ({
  currentSubtitle,
  userInput,
  setUserInput,
  showResult,
  onCheckAnswer,
  selectedLanguage
}: PracticeSectionProps) => {
  const [isListening, setIsListening] = useState(false);

  const startSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = selectedLanguage;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Listening...");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setUserInput(transcript);
      toast.success("Speech captured!");
    };

    recognition.onerror = (event: any) => {
      toast.error("Error occurred in recognition: " + event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 space-y-4 animate-fade-in">
      <div className="space-y-4">
        <Button
          onClick={startSpeechRecognition}
          className={`w-full flex items-center justify-center gap-2 transition-colors ${
            isListening 
              ? 'bg-primary text-white' 
              : 'bg-white hover:bg-primary hover:text-white border border-primary/20'
          }`}
        >
          <Mic className="h-4 w-4" />
          Voice Input
        </Button>

        <div className="relative">
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type what you hear..."
            className="w-full pr-12 border-2 focus:border-primary/50 transition-colors"
          />
        </div>

        <Button
          onClick={onCheckAnswer}
          className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3"
          disabled={showResult}
        >
          Check Answer
        </Button>

        {showResult && (
          <div className={`p-6 rounded-lg ${
            userInput.trim().toLowerCase() === currentSubtitle.text.trim().toLowerCase()
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p className="font-medium mb-2">Correct answer:</p>
            <p className="text-lg">{currentSubtitle.text}</p>
          </div>
        )}
      </div>
    </div>
  );
};