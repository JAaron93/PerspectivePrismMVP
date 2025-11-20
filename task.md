# Task List: Perspective Prism MVP

## Backend Development
- [ ] **Core Infrastructure** <!-- id: 0 -->
    - [x] Configure environment variables (OpenAI, Search API) <!-- id: 1 -->
    - [x] Define Pydantic models for Request/Response (Video, Transcript, Claim, TruthProfile) <!-- id: 2 -->
- [ ] **Claim Extraction Service** <!-- id: 3 -->
    - [x] Implement YouTube transcript fetching (youtube-transcript-api) <!-- id: 22 -->
    - [x] Implement basic text splitting/regex extraction <!-- id: 4 -->
    - [x] Test extraction on sample transcript <!-- id: 5 -->
- [ ] **Evidence Retrieval Service** <!-- id: 6 -->
    - [x] Implement search client (Google Custom Search) <!-- id: 7 -->
    - [x] Implement perspective-based query formatting <!-- id: 8 -->
- [ ] **Analysis Service (LLM)** <!-- id: 9 -->
    - [x] Implement perspective evaluation prompt <!-- id: 10 -->
    - [x] Implement bias/deception detection prompt <!-- id: 11 -->
- [ ] **API Integration** <!-- id: 12 -->
    - [x] Create `/analyze` endpoint <!-- id: 13 -->
    - [x] Integrate all services into the pipeline <!-- id: 14 -->

## Frontend Development
- [x] **Basic UI** <!-- id: 15 -->
    - [x] Create input form (YouTube URL) <!-- id: 16 -->
    - [x] Create results display (Truth Profile) <!-- id: 17 -->
    - [x] Connect to Backend API <!-- id: 18 -->

## Verification
- [ ] **End-to-End Testing** <!-- id: 19 -->
    - [ ] Verify full flow with a sample video <!-- id: 20 -->
    - [ ] Refine prompts based on output <!-- id: 21 -->
