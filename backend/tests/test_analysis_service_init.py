"""
Test to verify OpenAI API key validation in AnalysisService.

This test ensures that the AnalysisService properly validates
the OPENAI_API_KEY configuration before initializing.
"""

import pytest
from unittest.mock import patch
from app.services.analysis_service import AnalysisService


class TestAnalysisServiceInitialization:
    """Test AnalysisService initialization and validation."""
    
    def test_initialization_with_valid_api_key(self):
        """Should initialize successfully with valid API key."""
        with patch('app.services.analysis_service.settings') as mock_settings:
            mock_settings.OPENAI_API_KEY = "sk-test-valid-key-123"
            mock_settings.OPENAI_MODEL = "gpt-3.5-turbo"
            
            service = AnalysisService()
            
            assert service.client is not None
            assert service.model == "gpt-3.5-turbo"
    
    def test_initialization_with_empty_api_key(self):
        """Should raise ValueError with empty API key."""
        with patch('app.services.analysis_service.settings') as mock_settings:
            mock_settings.OPENAI_API_KEY = ""
            mock_settings.OPENAI_MODEL = "gpt-3.5-turbo"
            
            with pytest.raises(ValueError) as exc_info:
                AnalysisService()
            
            assert "OPENAI_API_KEY is not configured" in str(exc_info.value)
            assert ".env file" in str(exc_info.value)
    
    def test_initialization_with_whitespace_only_api_key(self):
        """Should raise ValueError with whitespace-only API key."""
        with patch('app.services.analysis_service.settings') as mock_settings:
            mock_settings.OPENAI_API_KEY = "   \n\t   "
            mock_settings.OPENAI_MODEL = "gpt-3.5-turbo"
            
            with pytest.raises(ValueError) as exc_info:
                AnalysisService()
            
            assert "OPENAI_API_KEY is not configured" in str(exc_info.value)
    
    def test_initialization_with_none_api_key(self):
        """Should raise ValueError with None API key."""
        with patch('app.services.analysis_service.settings') as mock_settings:
            mock_settings.OPENAI_API_KEY = None
            mock_settings.OPENAI_MODEL = "gpt-3.5-turbo"
            
            with pytest.raises(ValueError) as exc_info:
                AnalysisService()
            
            assert "OPENAI_API_KEY is not configured" in str(exc_info.value)
    
    def test_uses_custom_model_from_settings(self):
        """Should use custom model from settings when configured."""
        with patch('app.services.analysis_service.settings') as mock_settings:
            mock_settings.OPENAI_API_KEY = "sk-test-valid-key-123"
            mock_settings.OPENAI_MODEL = "gpt-4o"
            
            service = AnalysisService()
            
            assert service.model == "gpt-4o"
    
    def test_error_message_includes_example(self):
        """Error message should include helpful example."""
        with patch('app.services.analysis_service.settings') as mock_settings:
            mock_settings.OPENAI_API_KEY = ""
            mock_settings.OPENAI_MODEL = "gpt-3.5-turbo"
            
            with pytest.raises(ValueError) as exc_info:
                AnalysisService()
            
            error_message = str(exc_info.value)
            assert "Example" in error_message or "sk-" in error_message
