
"use client";

import { useEffect, useRef, useState } from "react";

type Idea = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
};

type SpeechRecognitionResultLike = {
  readonly [index: number]: {
    transcript: string;
  };
};

type SpeechRecognitionEventLike = {
  readonly resultIndex: number;
  readonly results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

export default function Home() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

const [isListening, setIsListening] = useState(false);
const [speechError, setSpeechError] = useState("");
const [language, setLanguage] = useState("en-IN");

  // Load saved ideas when the app opens
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ideavault-ideas");
      if (saved) setIdeas(JSON.parse(saved));
    } catch {
      console.error("Could not load saved ideas");
    }
    setLoaded(true);
  }, []);

  // Save ideas whenever they change
  useEffect(() => {
    if (loaded) {
      localStorage.setItem("ideavault-ideas", JSON.stringify(ideas));
    }
  }, [ideas, loaded]);

  function saveIdea(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!description.trim()) return;

    const newIdea: Idea = {
      id: crypto.randomUUID(),
      title: description.trim().split(/[.!?\n]/)[0].slice(0, 55),
      description: description.trim(),
      createdAt: new Date().toISOString(),
    };

    setIdeas((previous) => [newIdea, ...previous]);
    setDescription("");
  }

  function deleteIdea(id: string) {
    setIdeas((previous) => previous.filter((idea) => idea.id !== id));
  }

  const filteredIdeas = ideas.filter((idea) =>
    (idea.title + " " + idea.description)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function startVoiceCapture() {
  const browserWindow = window as SpeechWindow;

  const SpeechRecognitionAPI =
    browserWindow.SpeechRecognition ||
    browserWindow.webkitSpeechRecognition;

  if (!SpeechRecognitionAPI) {
    setSpeechError(
      "Speech recognition is not supported in this browser. Please use manual text input or try Chrome."
    );
    return;
  }

  setSpeechError("");

  const recognition = new SpeechRecognitionAPI();

  recognition.lang = language;
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const transcript = Array.from(
      { length: event.results.length },
      (_, index) => event.results[index][0].transcript
    ).join(" ").trim();

    if (transcript) {
      setDescription((previous) =>
        previous.trim()
          ? `${previous.trim()} ${transcript}`
          : transcript
      );
    }
  };

  recognition.onerror = (event) => {
    setSpeechError(
      event.error === "not-allowed"
        ? "Microphone permission denied. Please allow microphone access."
        : `Speech recognition error: ${event.error}`
    );

    setIsListening(false);
  };

  recognition.onend = () => {
    setIsListening(false);
    recognitionRef.current = null;
  };

  recognitionRef.current = recognition;
  setIsListening(true);

  try {
    recognition.start();
  } catch {
    setIsListening(false);
    recognitionRef.current = null;
    setSpeechError("Unable to start microphone. Please try again.");
  }
}

function stopVoiceCapture() {
  recognitionRef.current?.stop();
}

  return (
    <main className="min-h-screen bg-[#f7f7fb] text-slate-900">

      {/* Navigation */}
      <nav className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5 md:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-xl text-white">
            ✦
          </div>
          <span className="text-2xl font-bold tracking-tight">
            Idea<span className="text-violet-600">Vault</span>
          </span>
        </div>

        <span className="hidden text-sm text-slate-500 sm:block">
          Your personal space for ideas
        </span>
      </nav>

      <div className="mx-auto max-w-6xl px-5 py-12 md:px-8">

        {/* Welcome */}
        <section className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-violet-600">
            Your creative workspace
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Every great idea starts somewhere.
          </h1>
          <p className="mt-3 text-slate-500">
            Capture your thoughts before they disappear.
          </p>
        </section>

        {/* Capture idea */}
        <section className="mb-12 rounded-3xl border border-violet-100 bg-white p-6 shadow-sm md:p-9">
          <div className="mb-6">
            <h2 className="text-xl font-bold">Capture a new idea</h2>
            <p className="mt-1 text-sm text-slate-500">
              Have a random thought? Save it here.
            </p>
          </div>

          <form onSubmit={saveIdea}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="I have an idea... start writing your thoughts here."
              rows={5}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-5 text-base outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />

            <div className="mt-4 flex flex-wrap items-center gap-3">

  <button
    type="button"
    onClick={
      isListening
        ? stopVoiceCapture
        : startVoiceCapture
    }
    className={`rounded-xl px-5 py-3 font-semibold transition ${
      isListening
        ? "bg-red-500 text-white hover:bg-red-600"
        : "bg-violet-100 text-violet-700 hover:bg-violet-200"
    }`}
  >
    {isListening ? "⏹ Stop Recording" : "🎙️ Speak your idea"}
  </button>

  <select
    value={language}
    onChange={(e) => setLanguage(e.target.value)}
    disabled={isListening}
    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
  >
    <option value="en-IN">English (India)</option>
    <option value="hi-IN">Hindi</option>
  </select>

  {isListening && (
    <span className="text-sm font-medium text-red-500">
      Listening... Speak now
    </span>
  )}

  {speechError && (
    <p role="alert" className="w-full text-sm text-red-500">
      {speechError}
    </p>
  )}

</div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Voice capture is coming in the next step 🎙️
              </span>

              <button
                type="submit"
                disabled={!description.trim()}
                className="rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                + Save Idea
              </button>
            </div>
          </form>
        </section>

        {/* Ideas dashboard */}
        <section>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">My Ideas</h2>
              <p className="mt-1 text-sm text-slate-500">
                {ideas.length} ideas captured so far
              </p>
            </div>

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your ideas..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400 sm:w-64"
            />
          </div>

          {filteredIdeas.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mb-4 text-5xl">💡</div>
              <h3 className="text-lg font-semibold">
                {ideas.length === 0 ? "Your idea space is empty" : "No ideas found"}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {ideas.length === 0
                  ? "Start capturing your thoughts and they'll appear here."
                  : "Try searching with another keyword."}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {filteredIdeas.map((idea) => (
                <article
                  key={idea.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                      Quick Idea
                    </span>
                    <button
                      onClick={() => deleteIdea(idea.id)}
                      className="text-sm text-slate-400 hover:text-red-500"
                      aria-label="Delete idea"
                    >
                      Delete
                    </button>
                  </div>

                  <h3 className="mb-2 text-lg font-bold">
                    {idea.title}
                  </h3>

                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-500">
                    {idea.description}
                  </p>

                  <p className="mt-5 text-xs text-slate-400">
                    {new Date(idea.createdAt).toLocaleString()}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <footer className="border-t border-slate-200 bg-white px-6 py-6 text-center text-sm text-slate-400">
        IdeaVault © 2026 · Capture it. Organize it. Never lose it.
      </footer>
    </main>
  );
}
