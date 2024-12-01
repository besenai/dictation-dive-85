export interface Subtitle {
  id: number;
  text: string;
  startTime: number;
  endTime: number;
}

export const parseSRT = (srtContent: string): Subtitle[] => {
  const subtitles: Subtitle[] = [];
  // Split content by double newline to separate subtitle blocks
  const blocks = srtContent.trim().split('\n\n');

  blocks.forEach((block) => {
    const lines = block.split('\n');
    if (lines.length < 3) return;

    // Parse the subtitle index
    const id = parseInt(lines[0]);
    
    // Parse the timestamp line
    const times = lines[1].split(' --> ');
    
    // Get only the text content, joining multiple lines if necessary
    // Remove any HTML tags that might be present in subtitles
    const text = lines.slice(2)
      .join(' ')
      .replace(/<[^>]*>/g, '')
      .trim();

    const startTime = timeToMilliseconds(times[0]);
    const endTime = timeToMilliseconds(times[1]);

    if (!isNaN(id) && text) {
      subtitles.push({ id, text, startTime, endTime });
    }
  });

  // Sort subtitles by their ID to ensure correct order
  return subtitles.sort((a, b) => a.id - b.id);
};

const timeToMilliseconds = (timeString: string): number => {
  const [time, milliseconds] = timeString.split(',');
  const [hours, minutes, seconds] = time.split(':').map(Number);
  
  return (hours * 3600000) + (minutes * 60000) + (seconds * 1000) + parseInt(milliseconds);
};