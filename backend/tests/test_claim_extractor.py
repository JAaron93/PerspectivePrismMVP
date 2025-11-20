import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.claim_extractor import ClaimExtractor

def test_extraction():
    extractor = ClaimExtractor()
    # Using a TED talk or similar stable video with transcript
    # "The danger of a single story | Chimamanda Ngozi Adichie"
    video_url = "https://www.youtube.com/watch?v=D9Ihs241zeg" 
    
    print(f"Testing with URL: {video_url}")
    
    try:
        video_id = extractor.extract_video_id(video_url)
        print(f"Extracted Video ID: {video_id}")
        
        transcript = extractor.get_transcript(video_id)
        print(f"Fetched Transcript with {len(transcript.segments)} segments")
        print(f"Full text length: {len(transcript.full_text)} chars")
        
        claims = extractor.extract_claims(transcript)
        print(f"Extracted {len(claims)} claims (chunks)")
        
        if claims:
            print("\nSample Claim 1:")
            print(f"Text: {claims[0].text}")
            print(f"Time: {claims[0].timestamp_start} - {claims[0].timestamp_end}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_extraction()
