export interface Subtitle {
  id: number;
  text: string;
  startTime: number;
  endTime: number;
}

export const parseSRT = (srtContent: string): Subtitle[] => {
  const subtitles: Subtitle[] = [];
  const blocks = srtContent.trim().split('\n\n');

  blocks.forEach((block) => {
    const lines = block.split('\n');
    if (lines.length < 3) return;

    const id = parseInt(lines[0]);
    const times = lines[1].split(' --> ');
    const text = lines.slice(2).join(' ').replace(/<[^>]*>/g, '');

    const startTime = timeToMilliseconds(times[0]);
    const endTime = timeToMilliseconds(times[1]);

    subtitles.push({ id, text, startTime, endTime });
  });

  return subtitles;
};

const timeToMilliseconds = (timeString: string): number => {
  const [time, milliseconds] = timeString.split(',');
  const [hours, minutes, seconds] = time.split(':').map(Number);
  
  return (hours * 3600000) + (minutes * 60000) + (seconds * 1000) + parseInt(milliseconds);
};