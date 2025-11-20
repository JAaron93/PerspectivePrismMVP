# Perspective Prism MVP

An agent that processes articles or video transcripts, analyzes claims across multiple perspectives, detects types of bias and potential deception, and outputs a rich "truth profile" per claim.

## Project Structure

- `backend/`: FastAPI application for processing and analysis.
- `frontend/`: React + TypeScript application for the user interface.
- `implementation_plan.md`: Detailed plan for the MVP.

## Setup

### Backend

1. Navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend

1. Navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Configuration

Ensure you have a `.env` file in the root (or linked in `backend/`) with:
```
OPENAI_API_KEY=your_key_here
```
