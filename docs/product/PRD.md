# PRD — Barca Fan Platform

## Product Vision

### Core Idea
Platform where football fans prove they understand football better than others.

### Positioning
The product is not:
- a stats site
- a news site

The product is:
- a competitive fan game
- an interactive content engine for Telegram channels
- a gamified football prediction platform

### Core Loop
1. User predicts a match outcome
2. Match happens
3. User gets points
4. User compares with others
5. User shares result
6. Repeat

### Target Users
- Telegram football channels
- active fans
- "armchair experts"

## Core Features

### Match Prediction
- win / draw / lose
- exact score

### Lineup Prediction
- choose starting XI
- compare with real lineup

### Player Rating
- rate players after match from 1 to 10
- aggregate ratings over the season

### Leaderboard
- points
- ranking

### Share
- generate image
- post in Telegram

## Gamification

### Points

#### Match Result
- +10 for correct result
- +20 for exact score

#### Lineup
- +2 per correct player
- +5 for full lineup hit

#### Player Rating
- +5 if close to average (+/-1)

### Streak
- +5 bonus for 3 correct in a row
- +15 bonus for 5 in a row

### Levels
Progression system based on accumulated points and consistency.

## Fan DNA

Fan DNA is calculated from behavior patterns:
- risky: often picks unexpected outcomes
- safe: usually follows favorites
- tactical: often predicts lineups well
- emotional: chaotic prediction behavior

### Profile Output
"You are Tactical Analyst"

## Duels

### Mode
User vs user on the same match predictions.

### Comparison
- compare picks
- compare points

### Reward
- winner gets +10 bonus

## Transfers

### Predict Transfer
- player -> club
- yes / no transfer prediction

### Transfer Points
- +10 correct
- +20 for rare prediction

### Future Squad Builder
- add players
- remove players
- create "Barca 2026"

### Fan Voting
- let fans vote on transfer ideas

## Tactical Board

### MVP Scope
- football field visual
- players as draggable elements
- save lineup
- share image

### Player Object
```txt
{
  id,
  name,
  x,
  y
}
```

### Later Enhancements
- avatars instead of circles
- rating overlay

## Season System

### Rules
- total points across matches
- leaderboard resets each season

### Rewards
- top players can receive rewards later

## Genius System

### Rank Logic
- >80% accuracy -> Genius
- 50% to 80% accuracy -> Analyst
- <50% accuracy -> Armchair Expert
