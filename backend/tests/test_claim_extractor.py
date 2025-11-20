from app.services.claim_extractor import ClaimExtractor

def test_extraction():
    extractor = ClaimExtractor()
    video_url = "https://www.youtube.com/watch?v=D9Ihs241zeg"
    
    video_id = extractor.extract_video_id(video_url)
    assert video_id, "Video ID extraction failed"
    
    transcript = extractor.get_transcript(video_id)
    assert transcript is not None, "Transcript retrieval failed"
    assert len(transcript.segments) > 0, "Transcript should have segments"
    assert len(transcript.full_text) > 0, "Transcript text should not be empty"
    
    claims = extractor.extract_claims(transcript)
    assert isinstance(claims, list), "Claims should be a list"
    assert len(claims) > 0, "Should extract at least one claim"
    
    # Validate first claim structure
    first_claim = claims[0]
    assert hasattr(first_claim, "text"), "Claim should have text attribute"
    assert first_claim.text, "Claim text should not be empty"

if __name__ == "__main__":
    test_extraction()
