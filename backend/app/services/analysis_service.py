from openai import AsyncOpenAI
from typing import List, Dict
import json
from app.core.config import settings
from app.models.schemas import Claim, Evidence, PerspectiveType, PerspectiveAnalysis, BiasAnalysis

class AnalysisService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = "gpt-3.5-turbo" # Or gpt-4o if available/preferred

    async def analyze_perspective(self, claim: Claim, perspective: PerspectiveType, evidence_list: List[Evidence]) -> PerspectiveAnalysis:
        """
        Analyzes a claim from a specific perspective using the retrieved evidence.
        """
        if not evidence_list:
            return PerspectiveAnalysis(
                perspective=perspective,
                stance="Unknown",
                confidence=0.0,
                explanation="No evidence found from this perspective.",
                evidence=[]
            )

        evidence_text = "\n".join([f"- [{e.source}] {e.title}: {e.snippet}" for e in evidence_list])
        
        prompt = f"""
        You are an objective analyst. 
        Claim: "{claim.text}"
        
        Evidence from {perspective.value} sources:
        {evidence_text}
        
        Based ONLY on the provided evidence, does this perspective SUPPORT, REFUTE, or is it AMBIGUOUS regarding the claim?
        Provide a confidence score (0.0 to 1.0) and a brief explanation.
        
        Output JSON format:
        {{
            "stance": "Support" | "Refute" | "Ambiguous",
            "confidence": float,
            "explanation": "string"
        }}
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            result = json.loads(content)
            
            return PerspectiveAnalysis(
                perspective=perspective,
                stance=result.get("stance", "Ambiguous"),
                confidence=result.get("confidence", 0.0),
                explanation=result.get("explanation", "Failed to parse explanation."),
                evidence=evidence_list
            )
            
        except Exception as e:
            print(f"Error in perspective analysis: {e}")
            return PerspectiveAnalysis(
                perspective=perspective,
                stance="Error",
                confidence=0.0,
                explanation=f"Analysis failed: {str(e)}",
                evidence=evidence_list
            )

    async def analyze_bias_and_deception(self, claim: Claim) -> BiasAnalysis:
        """
        Analyzes the claim text for bias and potential deception.
        """
        prompt = f"""
        Analyze the following text for bias and potential deception.
        Text: "{claim.text}"
        Context: "{claim.context or ''}"
        
        Evaluate:
        1. Framing Bias (loaded language, emotional appeals)
        2. Sourcing Bias (if sources are mentioned)
        3. Omission Bias (cherry-picking)
        4. Sensationalism (clickbait style)
        5. Deception Rating (0-10, where 10 is highly deceptive/intentional lie)
        
        Output JSON format:
        {{
            "framing_bias": "string or null",
            "sourcing_bias": "string or null",
            "omission_bias": "string or null",
            "sensationalism": "string or null",
            "deception_rating": float,
            "deception_rationale": "string"
        }}
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            result = json.loads(content)
            
            return BiasAnalysis(
                framing_bias=result.get("framing_bias"),
                sourcing_bias=result.get("sourcing_bias"),
                omission_bias=result.get("omission_bias"),
                sensationalism=result.get("sensationalism"),
                deception_rating=result.get("deception_rating", 0.0),
                deception_rationale=result.get("deception_rationale", "No rationale provided.")
            )
            
        except Exception as e:
            print(f"Error in bias analysis: {e}")
            return BiasAnalysis(
                deception_rating=0.0,
                deception_rationale=f"Analysis failed: {str(e)}"
            )
