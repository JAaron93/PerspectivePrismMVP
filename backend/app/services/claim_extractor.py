import re
from typing import List
from urllib.parse import urlparse, parse_qs
from youtube_transcript_api import YouTubeTranscriptApi
from app.models.schemas import Transcript, TranscriptSegment, Claim

class ClaimExtractor:
    def extract_video_id(self, url: str) -> str:
        """
        Extracts the video ID from a YouTube URL.
        """
        parsed_url = urlparse(url)
        if parsed_url.hostname == 'youtu.be':
            return parsed_url.path[1:]
        if parsed_url.hostname in ('www.youtube.com', 'youtube.com'):
            if parsed_url.path == '/watch':
                p = parse_qs(parsed_url.query)
                return p['v'][0]
            if parsed_url.path[:7] == '/embed/':
                return parsed_url.path.split('/')[2]
            if parsed_url.path[:3] == '/v/':
                return parsed_url.path.split('/')[2]
        raise ValueError("Invalid YouTube URL")

    def get_transcript(self, video_id: str) -> Transcript:
        """
        Fetches the transcript for a given video ID.
        """
        try:
            api = YouTubeTranscriptApi()
            fetched_transcript = api.fetch(video_id)
            segments = [
                TranscriptSegment(
                    text=item.text,
                    start=item.start,
                    duration=item.duration
                ) for item in fetched_transcript.snippets
            ]
            full_text = " ".join([s.text for s in segments])
            return Transcript(video_id=video_id, segments=segments, full_text=full_text)
        except Exception as e:
            raise Exception(f"Failed to fetch transcript: {str(e)}")

    def extract_claims(self, transcript: Transcript) -> List[Claim]:
        """
        Extracts claims from the transcript.
        For MVP, we will use a simple heuristic: grouping segments into chunks.
        In a real implementation, this would use an LLM or specialized model.
        """
        claims = []
        # Simple heuristic: Group every 5 segments into a "claim" context
        # This is a placeholder for actual claim extraction logic
        chunk_size = 5
        segments = transcript.segments
        
        for i in range(0, len(segments), chunk_size):
            chunk = segments[i:i + chunk_size]
            text = " ".join([s.text for s in chunk])
            start_time = chunk[0].start
            end_time = chunk[-1].start + chunk[-1].duration
            
            # Basic cleaning
            text = text.replace('\n', ' ').strip()
            
            if len(text) > 20: # Filter out very short chunks
                claims.append(Claim(
                    id=f"claim_{i//chunk_size}",
                    text=text,
                    timestamp_start=start_time,
                    timestamp_end=end_time,
                    context=text # For now, context is the same as text
                ))
                
        return claims
