import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
}: SubtitleControlsProps) => {
  const handleJumpToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= totalSubtitles) {
      onJumpTo(value - 1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Sentence {currentIndex + 1} of {totalSubtitles}
        </span>
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
            <Button variant="outline" onClick={onPlayAudio} className="flex items-center gap-2">
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

      <div className="flex justify-center">
        <Input
          type="number"
          min={1}
          max={totalSubtitles}
          placeholder="Jump to sentence..."
          onChange={handleJumpToChange}
          className="w-[200px]"
        />
      </div>

      <div className="space-y-4">
        <div className="w-full">
          {/* This space is reserved for the text input and check answer button 
              which are managed by the parent component */}
        </div>
        
        <div className="flex gap-4">
          <Button onClick={onBack} variant="outline" disabled={currentIndex === 0} className="flex-1">
            Back
          </Button>
          <Button onClick={onNext} variant="outline" disabled={currentIndex === totalSubtitles - 1} className="flex-1">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};