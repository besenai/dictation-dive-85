import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mic } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SubtitleControlsProps {
  currentIndex: number;
  totalSubtitles: number;
  selectedLanguage: string;
  onLanguageChange: (value: string) => void;
  onPlayAudio: () => void;
  onNext: () => void;
  onBack: () => void;
  onJumpTo: (index: number) => void;
  speechRate: number;
  onSpeechRateChange: (value: number) => void;
  onUserInput: (text: string) => void;
}

const LANGUAGES = [
  { code: 'en-US', name: 'English' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'ko-KR', name: 'Korean' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
];

const SPEECH_RATES = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

export const SubtitleControls = ({
  currentIndex,
  totalSubtitles,
  selectedLanguage,
  onLanguageChange,
  onPlayAudio,
  onNext,
  onBack,
  onJumpTo,
  speechRate,
  onSpeechRateChange,
  onUserInput,
}: SubtitleControlsProps) => {
  const [isListening, setIsListening] = useState(false);
  const [jumpToValue, setJumpToValue] = useState(currentIndex + 1);

  const handleJumpToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setJumpToValue(value);
    if (!isNaN(value) && value > 0 && value <= totalSubtitles) {
      onJumpTo(value - 1);
    }
  };

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
      onUserInput(transcript);
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
    <div className="space-y-4 bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Sentence {currentIndex + 1} of {totalSubtitles}
          </span>
          <Input
            type="number"
            min={1}
            max={totalSubtitles}
            value={jumpToValue}
            onChange={handleJumpToChange}
            className="w-[100px]"
          />
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedLanguage} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={onPlayAudio} 
              className="flex items-center gap-2 hover:bg-primary hover:text-white transition-colors"
            >
              Play Audio
            </Button>
            <Select 
              value={speechRate.toString()} 
              onValueChange={(value) => onSpeechRateChange(parseFloat(value))}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SPEECH_RATES.map((rate) => (
                  <SelectItem key={rate} value={rate.toString()}>
                    {rate}x
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={startSpeechRecognition}
          className={`w-full flex items-center justify-center gap-2 ${
            isListening ? 'bg-primary text-white' : ''
          }`}
        >
          <Mic className="h-4 w-4" />
          Voice Input
        </Button>
        
        <div className="w-full relative">
          {/* This space is reserved for the text input and check answer button */}
        </div>
        
        <div className="flex gap-4">
          <Button 
            onClick={onBack} 
            variant="outline" 
            disabled={currentIndex === 0} 
            className="flex-1 hover:bg-primary hover:text-white transition-colors"
          >
            Back
          </Button>
          <Button 
            onClick={onNext} 
            variant="outline" 
            disabled={currentIndex === totalSubtitles - 1} 
            className="flex-1 hover:bg-primary hover:text-white transition-colors"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};