# Humlab Voice Agent Cases

Two voice UX prototypes exploring when AI should speak less: a bedtime disengagement companion and a pause-aware interview facilitator.

![Project preview](docs/share-preview.png)

[Watch the short demo video](docs/good-night-demo.webm)

This repository holds two voice agent case studies built as live prototypes:

- `Good Night` — a voice experience for letting go before sleep
- `Interview Facilitator` — a pause-aware voice agent for thinking-in-progress before an interview

Both cases explore a similar question from opposite directions: not how AI can say more, but how voice agents can shape rhythm, attention, and the structure of interaction.

## Why These Two Cases Together

These two projects belong together because they test the same design question under opposite conditions.

- `Good Night` asks how a voice agent can help a person leave interaction.
- `Interview Facilitator` asks how a voice agent can stay present without taking over unfinished thinking.

One case is about withdrawal. The other is about restraint.

Together they make a broader argument: voice UX is not only about what an AI says. It is also about timing, silence, pacing, and whether the system knows when to reduce itself.

## Cases

### Good Night

Good Night is a time-based Voice UX prototype exploring how a voice experience can help someone disengage from their phone before sleep.

It is not designed as a general-purpose chatbot. The interaction is intentionally quiet: one tap to begin, a low-stimulation screen, a short voice presence, and a gradual fade toward silence.

Core idea:

- Many bedtime products add more content, more prompts, and more engagement.
- Good Night tests the opposite direction.
- The design question is not only what the AI should say, but when the AI is no longer needed to speak.

Session arc:

`Arrival -> Unloading -> Slowing -> Fading -> Exit`

Current implementation:

- Persona selection for Mark, Alice, and Marian
- Recorded voice demos
- Public English ElevenLabs Agent link
- Final 30-second audio fade
- Case notes panel describing design intent

Prompt and voice notes for Good Night live testing are in [docs/elevenlabs-good-night-agent.md](docs/elevenlabs-good-night-agent.md).

### Interview Facilitator

Interview Facilitator is a pause-aware voice agent prototype for interview preparation.

It is not meant to be a fast answer engine or an AI interviewer that takes over the conversation. Its role is to help the user think through an interview direction while they are still forming what they want to learn.

Core idea:

- Treat hesitation, restarts, and silence as part of thinking.
- Avoid closing uncertainty too early with structure.
- Use short, non-leading questions to help the user name what the interview is really trying to understand.

Interaction arc:

`Warm-up -> Goal -> Recent Example -> Probe -> Synthesis`

Current implementation:

- A dedicated `Interview Facilitator Lab` page
- Session brief input for defining the interview topic
- Draft question-direction output
- Local-only Live Realtime facilitator mode with a separate prompt path from Good Night

## Public Site

The static portfolio version of this repo is designed to be published on GitHub Pages:

[https://resonantravine.github.io/good-night-voice-experience/](https://resonantravine.github.io/good-night-voice-experience/)

The public site is meant to showcase the two cases, their structure, the Chinese recorded Good Night demo, and the English ElevenLabs Agent path.

The English Good Night mode opens the published ElevenLabs Agent:

[Talk to Good Night](https://elevenlabs.io/app/talk-to?agent_id=agent_2501krfhz1k1fnbaygh21mamqec9&branch_id=agtbrch_4001krfhz2mgfcs8kxd50dzdds0z)

The Interview Facilitator live mode remains local-only because it depends on a small local server and private API credentials.

## Live Agent Setup

This repo uses a small local server in [server.mjs](server.mjs) so private API keys stay outside the browser.

Create a local env file:

```bash
cp .env.example .env.local
```

Then set:

```bash
OPENAI_API_KEY=sk-your-api-key-here
REALTIME_VOICE=cedar
```

This file is ignored by git.

Good Night uses two language paths:

- English: published ElevenLabs Conversational Agent link
- 中文: recorded demo playback

The suggested ElevenLabs Agent prompt is in [docs/elevenlabs-good-night-agent.md](docs/elevenlabs-good-night-agent.md).

Interview Facilitator still uses the local OpenAI Realtime route for live testing.

## Run Locally

```bash
npm install
npm run dev
```

The local app runs at:

`http://127.0.0.1:5173/`

`npm run dev` starts the local Vite app through [server.mjs](server.mjs), including the OpenAI Realtime endpoint for the Interview Facilitator lab.

If you need to run the Realtime server through a local proxy, use:

```bash
npm run dev:proxy
```

## Build

```bash
npm run build
```

## Deploy

This repo includes a GitHub Pages workflow that builds the Vite app and publishes the static site on pushes to `main`.

If GitHub Pages has not been enabled yet for the repository, set:

- `Settings -> Pages -> Source`
- `GitHub Actions`
