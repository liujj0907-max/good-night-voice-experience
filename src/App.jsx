import { useEffect, useRef, useState } from "react";
import "./App.css";

const AUDIO_SRC = "/audio/mark-session.mp3";
const FADE_DURATION_SECONDS = 30;

function App() {
  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);

  const [screen, setScreen] = useState("landing"); // landing | session | end
  const [isFading, setIsFading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  const startSession = () => {
    const audio = new Audio(AUDIO_SRC);
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
        <section className="screen landing">
          <p className="eyebrow">Voice UX Prototype</p>
          <h1>Good Night</h1>
          <p className="subtitle">A voice experience for letting go before sleep.</p>
          <p className="description">
            For nights when your mind keeps moving.
          </p>
          <button className="primary-button" onClick={startSession}>
            Start with Mark
          </button>
        </section>
      )}

      {screen === "session" && (
        <section className="screen session">
          <div className="breathing-dot" />
          <h1>Mark is here.</h1>
          <p className="subtitle">No need to reply.</p>
          <p className="description">Just listen for a while.</p>

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