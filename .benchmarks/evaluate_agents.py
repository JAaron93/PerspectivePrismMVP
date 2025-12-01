#!/usr/bin/env python3
"""
Agent Evaluation Script for Perspective Prism

This script evaluates the agent's performance on a set of test videos.
Metrics:
- Success Rate: Percentage of successful analyses
- Latency: Time taken for extraction and analysis
- Output Quality: Basic validation of the generated Truth Profile
"""

import asyncio
import os
import statistics
import sys
import time
from typing import Dict, List

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.models.schemas import PerspectiveType
from app.services.analysis_service import AnalysisService
from app.services.claim_extractor import ClaimExtractor
from app.services.evidence_retriever import EvidenceRetriever

# Test URLs (public domain or permissive videos)
TEST_VIDEOS = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",  # Rick Astley - Never Gonna Give You Up (music, no claims)
    # Add more test videos here
]

class AgentEvaluator:
    def __init__(self):
        self.claim_extractor = ClaimExtractor()
        self.evidence_retriever = EvidenceRetriever()
        self.analysis_service = AnalysisService()
        
    async def evaluate_single_video(self, url: str) -> Dict:
        """Evaluate a single video and return metrics."""
        result = {
            "url": url,
            "success": False,
            "extraction_time": 0.0,
            "analysis_time": 0.0,
            "total_time": 0.0,
            "claims_count": 0,
            "error": None
        }
        
        start_time = time.time()
        
        try:
            # 1. Extract Video ID and Transcript
            video_id = self.claim_extractor.extract_video_id(url)
            transcript = self.claim_extractor.get_transcript(video_id)
            
            # 2. Extract Claims
            extraction_start = time.time()
            claims = await self.claim_extractor.extract_claims(transcript)
            result["extraction_time"] = time.time() - extraction_start
            result["claims_count"] = len(claims)
            
            # 3. Analyze first claim (to test the pipeline)
            if claims:
                analysis_start = time.time()
                perspectives = [PerspectiveType.SCIENTIFIC, PerspectiveType.JOURNALISTIC]
                evidence_results = await self.evidence_retriever.retrieve_evidence(claims[0], perspectives)
                
                # Analyze one perspective
                await self.analysis_service.analyze_perspective(
                    claims[0], 
                    PerspectiveType.SCIENTIFIC,
                    evidence_results.get(PerspectiveType.SCIENTIFIC, [])
                )
                result["analysis_time"] = time.time() - analysis_start
            
            result["total_time"] = time.time() - start_time
            result["success"] = True
            
        except Exception as e:
            result["error"] = str(e)
            result["total_time"] = time.time() - start_time
            
        return result
    
    async def run_evaluation(self) -> Dict:
        """Run evaluation on all test videos."""
        print("=" * 60)
        print("PERSPECTIVE PRISM - AGENT EVALUATION")
        print("=" * 60)
        print(f"Testing {len(TEST_VIDEOS)} video(s)...\n")
        
        results = []
        for i, url in enumerate(TEST_VIDEOS, 1):
            print(f"[{i}/{len(TEST_VIDEOS)}] Testing: {url}")
            result = await self.evaluate_single_video(url)
            results.append(result)
            
            if result["success"]:
                print(f"  ✓ Success | Claims: {result['claims_count']} | Time: {result['total_time']:.2f}s")
            else:
                print(f"  ✗ Failed | Error: {result['error']}")
            print()
        
        # Calculate metrics
        successful = [r for r in results if r["success"]]
        success_rate = len(successful) / len(results) * 100 if results else 0
        
        metrics = {
            "total_tests": len(results),
            "successful": len(successful),
            "failed": len(results) - len(successful),
            "success_rate": success_rate,
            "avg_extraction_time": statistics.mean([r["extraction_time"] for r in successful]) if successful else 0,
            "avg_analysis_time": statistics.mean([r["analysis_time"] for r in successful]) if successful else 0,
            "avg_total_time": statistics.mean([r["total_time"] for r in successful]) if successful else 0,
        }
        
        # Print summary
        print("=" * 60)
        print("EVALUATION SUMMARY")
        print("=" * 60)
        print(f"Total Tests:       {metrics['total_tests']}")
        print(f"Successful:        {metrics['successful']}")
        print(f"Failed:            {metrics['failed']}")
        print(f"Success Rate:      {metrics['success_rate']:.1f}%")
        if successful:
            print(f"\nAvg Extraction Time: {metrics['avg_extraction_time']:.2f}s")
            print(f"Avg Analysis Time:   {metrics['avg_analysis_time']:.2f}s")
            print(f"Avg Total Time:      {metrics['avg_total_time']:.2f}s")
        print("=" * 60)
        
        return metrics

async def main():
    evaluator = AgentEvaluator()
    await evaluator.run_evaluation()

if __name__ == "__main__":
    asyncio.run(main())
