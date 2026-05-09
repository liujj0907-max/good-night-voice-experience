import { useEffect, useRef, useState } from "react";
import "./App.css";

const FADE_DURATION_SECONDS = 30;
const GOOD_NIGHT_PHASES = ["Arrival", "Unloading", "Slowing", "Fading", "Exit"];
const FACILITATOR_PHASES = [
  "Warm-up",
  "Goal",
  "Recent Example",
  "Probe",
  "Synthesis",
];
const PERSONAS = [
  {
    id: "mark",
    name: "Mark",
    role: "Release",
    audioSrc: "/audio/mark-session.mp3",
    sessionLine: "No need to reply.",
    sessionDescription: "Just listen for a while.",
    note: "Warm, slightly distant, helps emotional residue loosen.",
    source:
      "After-hours bar worker; used to listening without keeping people awake.",
  },
  {
    id: "alice",
    name: "Alice",
    role: "Disengage",
    audioSrc: "/audio/alice.mp3",
    sessionLine: "You can stop participating now.",
    sessionDescription: "Let the words get shorter.",
    note: "Grounded and minimal, reduces the need to participate.",
    source:
      "Night-shift emergency doctor; calm, economical, and practiced at transitions.",
  },
  {
    id: "marian",
    name: "Marian",
    role: "Settle",
    audioSrc: "/audio/marian.mp3",
    sessionLine: "You can leave it here.",
    sessionDescription: "Nothing else needs to be held tonight.",
    note: "Stable, soft, almost unmoving; creates permission to stop.",
    source:
      "Elderly widow knitting at night in a small warm apartment; stillness as company.",
  },
];
const CASES = [
  { id: "good-night", label: "Good Night", eyebrow: "Voice UX Prototype" },
  {
    id: "interview-facilitator",
    label: "Interview Facilitator",
    eyebrow: "Voice Agent Lab",
  },
];
const FACILITATOR_SIGNALS = [
  "Wait through short pauses before speaking.",
  "Ask one short, non-leading question at a time.",
  "Treat hesitation and restarts as thinking, not confusion.",
  "Only summarize when the user sounds ready.",
];
const FACILITATOR_OUTPUTS = [
  "Interview goal",
  "Participant shape",
  "3-5 question directions",
];
const FACILITATOR_EXAMPLES = [
  "I want to interview people about how they unwind at night, but I don't know where the real tension is yet.",
  "I'm preparing a conversation with remote workers about focus rituals and I need help figuring out what to probe.",
];

const getErrorMessage = (errorBody) => {
  if (!errorBody) return "Could not start realtime session.";
  if (typeof errorBody.error === "string") return errorBody.error;
  if (typeof errorBody.error?.message === "string") {
    return errorBody.error.message;
  }
  if (typeof errorBody.message === "string") return errorBody.message;
  return "Could not start realtime session.";
};

function App() {
  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);
  const realtimeAudioRef = useRef(null);
  const realtimeChannelRef = useRef(null);
  const realtimePeerRef = useRef(null);
  const realtimeStreamRef = useRef(null);

  const [screen, setScreen] = useState("landing"); // landing | session | realtime | end | facilitator-lab
  const [selectedCaseId, setSelectedCaseId] = useState("good-night");
  const [showCaseNotes, setShowCaseNotes] = useState(false);
  const [selectedPersonaId, setSelectedPersonaId] = useState("mark");
  const [isFading, setIsFading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [realtimeStatus, setRealtimeStatus] = useState("idle");
  const [realtimeError, setRealtimeError] = useState("");
  const [realtimeExperience, setRealtimeExperience] = useState("good-night");
  const [realtimeReturnScreen, setRealtimeReturnScreen] = useState("landing");
  const [facilitatorGoal, setFacilitatorGoal] = useState(
    "I want to prepare an interview about how people unwind at night, but I am still figuring out what is worth asking.",
  );
  const [facilitatorOutput, setFacilitatorOutput] = useState({
    goal: "Understand what the interview is really trying to surface before locking into a guide.",
    participant: "People who have a recurring evening routine but still feel a little unsettled before sleep.",
    questions: [
      "Can you walk me through the last evening that felt especially hard to wind down from?",
      "What part of that night felt most active or unresolved?",
      "Was there a moment when you noticed yourself choosing one habit over another?",
      "What would have made that night feel easier or gentler?",
    ],
  });

  const selectedPersona =
    PERSONAS.find((persona) => persona.id === selectedPersonaId) || PERSONAS[0];

  const startSession = () => {
    const audio = new Audio(selectedPersona.audioSrc);
    audio.volume = 1;
    audioRef.current = audio;

    setScreen("session");
    setIsFading(false);

    audio.play().catch((error) => {
      console.error("Audio playback failed:", error);
    });

    audio.addEventListener("ended", endSession);
  };

  const stopRealtimeSession = () => {
    if (realtimeChannelRef.current) {
      realtimeChannelRef.current.close();
      realtimeChannelRef.current = null;
    }

    if (realtimePeerRef.current) {
      realtimePeerRef.current.close();
      realtimePeerRef.current = null;
    }

    if (realtimeStreamRef.current) {
      realtimeStreamRef.current.getTracks().forEach((track) => track.stop());
      realtimeStreamRef.current = null;
    }

    if (realtimeAudioRef.current) {
      realtimeAudioRef.current.srcObject = null;
    }

    setRealtimeStatus("idle");
  };

  const startRealtimeSession = async ({
    experience,
    requestUrl,
    returnScreen,
    initialInstructions,
    requestHeaders = {},
  }) => {
    setRealtimeExperience(experience);
    setRealtimeReturnScreen(returnScreen);
    setScreen("realtime");
    setRealtimeStatus("connecting");
    setRealtimeError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const peerConnection = new RTCPeerConnection();
      const dataChannel = peerConnection.createDataChannel("oai-events");

      realtimePeerRef.current = peerConnection;
      realtimeStreamRef.current = stream;
      realtimeChannelRef.current = dataChannel;

      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      peerConnection.ontrack = (event) => {
        if (realtimeAudioRef.current) {
          realtimeAudioRef.current.srcObject = event.streams[0];
        }
      };

      dataChannel.onopen = () => {
        setRealtimeStatus("listening");
        dataChannel.send(
          JSON.stringify({
            type: "response.create",
            response: {
              instructions: initialInstructions,
            },
          }),
        );
      };

      dataChannel.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.type === "response.audio.delta") {
          setRealtimeStatus("speaking");
        }

        if (
          message.type === "response.audio.done" ||
          message.type === "response.done"
        ) {
          setRealtimeStatus("listening");
        }

        if (message.type === "error") {
          setRealtimeStatus("error");
          setRealtimeError(message.error?.message || "Realtime session failed.");
        }
      };

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      const response = await fetch(
        requestUrl,
        {
          method: "POST",
          body: offer.sdp,
          headers: {
            "Content-Type": "application/sdp",
            ...requestHeaders,
          },
        },
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(getErrorMessage(errorBody));
      }

      const answer = {
        type: "answer",
        sdp: await response.text(),
      };

      await peerConnection.setRemoteDescription(answer);
    } catch (error) {
      stopRealtimeSession();
      setScreen(returnScreen);
      setRealtimeStatus("error");
      setRealtimeError(error.message);
    }
  };

  const startGoodNightRealtimeSession = () =>
    startRealtimeSession({
      experience: "good-night",
      requestUrl: `/api/realtime/session?persona=${selectedPersona.id}`,
      returnScreen: "landing",
      initialInstructions:
        "Begin with one very short, quiet greeting in the persona voice. Do not ask more than one simple question.",
    });

  const startFacilitatorRealtimeSession = () =>
    startRealtimeSession({
      experience: "facilitator",
      requestUrl: "/api/realtime/session?mode=facilitator",
      returnScreen: "facilitator-lab",
      requestHeaders: {
        "X-Session-Goal": facilitatorGoal,
      },
      initialInstructions:
        "Begin gently. Acknowledge that the user may still be forming their thinking. Ask one short question about what they are really trying to understand, then leave room for silence.",
    });

  const endSession = () => {
    stopRealtimeSession();

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setScreen("end");
    setIsFading(false);
    setTimeLeft(null);
  };

  const openFacilitatorLab = () => {
    setScreen("facilitator-lab");
    setShowCaseNotes(false);
    setRealtimeError("");
  };

  const returnToLanding = () => {
    stopRealtimeSession();
    setScreen("landing");
    setRealtimeError("");
  };

  const leaveRealtimeSession = () => {
    stopRealtimeSession();
    setScreen(realtimeReturnScreen);
    setRealtimeError("");
  };

  const generateFacilitatorOutput = () => {
    const normalizedGoal = facilitatorGoal.trim();

    setFacilitatorOutput({
      goal: normalizedGoal || "Clarify the interview aim before fixing a question set.",
      participant:
        "People who are close enough to the topic to describe a recent lived example, not just opinions about it.",
      questions: [
        "Can you walk me through the most recent moment that made this topic feel real?",
        "What was happening around you when that moment started to matter?",
        "Where did you hesitate, adapt, or choose something different?",
        "What would you want to understand better if you were interviewing someone about this?",
      ],
    });
  };

  useEffect(() => {
    let timer;

    if (screen === "session") {
      timer = setInterval(() => {
        const audio = audioRef.current;

        if (!audio || !audio.duration) return;

        const remaining = audio.duration - audio.currentTime;
        setTimeLeft(Math.max(0, Math.ceil(remaining)));

        if (remaining <= FADE_DURATION_SECONDS && !isFading) {
          setIsFading(true);

          fadeIntervalRef.current = setInterval(() => {
            if (!audioRef.current) return;

            const newVolume = Math.max(0, audioRef.current.volume - 0.02);
            audioRef.current.volume = newVolume;

            if (newVolume <= 0) {
              clearInterval(fadeIntervalRef.current);
              fadeIntervalRef.current = null;
            }
          }, 600);
        }
      }, 500);
    }

    return () => {
      clearInterval(timer);
    };
  }, [screen, isFading]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }

      stopRealtimeSession();
    };
  }, []);

  const formatTime = (seconds) => {
    if (seconds === null) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <main className={`app ${screen === "session" ? "app-session" : ""}`}>
      {(screen === "landing" || screen === "facilitator-lab") && (
        <div className="mode-switcher" aria-label="Choose a case">
          {CASES.map((item) => (
            <button
              aria-pressed={selectedCaseId === item.id}
              className={`mode-chip ${
                selectedCaseId === item.id ? "mode-chip-active" : ""
              }`}
              key={item.id}
              onClick={() => {
                setSelectedCaseId(item.id);
                setShowCaseNotes(false);
                setScreen(item.id === "good-night" ? "landing" : "facilitator-lab");
              }}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {screen === "landing" && (
        <button
          className="case-toggle"
          onClick={() => setShowCaseNotes((current) => !current)}
          aria-expanded={showCaseNotes}
          aria-controls="case-notes"
        >
          Case notes
        </button>
      )}

      {screen === "landing" && (
        <section className="screen landing">
          <p className="eyebrow">Voice UX Prototype</p>
          <h1>Good Night</h1>
          <p className="subtitle">A voice experience for letting go before sleep.</p>
          <p className="description">For nights when your mind keeps moving.</p>
          <div className="persona-selector" aria-label="Choose a voice persona">
            {PERSONAS.map((persona) => (
              <button
                aria-pressed={selectedPersonaId === persona.id}
                className={`persona-option ${
                  selectedPersonaId === persona.id ? "persona-option-active" : ""
                }`}
                key={persona.id}
                onClick={() => setSelectedPersonaId(persona.id)}
                type="button"
              >
                <span>{persona.name}</span>
                <small>{persona.role}</small>
              </button>
            ))}
          </div>
          <button className="primary-button" onClick={startSession}>
            Play recorded demo
          </button>
          <button
            className="secondary-button compact-button"
            onClick={startGoodNightRealtimeSession}
          >
            Talk live with {selectedPersona.name}
          </button>
          <button className="ghost-link" onClick={openFacilitatorLab} type="button">
            Open Interview Facilitator Lab
          </button>
          {realtimeError && <p className="error-note">{realtimeError}</p>}
        </section>
      )}

      {screen === "landing" && showCaseNotes && (
        <aside className="case-notes" id="case-notes">
          <div className="case-section">
            <span>North Star</span>
            <p>
              Help the user leave interaction within a bounded bedtime session,
              not make the conversation more engaging.
            </p>
          </div>

          <div className="case-section">
            <span>Design Shift</span>
            <p>Sleep support can reduce presence instead of adding more content.</p>
          </div>

          <div className="case-section">
            <span>Time Model</span>
            <ol className="phase-list" aria-label="Good Night session phases">
              {GOOD_NIGHT_PHASES.map((phase) => (
                <li key={phase}>{phase}</li>
              ))}
            </ol>
          </div>

          <div className="case-section">
            <span>Persona Strategy</span>
            <div className="persona-list">
              {PERSONAS.map((persona) => (
                <article
                  className={`persona-note ${
                    selectedPersonaId === persona.id ? "persona-note-active" : ""
                  }`}
                  key={persona.name}
                >
                  <strong>
                    {persona.name} / {persona.role}
                  </strong>
                  <p>{persona.note}</p>
                  <small>{persona.source}</small>
                </article>
              ))}
            </div>
          </div>
        </aside>
      )}

      {screen === "facilitator-lab" && (
        <section className="facilitator-layout">
          <div className="facilitator-hero">
            <p className="eyebrow">Voice Agent Lab</p>
            <h1>Interview Facilitator</h1>
            <p className="subtitle">
              A pause-aware voice agent for thinking-in-progress before an
              interview.
            </p>
            <p className="description facilitator-description">
              This lab is not about generating a question list too early. It is
              about holding rhythm while the user is still forming what the
              interview is really trying to learn.
            </p>
            <div className="phase-list" aria-label="Interview Facilitator phases">
              {FACILITATOR_PHASES.map((phase) => (
                <span className="phase-pill" key={phase}>
                  {phase}
                </span>
              ))}
            </div>
          </div>

          <div className="facilitator-grid">
            <section className="lab-panel">
              <span className="panel-label">Session brief</span>
              <h2>What are we trying to understand?</h2>
              <p>
                Start with a goal that still feels a little unfinished. The
                agent should help clarify it without collapsing uncertainty too
                soon.
              </p>
              <textarea
                className="goal-input"
                onChange={(event) => setFacilitatorGoal(event.target.value)}
                rows={7}
                value={facilitatorGoal}
              />
              <div className="example-stack">
                {FACILITATOR_EXAMPLES.map((example) => (
                  <button
                    className="example-card"
                    key={example}
                    onClick={() => setFacilitatorGoal(example)}
                    type="button"
                  >
                    {example}
                  </button>
                ))}
              </div>
              <button className="primary-button panel-button" onClick={generateFacilitatorOutput}>
                Generate question directions
              </button>
              <button
                className="secondary-button panel-button"
                onClick={startFacilitatorRealtimeSession}
              >
                Talk live with Facilitator
              </button>
              {realtimeError && screen === "facilitator-lab" && (
                <p className="error-note panel-error">{realtimeError}</p>
              )}
            </section>

            <section className="lab-panel">
              <span className="panel-label">Interaction signal</span>
              <h2>What the voice should protect</h2>
              <div className="signal-list">
                {FACILITATOR_SIGNALS.map((signal) => (
                  <article className="signal-row" key={signal}>
                    <p>{signal}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="lab-panel">
              <span className="panel-label">Draft output</span>
              <h2>Working interview direction</h2>
              <div className="output-block">
                <small>{FACILITATOR_OUTPUTS[0]}</small>
                <p>{facilitatorOutput.goal}</p>
              </div>
              <div className="output-block">
                <small>{FACILITATOR_OUTPUTS[1]}</small>
                <p>{facilitatorOutput.participant}</p>
              </div>
              <div className="output-block">
                <small>{FACILITATOR_OUTPUTS[2]}</small>
                <ul className="question-list">
                  {facilitatorOutput.questions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          <button className="secondary-button back-button" onClick={returnToLanding}>
            Back to Good Night
          </button>
        </section>
      )}

      {screen === "session" && (
        <section className="screen session">
          <div className="breathing-dot" />
          <h1>{selectedPersona.name} is here.</h1>
          <p className="subtitle">{selectedPersona.sessionLine}</p>
          <p className="description">{selectedPersona.sessionDescription}</p>

          {timeLeft && <p className="time-left">{formatTime(timeLeft)}</p>}

          {isFading && (
            <p className="fade-note">The voice is becoming quieter now.</p>
          )}

          <button className="secondary-button" onClick={endSession}>
            Good Night
          </button>
        </section>
      )}

      {screen === "realtime" && (
        <section className="screen session">
          <audio autoPlay ref={realtimeAudioRef} />
          <div className="breathing-dot" />
          <h1>
            {realtimeExperience === "facilitator"
              ? "Facilitator is listening."
              : `${selectedPersona.name} is listening.`}
          </h1>
          <p className="subtitle">
            {realtimeStatus === "connecting"
              ? "Connecting the live voice."
              : realtimeExperience === "facilitator"
                ? "Speak your interview thought as it is forming."
                : "You can speak softly now."}
          </p>
          <p className="description">
            {realtimeExperience === "facilitator"
              ? "This mode listens for thinking-in-progress and responds with short, pause-aware questions."
              : "This mode uses the microphone and responds in real time."}
          </p>

          <p className="time-left">{realtimeStatus}</p>
          {realtimeExperience === "facilitator" && (
            <p className="fade-note">
              The facilitator should wait through pauses instead of filling them too fast.
            </p>
          )}

          <button className="secondary-button" onClick={leaveRealtimeSession}>
            {realtimeExperience === "facilitator" ? "Back to Lab" : "Good Night"}
          </button>
        </section>
      )}

      {screen === "end" && (
        <section className="screen end">
          <h1>Good night.</h1>
          <p className="subtitle">The session has ended.</p>
          <p className="description">You can put the phone away.</p>
        </section>
      )}
    </main>
  );
}

export default App;
