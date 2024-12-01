import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { parseSRT, type Subtitle } from '@/utils/subtitleParser';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const Index = () => {
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const synth = window.speechSynthesis;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = parseSRT(text);
      
      if (parsed.length === 0) {
        toast({
          title: "Error",
          description: "No valid subtitles found in the file",
          variant: "destructive",
        });
        return;
      }

      setSubtitles(parsed);
      setCurrentIndex(0);
      setUserInput('');
      setShowResult(false);
      toast({
        title: "Success",
        description: `Loaded ${parsed.length} sentences`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse subtitle file",
        variant: "destructive",
      });
    }
  };

  const playCurrentSentence = () => {
    const currentSubtitle = subtitles[currentIndex];
    if (!currentSubtitle) return;
    
    // Cancel any ongoing speech
    if (synth.speaking) {
      synth.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(currentSubtitle.text);
    utterance.lang = selectedLanguage;
    
    // Add event listener to handle when speech ends
    utterance.onend = () => {
      // Speech has finished
      console.log('Speech finished');
    };
    
    synth.speak(utterance);
  };

  const checkAnswer = () => {
    if (!subtitles[currentIndex]) return;
    
    setShowResult(true);
    const correct = userInput.trim().toLowerCase() === subtitles[currentIndex].text.trim().toLowerCase();
    
    if (correct) {
      toast({
        title: "Correct!",
        description: "Well done! You can now move to the next sentence.",
      });
    } else {
      toast({
        title: "Not quite right",
        description: "Try again or check the correct answer below.",
        variant: "destructive",
      });
    }
  };

  const nextSentence = () => {
    // Cancel any ongoing speech before moving to next sentence
    if (synth.speaking) {
      synth.cancel();
    }
    
    if (currentIndex < subtitles.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserInput('');
      setShowResult(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-4">Language Learning</h1>
          <p className="text-secondary-foreground">Practice your listening and writing skills</p>
        </div>

        {subtitles.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center animate-slide-up">
            <h2 className="text-xl font-semibold mb-4">Upload Subtitles</h2>
            <Input
              type="file"
              accept=".srt"
              onChange={handleFileUpload}
              className="mb-4"
            />
            <p className="text-sm text-gray-500">Upload an SRT file to begin practice</p>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-md animate-slide-up">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Sentence {currentIndex + 1} of {subtitles.length}
                </span>
                <div className="flex items-center gap-4">
                  <Select
                    value={selectedLanguage}
                    onValueChange={setSelectedLanguage}
                  >
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
                  <Button
                    variant="outline"
                    onClick={playCurrentSentence}
                    className="flex items-center gap-2"
                  >
                    Play Audio
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type what you hear..."
                  className="w-full"
                />

                <div className="flex gap-4">
                  <Button
                    onClick={checkAnswer}
                    className="flex-1"
                    disabled={showResult}
                  >
                    Check Answer
                  </Button>
                  <Button
                    onClick={nextSentence}
                    variant="outline"
                    className="flex-1"
                    disabled={currentIndex === subtitles.length - 1 || !showResult}
                  >
                    Next
                  </Button>
                </div>
              </div>

              {showResult && (
                <div className={`p-4 rounded-md ${
                  userInput.trim().toLowerCase() === subtitles[currentIndex].text.trim().toLowerCase()
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}>
                  <p className="font-medium">Correct answer:</p>
                  <p className="mt-1">{subtitles[currentIndex].text}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;