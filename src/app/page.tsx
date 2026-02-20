"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useInngestSubscription } from "@inngest/realtime/hooks";
import { fetchRealtimeToken } from "./actions/get-realtime-token";
import { useToasts, ToastContainer, ToastType } from "./components/ToastNotification";

// Default schemeId — user can override it in the input
const DEFAULT_SCHEME_ID = "scheme_demo_123";

type LogEntry = {
  msg: string;
  id: string;
  type: "info" | "success" | "warning";
  timestamp: string;
};

type StepEvent = {
  type: "step_start" | "step_end" | "function_complete" | "function_error";
  step?: string;
  stepIndex?: number;
  message?: string;
  error?: string;
  resultUrl?: string;
};

const STEP_LABEL_TO_INDEX: Record<string, number> = {
  "AI Analysis": 1,
  "Audio Synthesis": 2,
  "Cloud Storage Archive": 3,
};

export default function Home() {
  const [progress, setProgress] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [subscribeEnabled, setSubscribeEnabled] = useState(false);
  const [schemeId, setSchemeId] = useState(DEFAULT_SCHEME_ID);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toasts, addToast, removeToast } = useToasts();

  const workflowSteps = [
    { label: "Analysis", icon: "🧠" },
    { label: "Synthesis", icon: "🎙️" },
    { label: "Storage", icon: "☁️" },
    { label: "Done", icon: "✨" },
  ];

  // Auto-scroll console
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [progress]);

  // Recreate the token fetcher whenever schemeId changes
  const refreshToken = useCallback(
    () => fetchRealtimeToken(schemeId),
    [schemeId]
  );

  // ── Inngest Realtime subscription ──────────────────────────────────────────
  const { latestData, state } = useInngestSubscription({
    enabled: subscribeEnabled,
    refreshToken,
  });

  // Process every incoming realtime message into toasts + console logs
  useEffect(() => {
    if (!latestData) return;

    const payload = latestData.data as StepEvent;
    if (!payload?.type) return;

    const now = new Date().toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const id = Math.random().toString(36).slice(2, 9);

    let logMsg = "";
    let logType: LogEntry["type"] = "info";
    let toastType: ToastType = "info";
    let toastTitle = "";
    let toastMsg = "";

    switch (payload.type) {
      case "step_start":
        logMsg = `▶ Step started: ${payload.step}`;
        logType = "info";
        toastType = "step_start";
        toastTitle = `Step started`;
        toastMsg = payload.step ?? "";
        if (payload.step && STEP_LABEL_TO_INDEX[payload.step] !== undefined) {
          setActiveStep(STEP_LABEL_TO_INDEX[payload.step]);
        }
        break;

      case "step_end":
        logMsg = `✔ Step done: ${payload.step}`;
        logType = "info";
        toastType = "step_end";
        toastTitle = `Step completed`;
        toastMsg = payload.step ?? "";
        break;

      case "function_complete":
        logMsg = `🎉 Workflow Completed Successfully ✅`;
        logType = "success";
        toastType = "function_complete";
        toastTitle = "Workflow Completed!";
        toastMsg = payload.message ?? "All steps finished.";
        setActiveStep(4);
        setIsRunning(false);
        setSubscribeEnabled(false);
        break;

      case "function_error":
        logMsg = `❌ Workflow Failed: ${payload.error}`;
        logType = "warning";
        toastType = "function_error";
        toastTitle = "Workflow Failed";
        toastMsg = payload.error ?? "An unexpected error occurred.";
        setIsRunning(false);
        setSubscribeEnabled(false);
        break;
    }

    if (logMsg) {
      setProgress((prev) => [...prev, { msg: logMsg, id, type: logType, timestamp: now }]);
    }
    if (toastTitle) {
      addToast(toastType, toastTitle, toastMsg);
    }
  }, [latestData, addToast]);

  // Surface subscription errors in the console
  useEffect(() => {
    if (state === "error") {
      const now = new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setProgress((prev) => [
        ...prev,
        { msg: "⚠ Realtime connection error — check your Inngest config.", id: Math.random().toString(36).slice(2), type: "warning", timestamp: now },
      ]);
    }
  }, [state]);

  const startProcess = async () => {
    setIsRunning(true);
    setProgress([]);
    setActiveStep(0);

    // Enable realtime BEFORE sending the event so we don't miss early publishes
    setSubscribeEnabled(true);

    const now = new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setProgress([{ msg: "Initializing Video AI Workflow...", id: "init", type: "info", timestamp: now }]);
    addToast("info", "Workflow Started", "Video AI pipeline is now running.");

    try {
      await fetch("/api/start", {
        method: "POST",
        body: JSON.stringify({ schemeId }),
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      const errNow = new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setProgress((prev) => [...prev, { msg: "Failed to start workflow.", id: "err", type: "warning", timestamp: errNow }]);
      addToast("function_error", "Start Failed", "Could not send workflow event.");
      setIsRunning(false);
      setSubscribeEnabled(false);
    }
  };

  const cancelProcess = async () => {
    try {
      await fetch("/api/cancel", {
        method: "POST",
        body: JSON.stringify({ schemeId }),
        headers: { "Content-Type": "application/json" },
      });
      const now = new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setProgress((prev) => [
        ...prev,
        { msg: "Cancellation signal sent...", id: Math.random().toString(36).slice(2), type: "warning", timestamp: now },
      ]);
      addToast("function_error", "Cancelling", "Cancellation signal sent to Inngest.");
      setIsRunning(false);
      setSubscribeEnabled(false);
    } catch {
      console.error("Failed to cancel process");
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col items-center justify-center p-4 md:p-8 font-sans selection:bg-blue-500/30">
      {/* Toast stack */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse [animation-delay:2s]" />
      </div>

      <div className="max-w-4xl w-full z-10">
        {/* Nav */}
        <div className="flex items-center justify-between mb-12 animate-in fade-in duration-1000">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Inngest<span className="text-blue-500">.</span>Demo
            </span>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-medium text-gray-500">
            {/* Realtime indicator */}
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${state === "active" ? "bg-green-400 animate-pulse" : state === "connecting" || state === "refresh_token" ? "bg-yellow-400 animate-pulse" : "bg-gray-600"}`} />
              <span className="text-xs font-mono text-gray-500">
                {state === "active" ? "Realtime live" : state === "connecting" || state === "refresh_token" ? "Connecting…" : "Realtime idle"}
              </span>
            </span>
            <span className="hover:text-white cursor-pointer transition-colors">Documentation</span>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mb-16 animate-in slide-in-from-top-4 duration-700">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Orchestrate <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Complex Workflows</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">
            Break the limits of serverless timeouts. Use Inngest to manage long-running tasks as a series of reliable steps.
          </p>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left: Control */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 transition-all hover:border-white/20">
              <h3 className="text-white font-bold mb-2">Workflow Control</h3>
              <p className="text-gray-500 text-sm mb-4">Each unique ID runs in its own isolated channel.</p>

              {/* Scheme ID input */}
              <div className="mb-6">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Run ID (Scheme ID)
                </label>
                <input
                  type="text"
                  value={schemeId}
                  onChange={(e) => setSchemeId(e.target.value.trim() || DEFAULT_SCHEME_ID)}
                  disabled={isRunning}
                  placeholder="e.g. scheme_window_A"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                />
                <p className="text-[10px] text-gray-600 mt-1.5">
                  Open two tabs with different IDs — notifications and cancellations won't cross.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={startProcess}
                  disabled={isRunning}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden ${
                    isRunning
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5"
                      : "bg-white text-black hover:bg-gray-200 active:scale-[0.98] shadow-2xl shadow-white/5"
                  }`}
                >
                  {isRunning && <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />}
                  {isRunning ? "Pipeline active..." : "Launch Pipeline"}
                </button>

                {isRunning && (
                  <button
                    onClick={cancelProcess}
                    className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 active:scale-[0.98]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel Workflow
                  </button>
                )}
              </div>

              {/* Stepper */}
              <div className="mt-10 pt-8 border-t border-white/5">
                <div className="flex justify-between relative">
                  <div className="absolute top-5 left-0 w-full h-[2px] bg-white/5 -z-10" />
                  <div
                    className="absolute top-5 left-0 h-[2px] bg-blue-500 transition-all duration-1000 -z-10"
                    style={{ width: `${(Math.max(0, activeStep - 1) / (workflowSteps.length - 1)) * 100}%` }}
                  />
                  {workflowSteps.map((s, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                        activeStep > i ? "bg-blue-500 border-blue-500 text-white" :
                        activeStep === i ? "bg-white/10 border-white/30 text-white animate-pulse" :
                        "bg-[#050505] border-white/10 text-gray-600"
                      }`}>
                        <span className="text-base">{s.icon}</span>
                      </div>
                      <span className={`text-[10px] uppercase tracking-widest font-bold mt-3 ${activeStep >= i ? "text-white" : "text-gray-600"}`}>
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600/20 to-blue-600/20 border border-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${state === "active" ? "bg-green-500 animate-ping" : "bg-gray-600"}`} />
                <span className="text-xs font-bold uppercase tracking-tighter text-blue-400">Inngest Realtime Status</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed font-medium">
                Your function publishes live events via WebSocket. Toast notifications appear as each step starts, ends, and when the workflow completes or fails.
              </p>
            </div>
          </div>

          {/* Right: Console */}
          <div className="lg:col-span-7">
            <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl h-[520px] flex flex-col overflow-hidden shadow-2xl relative">
              {/* Console header */}
              <div className="bg-white/5 border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Live Telemetry Feed</span>
                <div className="w-10" />
              </div>

              {/* Console body */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 font-mono text-sm leading-relaxed custom-scrollbar bg-[radial-gradient(circle_at_50%_0%,_rgba(37,99,235,0.05),_transparent)]"
              >
                {progress.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <div className="p-4 bg-white/5 rounded-full mb-6 italic text-3xl">📡</div>
                    <h4 className="text-white font-bold mb-1">Awaiting Execution</h4>
                    <p className="text-xs max-w-[200px]">Logs will populate here once the workflow begins.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {progress.map((item) => (
                      <div key={item.id} className="group flex gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
                        <span className="text-gray-700 whitespace-nowrap text-[10px] pt-1">{item.timestamp}</span>
                        <div className={`flex-1 p-3 rounded-xl border transition-all ${
                          item.type === "success" ? "bg-green-500/5 border-green-500/20 text-green-400" :
                          item.type === "warning" ? "bg-yellow-500/5 border-yellow-500/20 text-yellow-400" :
                          "bg-blue-500/5 border-blue-500/20 text-blue-300"
                        }`}>
                          <span className="opacity-60 mr-2">›</span>
                          {item.msg}
                        </div>
                      </div>
                    ))}
                    {isRunning && (
                      <div className="flex gap-4 animate-pulse ml-1">
                        <span className="text-gray-800 text-[10px] pt-1">RUNNING</span>
                        <span className="text-blue-500/50 flex items-center gap-2">
                          <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
                          <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 p-8 bg-blue-600 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-1000" />
          <div className="text-center md:text-left z-10">
            <h4 className="text-xl font-bold text-white mb-2">Ready to deploy?</h4>
            <p className="text-blue-100 text-sm opacity-80">Clone this example and push to Vercel in less than 2 minutes.</p>
          </div>
          <a
            href="https://github.com/x-eight/next-inngest"
            target="_blank"
            className="bg-white text-blue-600 px-8 py-3 rounded-2xl font-bold shadow-xl shadow-black/10 hover:shadow-black/20 transition-all active:scale-95 z-10"
          >
            View on GitHub
          </a>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </main>
  );
}
