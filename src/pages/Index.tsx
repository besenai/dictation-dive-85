import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { parseSRT, type Subtitle } from '@/utils/subtitleParser';
import { SubtitleControls } from '@/components/SubtitleControls';
import { PracticeSection } from '@/components/PracticeSection';

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
        toast.error("No valid subtitles found in the file");
        return;
      }

      setSubtitles(parsed);
      setCurrentIndex(0);
      setUserInput('');
      setShowResult(false);
      toast.success(`Loaded ${parsed.length} sentences`);
    } catch (error) {
      toast.error("Failed to parse subtitle file");
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
      toast.success("Well done! You can now move to the next sentence.");
    } else {
      toast.error("Try again or check the correct answer below.");
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
                onUserInput={setUserInput}
              />
            </div>

            <PracticeSection
              currentSubtitle={subtitles[currentIndex]}
              userInput={userInput}
              setUserInput={setUserInput}
              showResult={showResult}
              onCheckAnswer={checkAnswer}
              selectedLanguage={selectedLanguage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;