"use client";

import { useEffect, useRef, useState } from "react";

type Idea = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  // Filled by AI organization (optional, so old saved ideas still work)
  problem?: string;
  solution?: string;
  audience?: string;
  category?: string;
  nextSteps?: string[];
};

type Draft = {
  title: string;
  description: string;
  problem: string;
  solution: string;
  audience: string;
  category: string;
  nextStepsText: string;
};

type SpeechRecognitionResultLike = {
  readonly isFinal: boolean;
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

  // Voice
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [language, setLanguage] = useState("en-IN");
  const [interim, setInterim] = useState("");

  // AI organization
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [aiError, setAiError] = useState("");

  // Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  // Load saved ideas when the app opens
  useEffect(() => {
    const loadIdeas = () => {
      try {
        const saved = localStorage.getItem("ideavault-ideas");
        if (saved) {
          setIdeas(JSON.parse(saved));
        }
      } catch {
        console.error("Could not load saved ideas");
      }
      setLoaded(true);
    };

    queueMicrotask(loadIdeas);
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

  async function organizeAndSave() {
    if (!description.trim() || isOrganizing) return;

    // Stop the microphone if it is still recording
    recognitionRef.current?.stop();

    setIsOrganizing(true);
    setAiError("");

    // Stop waiting if the AI takes too long
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45000);

    try {
      const res = await fetch("/api/organize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: description.trim() }),
        signal: controller.signal,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Request failed");
      }

      const newIdea: Idea = {
        id: crypto.randomUUID(),
        title: data.title || description.trim().slice(0, 55),
        description: description.trim(),
        problem: data.problem,
        solution: data.solution,
        audience: data.audience,
        category: data.category,
        nextSteps: Array.isArray(data.nextSteps) ? data.nextSteps : [],
        createdAt: new Date().toISOString(),
      };

      setIdeas((previous) => [newIdea, ...previous]);
      setDescription("");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setAiError("The AI is taking too long. Please try again, or use Save Idea.");
      } else {
        setAiError(
          err instanceof Error ? err.message : "Something went wrong. Please try again."
        );
      }
    } finally {
      clearTimeout(timer);
      setIsOrganizing(false);
    }
  }

  function deleteIdea(id: string) {
    setIdeas((previous) => previous.filter((idea) => idea.id !== id));
    if (editingId === id) {
      cancelEdit();
    }
  }

  function startEdit(idea: Idea) {
    setEditingId(idea.id);
    setDraft({
      title: idea.title,
      description: idea.description,
      problem: idea.problem ?? "",
      solution: idea.solution ?? "",
      audience: idea.audience ?? "",
      category: idea.category ?? "",
      nextStepsText: (idea.nextSteps ?? []).join("\n"),
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
  }

  function updateDraft(field: keyof Draft, value: string) {
    setDraft((previous) => (previous ? { ...previous, [field]: value } : previous));
  }

  function saveEdit() {
    if (!editingId || !draft) return;
    if (!draft.title.trim() || !draft.description.trim()) return;

    const nextSteps = draft.nextStepsText
      .split("\n")
      .map((step) => step.trim())
      .filter(Boolean);

    setIdeas((previous) =>
      previous.map((idea) =>
        idea.id === editingId
          ? {
              ...idea,
              title: draft.title.trim(),
              description: draft.description.trim(),
              problem: draft.problem.trim() || undefined,
              solution: draft.solution.trim() || undefined,
              audience: draft.audience.trim() || undefined,
              category: draft.category.trim() || undefined,
              nextSteps: nextSteps.length > 0 ? nextSteps : undefined,
            }
          : idea
      )
    );

    cancelEdit();
  }

  const filteredIdeas = ideas.filter((idea) =>
    [
      idea.title,
      idea.description,
      idea.problem,
      idea.solution,
      idea.audience,
      idea.category,
    ]
      .filter(Boolean)
      .join(" ")
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
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript + " ";
        } else {
          interimText += result[0].transcript;
        }
      }

      setInterim(interimText);

      if (finalText.trim()) {
        setDescription((previous) =>
          previous.trim()
            ? `${previous.trim()} ${finalText.trim()}`
            : finalText.trim()
        );
      }
    };

    recognition.onerror = (event) => {
      const messages: Record<string, string> = {
        "not-allowed":
          "Microphone permission denied. Please allow microphone access in browser settings.",
        "service-not-allowed":
          "Speech service is blocked. Use Chrome or Edge on localhost or HTTPS.",
        "no-speech": "No speech detected. Please try again and speak clearly.",
        "audio-capture": "No microphone found. Please check your microphone.",
        network: "Network error. Speech recognition needs an internet connection.",
      };

      if (event.error !== "aborted") {
        setSpeechError(
          messages[event.error] ?? `Speech recognition error: ${event.error}`
        );
      }

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterim("");
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

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100";

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
              Have a random thought? Type it or speak it, then save it here.
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
                onClick={isListening ? stopVoiceCapture : startVoiceCapture}
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

              {interim && (
                <p className="w-full text-sm italic text-slate-500">{interim}</p>
              )}

              {speechError && (
                <p role="alert" className="w-full text-sm text-red-500">
                  {speechError}
                </p>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Tip: use ✨ Organize with AI to turn a raw thought into a structured idea.
              </span>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={organizeAndSave}
                  disabled={!description.trim() || isOrganizing}
                  className="rounded-xl bg-violet-100 px-6 py-3 font-semibold text-violet-700 transition hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isOrganizing ? "Organizing..." : "✨ Organize with AI"}
                </button>

                <button
                  type="submit"
                  disabled={!description.trim() || isOrganizing}
                  className="rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  + Save Idea
                </button>
              </div>

              {aiError && (
                <p role="alert" className="w-full text-sm text-red-500">
                  {aiError}
                </p>
              )}
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
              {filteredIdeas.map((idea) =>
                editingId === idea.id && draft ? (
                  /* Edit mode */
                  <article
                    key={idea.id}
                    className="rounded-2xl border border-violet-300 bg-white p-6 shadow-sm"
                  >
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-500">
                          Title
                        </label>
                        <input
                          value={draft.title}
                          onChange={(e) => updateDraft("title", e.target.value)}
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-500">
                          Description
                        </label>
                        <textarea
                          value={draft.description}
                          onChange={(e) => updateDraft("description", e.target.value)}
                          rows={4}
                          className={`${inputClass} resize-none`}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-500">
                          Problem
                        </label>
                        <textarea
                          value={draft.problem}
                          onChange={(e) => updateDraft("problem", e.target.value)}
                          rows={2}
                          className={`${inputClass} resize-none`}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-500">
                          Solution
                        </label>
                        <textarea
                          value={draft.solution}
                          onChange={(e) => updateDraft("solution", e.target.value)}
                          rows={2}
                          className={`${inputClass} resize-none`}
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-500">
                            Target audience
                          </label>
                          <input
                            value={draft.audience}
                            onChange={(e) => updateDraft("audience", e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-500">
                            Category
                          </label>
                          <input
                            value={draft.category}
                            onChange={(e) => updateDraft("category", e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-500">
                          Next steps (one per line)
                        </label>
                        <textarea
                          value={draft.nextStepsText}
                          onChange={(e) => updateDraft("nextStepsText", e.target.value)}
                          rows={3}
                          className={`${inputClass} resize-none`}
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={saveEdit}
                        disabled={!draft.title.trim() || !draft.description.trim()}
                        className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Save changes
                      </button>
                    </div>
                  </article>
                ) : (
                  /* View mode */
                  <article
                    key={idea.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                        {idea.category || "Quick Idea"}
                      </span>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => startEdit(idea)}
                          className="text-sm text-slate-400 hover:text-violet-600"
                          aria-label="Edit idea"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteIdea(idea.id)}
                          className="text-sm text-slate-400 hover:text-red-500"
                          aria-label="Delete idea"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <h3 className="mb-2 text-lg font-bold">{idea.title}</h3>

                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-500">
                      {idea.description}
                    </p>

                    {(idea.problem ||
                      idea.solution ||
                      idea.audience ||
                      (idea.nextSteps && idea.nextSteps.length > 0)) && (
                      <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
                        {idea.problem && (
                          <p>
                            <span className="font-semibold text-slate-800">Problem: </span>
                            {idea.problem}
                          </p>
                        )}
                        {idea.solution && (
                          <p>
                            <span className="font-semibold text-slate-800">Solution: </span>
                            {idea.solution}
                          </p>
                        )}
                        {idea.audience && (
                          <p>
                            <span className="font-semibold text-slate-800">Audience: </span>
                            {idea.audience}
                          </p>
                        )}
                        {idea.nextSteps && idea.nextSteps.length > 0 && (
                          <div>
                            <p className="font-semibold text-slate-800">Next steps:</p>
                            <ul className="mt-1 list-disc space-y-1 pl-5">
                              {idea.nextSteps.map((step, index) => (
                                <li key={index}>{step}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    <p className="mt-5 text-xs text-slate-400">
                      {new Date(idea.createdAt).toLocaleString()}
                    </p>
                  </article>
                )
              )}
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