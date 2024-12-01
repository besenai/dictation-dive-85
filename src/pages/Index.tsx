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
            />

            <div className="space-y-4 mt-6">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type what you hear..."
                className="w-full"
              />

              <Button
                onClick={checkAnswer}
                className="w-full"
                disabled={showResult}
              >
                Check Answer
              </Button>

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