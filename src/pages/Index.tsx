import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { parseSRT, type Subtitle } from '@/utils/subtitleParser';

const Index = () => {
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const synth = window.speechSynthesis;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = parseSRT(text);
      setSubtitles(parsed);
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
    if (!subtitles[currentIndex]) return;
    
    const utterance = new SpeechSynthesisUtterance(subtitles[currentIndex].text);
    synth.speak(utterance);
  };

  const checkAnswer = () => {
    setShowResult(true);
    const correct = userInput.trim().toLowerCase() === subtitles[currentIndex].text.trim().toLowerCase();
    
    if (correct) {
      toast({
        title: "Correct!",
        description: "Well done! Move on to the next sentence.",
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
                <Button
                  variant="outline"
                  onClick={playCurrentSentence}
                  className="flex items-center gap-2"
                >
                  Play Audio
                </Button>
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
                    disabled={currentIndex === subtitles.length - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>

              {showResult && (
                <div className={`p-4 rounded-md ${
                  userInput.trim().toLowerCase() === subtitles[currentIndex].text.trim().toLowerCase()
                    ? 'bg-success/10 text-success'
                    : 'bg-error/10 text-error'
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