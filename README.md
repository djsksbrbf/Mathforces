# Mathforces

Mathforces is an assessment system which models interactions between users and problems in an Elo-style rating system.

## Core Idea
Most mathematical quiz games contain a fixed difficulty assigned by the author. 
However, difficulty is relative towards everyone. Mathforces models problems with
ratings and can update those ratings based on performances.

## Model
- Users and problems start with equal ratings
- After each attempt:
  - Solving increases user rating, decreases problem rating
  - Failing decreases user rating, increases problem rating
- Based on an Elo-style rating system

## Why This Is Interesting
Most quizzes assume difficulty.
Mathforces treats difficulty as something to be learned from data.

## Design Choices
- Elo-style model for simplicity and transparency
- No backend or authentication (focus on modeling)
- Minimal UI to expose rating behavior

## Limitations
- Cold-start problems have little signal
- No topic tagging yet
- Elo assumes a single skill dimension

## Future Work
- Problem submission
- Rating persistence
- Transition to IRT-style models
