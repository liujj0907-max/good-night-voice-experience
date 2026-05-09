# Good Night Voice Experience

Good Night is a small Voice UX prototype exploring how a voice experience can help someone disengage from their phone before sleep.

It is not designed as a general-purpose chatbot. The interaction is intentionally quiet: one tap to begin, a low-stimulation screen, a short voice presence, and a gradual fade toward silence.

## Concept

Many bedtime products try to add more content: longer stories, more prompts, more choices, more tracking. Good Night tests the opposite direction.

The prototype asks:

- What if the voice gradually becomes less present?
- What if the user is not asked to reply?
- What if the end of the interaction is a cue to put the phone away?

## Prototype Flow

Start with Mark -> Listen -> Voice fades -> Good Night

## Current Features

- Minimal React + Vite prototype
- One-tap start
- Mark voice session playback
- Dark, low-stimulation interface
- Breathing dot during the session
- Final 30-second audio fade
- Manual Good Night exit
- End screen encouraging phone disengagement

## Design Direction

This case focuses on voice as presence rather than instruction. The goal is to reduce interaction demand, lower visual stimulation, and make silence part of the experience.

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
