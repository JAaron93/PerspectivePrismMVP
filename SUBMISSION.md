# Kaggle AI Agents Capstone Submission

## Title

Perspective Prism: Multi-Lens Truth Analysis Agent

## Subtitle

An AI agent that fights misinformation by analyzing YouTube videos through scientific, journalistic, and partisan lenses to build a comprehensive "Truth Profile."

## Track Selection

Agents for Good

## Project Description

**The Problem**
In the age of algorithmic feeds, users are often trapped in filter bubbles where they only encounter information that reinforces their existing beliefs. Misinformation spreads rapidly on video platforms like YouTube, where verifying claims requires significant effort (cross-referencing sources, checking scientific consensus, etc.). Most users simply don't have the time or expertise to fact-check every video they watch.

**The Solution**
Perspective Prism is an AI agent that acts as an automated, multi-perspective fact-checker. Instead of just labeling content as "True" or "False," it analyzes claims through specific ideological and epistemological lenses:

1.  **Scientific Lens**: Evaluates claims against peer-reviewed consensus and empirical evidence.
2.  **Journalistic Lens**: Checks against reporting from major credible news outlets.
3.  **Partisan Lenses (Left/Right)**: Identifies how the same claim is framed by different political spectrums.

**How It Works**
The agent operates as a pipeline of specialized sub-agents:

1.  **Claim Extractor**: Uses an LLM to parse YouTube transcripts and identify distinct, verifiable claims, filtering out noise.
2.  **Evidence Retriever**: Dynamically queries the Google Custom Search API to find external evidence relevant to each claim and perspective.
3.  **Analysis Engine**: Synthesizes the claim and retrieved evidence to determine support/refutation and detects bias/deception techniques (e.g., logical fallacies, emotional manipulation).
4.  **Truth Profiler**: Aggregates these insights into a user-friendly "Truth Profile" that highlights where the video aligns with or diverges from established facts.

**Key Features**

- **Multi-Agent Architecture**: Orchestrates specialized tasks (extraction, retrieval, analysis) for higher accuracy.
- **Tool Use**: Integrates YouTube Transcript API and Google Search API to ground analysis in real-world data.
- **Bias Detection**: Goes beyond fact-checking to identify _how_ the user is being manipulated.
- **Gemini Powered**: Leverages Google's Gemini models for high-speed, long-context reasoning (Bonus).

**Value**
Perspective Prism empowers users to break out of their echo chambers. By presenting a nuanced view of how different groups perceive the same information, it fosters critical thinking and media literacy, making it a perfect fit for the "Agents for Good" track.

## Video

[Placeholder for YouTube Video URL]
