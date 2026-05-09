import { useEffect, useRef, useState } from "react";
import "./App.css";

const FADE_DURATION_SECONDS = 30;
const PHASES = ["Arrival", "Unloading", "Slowing", "Fading", "Exit"];
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

function App() {
  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);

  const [screen, setScreen] = useState("landing"); // landing | session | end
  const [showCaseNotes, setShowCaseNotes] = useState(false);
  const [selectedPersonaId, setSelectedPersonaId] = useState("mark");
  const [isFading, setIsFading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

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

  const endSession = () => {
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
          <p className="description">
            For nights when your mind keeps moving.
          </p>
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
            Start with {selectedPersona.name}
          </button>
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
              {PHASES.map((phase) => (
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

      {screen === "session" && (
        <section className="screen session">
          <div className="breathing-dot" />
          <h1>{selectedPersona.name} is here.</h1>
          <p className="subtitle">{selectedPersona.sessionLine}</p>
          <p className="description">{selectedPersona.sessionDescription}</p>

          {timeLeft && <p className="time-left">{formatTime(timeLeft)}</p>}

          {isFading && (
            <p className="fade-note">
              The voice is becoming quieter now.
            </p>
          )}

          <button className="secondary-button" onClick={endSession}>
            Good Night
          </button>
        </section>
      )}

      {screen === "end" && (
        <section className="screen end">
          <h1>Good night.</h1>
          <p className="subtitle">
            The session has ended.
          </p>
          <p className="description">
            You can put the phone away.
          </p>
        </section>
      )}
    </main>
  );
}

export default App;
