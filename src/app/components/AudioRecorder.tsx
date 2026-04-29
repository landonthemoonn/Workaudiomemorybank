import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square, Play, Pause, Trash2, Save } from 'lucide-react';
import { formatDuration } from '../utils/aiProcessing';

interface Props {
  onSave: (blob: Blob, durationSeconds: number) => void;
}

type RecorderState = 'idle' | 'requesting' | 'recording' | 'paused' | 'preview';

export default function AudioRecorder({ onSave }: Props) {
  const [state, setState] = useState<RecorderState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopTimer();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function startTimer() {
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  async function startRecording() {
    setError('');
    setState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        blobRef.current = blob;
        const url = URL.createObjectURL(blob);
        if (audioRef.current) audioRef.current.src = url;
        setState('preview');
      };

      recorder.start(250);
      setElapsed(0);
      setState('recording');
      startTimer();
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access and try again.');
      setState('idle');
    }
  }

  function stopRecording() {
    stopTimer();
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  function pauseRecording() {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      stopTimer();
      setState('paused');
    }
  }

  function resumeRecording() {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      startTimer();
      setState('recording');
    }
  }

  function discard() {
    blobRef.current = null;
    chunksRef.current = [];
    setElapsed(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setState('idle');
  }

  function togglePlay() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }

  function save() {
    if (blobRef.current) {
      onSave(blobRef.current, elapsed);
    }
  }

  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            state === 'recording'
              ? 'bg-primary/20 animate-pulse'
              : 'bg-primary/10'
          }`}
        >
          <Mic className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4>Record Audio</h4>
          <p className="text-sm text-muted-foreground">Capture voice notes directly</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-destructive/10 text-destructive rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Timer display */}
      {(state === 'recording' || state === 'paused' || state === 'preview') && (
        <div className="flex items-center justify-center mb-4">
          <span
            className={`text-3xl tabular-nums ${
              state === 'recording' ? 'text-primary' : 'text-foreground/70'
            }`}
          >
            {formatDuration(elapsed)}
          </span>
          {state === 'recording' && (
            <span className="ml-3 w-2 h-2 rounded-full bg-primary animate-ping" />
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {state === 'idle' && (
          <button
            onClick={startRecording}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Mic className="w-4 h-4" />
            Start Recording
          </button>
        )}

        {state === 'requesting' && (
          <span className="text-sm text-muted-foreground animate-pulse">
            Requesting microphone…
          </span>
        )}

        {state === 'recording' && (
          <>
            <button
              onClick={pauseRecording}
              className="p-3 bg-white/60 rounded-xl hover:bg-white/80 transition-colors"
              title="Pause"
            >
              <Pause className="w-5 h-5" />
            </button>
            <button
              onClick={stopRecording}
              className="px-5 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
          </>
        )}

        {state === 'paused' && (
          <>
            <button
              onClick={resumeRecording}
              className="p-3 bg-white/60 rounded-xl hover:bg-white/80 transition-colors"
              title="Resume"
            >
              <Mic className="w-5 h-5 text-primary" />
            </button>
            <button
              onClick={stopRecording}
              className="px-5 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              Stop & Preview
            </button>
          </>
        )}

        {state === 'preview' && (
          <>
            <button
              onClick={discard}
              className="p-3 bg-white/60 rounded-xl hover:bg-destructive/10 transition-colors"
              title="Discard"
            >
              <Trash2 className="w-5 h-5 text-destructive" />
            </button>
            <button
              onClick={togglePlay}
              className="p-3 bg-white/60 rounded-xl hover:bg-white/80 transition-colors"
              title={isPlaying ? 'Pause preview' : 'Play preview'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={save}
              className="px-5 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Recording
            </button>
          </>
        )}
      </div>

      {state === 'idle' && (
        <p className="text-xs text-muted-foreground text-center mt-3">
          Requires microphone permission
        </p>
      )}

      {state === 'preview' && (
        <p className="text-xs text-muted-foreground text-center mt-3">
          Review your recording, then save to add it to your memory bank
        </p>
      )}
    </div>
  );
}
