# Good Night Voice Experience

Good Night is a time-based Voice UX prototype exploring how a voice experience can help someone disengage from their phone before sleep.

It is not designed as a general-purpose chatbot. The interaction is intentionally quiet: one tap to begin, a low-stimulation screen, a short voice presence, and a gradual fade toward silence.

## Concept

Many bedtime products try to add more content: longer stories, more prompts, more choices, more tracking. Good Night tests the opposite direction.

The prototype asks:

- What if the voice gradually becomes less present?
- What if the user is not asked to reply?
- What if the end of the interaction is a cue to put the phone away?

## Prototype Flow

Arrival -> Unloading -> Slowing -> Fading -> Exit

The key design question is not only what the AI should say, but when the AI is no longer needed to speak.

## Persona Strategy

The broader concept uses three personas as different ways of helping the user let go:

- Mark / Release: warm, slightly distant, helps emotional residue loosen
- Alice / Disengage: grounded and minimal, reduces participation
- Marian / Settle: stable and soft, creates permission to stop

The current implementation includes playable demos for all three personas.

## Voice Temperament Sources

These backgrounds are not meant to become visible roleplay prompts inside the session. They are design sources for pacing, tone, and the amount of presence each voice should carry.

- Mark: around 35, gentle, works in a bar, and is usually awake after hours. His voice should feel like someone who can listen without pulling the user into more conversation.
- Alice: around 32, an emergency doctor who often works shifts. Her voice should feel grounded, brief, and able to help the user transition out of active participation.
- Marian: around 85, widowed for six years, living with a cat in an old but warm apartment. Her nighttime image is knitting on the sofa; her voice should create quiet permission to stop.

## Current Features

- Minimal React + Vite prototype
- Persona selection for Mark, Alice, and Marian
- Persona-specific voice session playback
- Live Realtime voice mode for Mark, Alice, and Marian
- Dark, low-stimulation interface
- Breathing dot during the session
- Final 30-second audio fade
- Manual Good Night exit
- End screen encouraging phone disengagement

## Design Direction

This case focuses on voice as presence rather than instruction. The goal is to reduce interaction demand, lower visual stimulation, and make silence part of the experience.

The strongest principle is designed withdrawal: voice, UI, and prompts gradually reduce their presence so the user can leave the interaction.

## Realtime Playground

Prompt drafts for testing Good Night with OpenAI Playground and `gpt-realtime-2` are in [docs/realtime-playground-prompts.md](docs/realtime-playground-prompts.md).

The local prototype also includes a live Realtime mode. It uses a small local server in `server.mjs` so the OpenAI API key stays outside the browser.

```bash
OPENAI_API_KEY=your_api_key npm run dev
```

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
