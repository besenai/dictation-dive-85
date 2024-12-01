import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { parseSRT, type Subtitle } from '@/utils/subtitleParser';
import { SubtitleControls } from '@/components/SubtitleControls';

const Index = () => {
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [speechRate, setSpeechRate] = useState(1.0);
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
    
    if (synth.speaking) {
      synth.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(currentSubtitle.text);
    utterance.lang = selectedLanguage;
    utterance.rate = speechRate;
    
    utterance.onend = () => {
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
    if (synth.speaking) {
      synth.cancel();
    }
    
    if (currentIndex < subtitles.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserInput('');
      setShowResult(false);
    }
  };

  const previousSentence = () => {
    if (synth.speaking) {
      synth.cancel();
    }
    
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setUserInput('');
      setShowResult(false);
    }
  };

  const jumpToSentence = (index: number) => {
    if (synth.speaking) {
      synth.cancel();
    }
    
    setCurrentIndex(index);
    setUserInput('');
    setShowResult(false);
  };

  const handleSpeechInput = (text: string) => {
    setUserInput(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-secondary p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Language Learning
          </h1>
          <p className="text-secondary-foreground/80 text-lg">
            Enhance your language skills through interactive practice
          </p>
        </div>

        {subtitles.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg text-center animate-slide-up">
            <h2 className="text-2xl font-semibold mb-6 text-primary">Upload Subtitles</h2>
            <div className="max-w-md mx-auto">
              <Input
                type="file"
                accept=".srt"
                onChange={handleFileUpload}
                className="mb-4 border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors rounded-lg p-8"
              />
              <p className="text-sm text-gray-500">Upload an SRT file to begin your practice session</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-slide-up">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
              <SubtitleControls
                currentIndex={currentIndex}
                totalSubtitles={subtitles.length}
                selectedLanguage={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
                onPlayAudio={playCurrentSentence}
                onNext={nextSentence}
                onBack={previousSentence}
                onJumpTo={jumpToSentence}
                speechRate={speechRate}
                onSpeechRateChange={setSpeechRate}
                onUserInput={handleSpeechInput}
              />
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 space-y-4">
              <div className="relative">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type what you hear..."
                  className="w-full pr-12 border-2 focus:border-primary/50 transition-colors"
                />
              </div>

              <Button
                onClick={checkAnswer}
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3"
                disabled={showResult}
              >
                Check Answer
              </Button>

              {showResult && (
                <div className={`p-6 rounded-lg ${
                  userInput.trim().toLowerCase() === subtitles[currentIndex].text.trim().toLowerCase()
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  <p className="font-medium mb-2">Correct answer:</p>
                  <p className="text-lg">{subtitles[currentIndex].text}</p>
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