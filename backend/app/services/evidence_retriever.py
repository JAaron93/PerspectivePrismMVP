import httpx
from typing import List, Dict
from app.core.config import settings
from app.models.schemas import Claim, Evidence, PerspectiveType

class EvidenceRetriever:
    def __init__(self):
        self.api_key = settings.GOOGLE_API_KEY
        self.cse_id = settings.GOOGLE_CSE_ID
        self.base_url = "https://www.googleapis.com/customsearch/v1"
        
        # Pre-defined domains for perspectives (MVP list)
        self.perspective_domains = {
            PerspectiveType.SCIENTIFIC: [
                "nature.com", "science.org", "nih.gov", "cdc.gov", "who.int", 
                "scientificamerican.com", "phys.org"
            ],
            PerspectiveType.JOURNALISTIC: [
                "reuters.com", "apnews.com", "bbc.com", "npr.org", "pbs.org",
                "nytimes.com", "wsj.com", "washingtonpost.com", "bloomberg.com"
            ],
            PerspectiveType.PARTISAN_LEFT: [
                "msnbc.com", "huffpost.com", "motherjones.com", "democracynow.org",
                "theintercept.com", "jacobin.com", "vox.com"
            ],
            PerspectiveType.PARTISAN_RIGHT: [
                "foxnews.com", "nypost.com", "breitbart.com", "dailywire.com",
                "washingtontimes.com", "newsmax.com", "nationalreview.com"
            ]
        }

    async def search_google(self, query: str, perspective: PerspectiveType) -> List[Evidence]:
        """
        Searches Google for the query, filtered by the perspective's domains.
        """
        if not self.api_key or not self.cse_id:
            print("Warning: Google API Key or CSE ID not set. Returning empty evidence.")
            return []

        # Construct query with site filters
        domains = self.perspective_domains.get(perspective, [])
        if not domains:
            return []
            
        # Google Search has a limit on query length, so we might need to batch or pick top domains
        # For MVP, we'll take the first 5 domains to keep the query short enough
        site_filter = " OR ".join([f"site:{d}" for d in domains[:5]])
        full_query = f"{query} ({site_filter})"
        
        params = {
            "key": self.api_key,
            "cx": self.cse_id,
            "q": full_query,
            "num": 3 # Number of results to return per perspective
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()
                data = response.json()
                
                items = data.get("items", [])
                evidence_list = []
                
                for item in items:
                    evidence_list.append(Evidence(
                        url=item.get("link", ""),
                        title=item.get("title", ""),
                        snippet=item.get("snippet", ""),
                        source=item.get("displayLink", ""),
                        perspective=perspective
                    ))
                    
                return evidence_list
                
        except Exception as e:
            print(f"Error searching Google for {perspective}: {e}")
            return []

    async def retrieve_evidence(self, claim: Claim, perspectives: List[PerspectiveType]) -> Dict[PerspectiveType, List[Evidence]]:
        """
        Retrieves evidence for a claim across multiple perspectives.
        """
        results = {}
        # Use the claim text as the query. 
        # In a real app, we might want to summarize or extract keywords from the claim text first.
        query = claim.text
        
        # Truncate query if too long (Google limit is around 2048 chars, but practical limit is lower)
        if len(query) > 100:
            query = query[:100]
            
        for perspective in perspectives:
            evidence = await self.search_google(query, perspective)
            results[perspective] = evidence
            
        return results
