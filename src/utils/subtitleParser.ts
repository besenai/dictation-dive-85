export interface Subtitle {
  id: number;
  text: string;
  startTime: number;
  endTime: number;
}

export const parseSRT = (srtContent: string): Subtitle[] => {
  const subtitles: Subtitle[] = [];
  
  // Normalize line endings and split content by double newline
  const normalizedContent = srtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalizedContent.trim().split('\n\n');

  blocks.forEach((block) => {
    // Split block into lines and remove empty lines
    const lines = block.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 3) return;

    // Parse the subtitle index (should be a number)
    const id = parseInt(lines[0]);
    if (isNaN(id)) return;

    // Parse the timestamp line
    const timestampLine = lines[1].trim();
    const timestampMatch = timestampLine.match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
    if (!timestampMatch) return;

    // Get the text content (all remaining lines)
    const textLines = lines.slice(2);
    // Clean the text: remove HTML tags, normalize whitespace, and trim
    const text = textLines
      .join(' ')
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\{[^}]*\}/g, '') // Remove curly brace content like {F6}
      .replace(/\[[^\]]*\]/g, '') // Remove square bracket content like [applause]
      .replace(/\([^)]*\)/g, '') // Remove parentheses content like (laughing)
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    if (!text) return; // Skip if no text content

    const startTime = timeToMilliseconds(timestampMatch[1]);
    const endTime = timeToMilliseconds(timestampMatch[2]);

    subtitles.push({ id, text, startTime, endTime });
  });

  // Sort subtitles by their ID to ensure correct order
  return subtitles.sort((a, b) => a.id - b.id);
};

const timeToMilliseconds = (timeString: string): number => {
  const [time, milliseconds] = timeString.split(',');
  const [hours, minutes, seconds] = time.split(':').map(Number);
  
  return (hours * 3600000) + (minutes * 60000) + (seconds * 1000) + parseInt(milliseconds);
};