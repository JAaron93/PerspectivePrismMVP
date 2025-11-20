from unittest.mock import patch, MagicMock
from app.services.claim_extractor import ClaimExtractor
from app.models.schemas import Transcript, TranscriptSegment

def test_claim_extraction_with_mocked_youtube_transcript():
    extractor = ClaimExtractor()
    video_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    
    # Mock video ID extraction to return deterministic value
    mock_video_id = "dQw4w9WgXcQ"
    
    # Create fixed mock transcript data
    mock_segments = [
        TranscriptSegment(text="This is the first segment of the video.", start=0.0, duration=3.5),
        TranscriptSegment(text="Here we discuss an important claim about climate change.", start=3.5, duration=4.2),
        TranscriptSegment(text="The data shows a clear trend over the past decade.", start=7.7, duration=3.8),
        TranscriptSegment(text="Scientists have confirmed these findings multiple times.", start=11.5, duration=4.0),
        TranscriptSegment(text="This evidence supports the initial hypothesis.", start=15.5, duration=3.2),
        TranscriptSegment(text="Another important point to consider is the economic impact.", start=18.7, duration=4.5),
        TranscriptSegment(text="Studies indicate significant changes in various sectors.", start=23.2, duration=3.9),
    ]
    mock_full_text = " ".join([s.text for s in mock_segments])
    mock_transcript = Transcript(
        video_id=mock_video_id,
        segments=mock_segments,
        full_text=mock_full_text
    )
    
    # Mock the methods to avoid external dependencies
    with patch.object(extractor, 'extract_video_id', return_value=mock_video_id) as mock_extract_id, \
         patch.object(extractor, 'get_transcript', return_value=mock_transcript) as mock_get_transcript:
        
        # Test video ID extraction (mocked)
        video_id = extractor.extract_video_id(video_url)
        assert video_id == mock_video_id, "Video ID extraction failed"
        mock_extract_id.assert_called_once_with(video_url)
        
        # Test transcript retrieval (mocked)
        transcript = extractor.get_transcript(video_id)
        assert transcript is not None, "Transcript retrieval failed"
        assert len(transcript.segments) > 0, "Transcript should have segments"
        assert len(transcript.full_text) > 0, "Transcript text should not be empty"
        mock_get_transcript.assert_called_once_with(video_id)
        
        # Test claim extraction (actual logic, using mocked transcript)
        claims = extractor.extract_claims(transcript)
        assert isinstance(claims, list), "Claims should be a list"
        assert len(claims) > 0, "Should extract at least one claim"
        
        # Validate all claims structure
        for i, claim in enumerate(claims):
            assert hasattr(claim, "text"), f"Claim at index {i} should have text attribute"
            assert claim.text, f"Claim at index {i} should have non-empty text"
            assert claim.timestamp_start is not None, f"Claim at index {i} should have timestamp_start"
            assert claim.timestamp_end is not None, f"Claim at index {i} should have timestamp_end"

if __name__ == "__main__":
    test_claim_extraction_with_mocked_youtube_transcript()
