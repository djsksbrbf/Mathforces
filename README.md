# Mathforces

Mathforces is an assessment system which models interactions between users and problems in an Elo-style rating system.

## Core Idea
Most mathematical quiz games contain a fixed difficulty assigned by the author. 
However, difficulty is relative towards everyone. Mathforces models problems with
ratings and can update those ratings based on performances.

## Model
Users and problems start with equal ratings
After each attempt:
  - Solving increases user rating, decreases problem rating
  - Failing decreases user rating, increases problem rating
Based on an Elo-style rating system

## Flow
- Users attempt a problem
- User and problem have an original rating
- User's rating increases or decreases
- Problem's rating changes in the opposite direction
- Over time, the system learns which problems are genuinely difficult

## Future Work
- Persisting ratings across sessions
- Sampling problems closer to users' ratings in the random choice
- Allowing users to target problems with certain tags
- Supporting proof-based problems

## Running the project 
- Open 'index.html' in a browser
- No server or build step required
