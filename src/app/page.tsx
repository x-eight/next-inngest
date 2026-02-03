"use client";
import { useState, useEffect, useRef } from "react";

/**
 * Premium Dashboard for Inngest Orchestrator Demo.
 * Showcases background process telemetry with a high-end SaaS aesthetic.
 */
export default function Home() {
  const [progress, setProgress] = useState<{msg: string, id: string, type: 'info' | 'success' | 'warning', timestamp: string}[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const workflowSteps = [
    { label: "Analysis", icon: "🧠" },
    { label: "Synthesis", icon: "🎙️" },
    { label: "Storage", icon: "☁️" },
    { label: "Done", icon: "✨" }
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [progress]);

  const startProcess = async () => {
    setIsRunning(true);
    setProgress([]);
    setActiveStep(1);
    
    try {
      await fetch("/api/start", { method: "POST" });
      const eventSource = new EventSource("/api/progress");

      eventSource.onmessage = (event) => {
        const data = event.data;
        const id = Math.random().toString(36).substr(2, 9);
        const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        let type: 'info' | 'success' | 'warning' = 'info';
        if (data.includes("Completed") || data.includes("Success")) {
            type = 'success';
            setActiveStep(4);
        } else if (data.includes("Step 1")) {
            setActiveStep(1);
        } else if (data.includes("Step 2")) {
            setActiveStep(2);
        } else if (data.includes("Step 3")) {
            setActiveStep(3);
        }
        
        if (data.includes("Error") || data.includes("Failed")) type = 'warning';

        setProgress((prev) => [...prev, { msg: data, id, type, timestamp }]);
        
        if (data.includes("Completed") || data.includes("Error")) {
          eventSource.close();
          setIsRunning(false);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setIsRunning(false);
      };

    } catch (error) {
      console.error("Workflow failed:", error);
      setIsRunning(false);
    }
  };

  const cancelProcess = async () => {
    try {
      await fetch("/api/cancel", { 
        method: "POST",
        body: JSON.stringify({ schemeId: "scheme_demo_123" }),
        headers: { "Content-Type": "application/json" }
      });
      setProgress((prev) => [...prev, { 
        msg: "Cancellation signal sent...", 
        id: Math.random().toString(36).substr(2, 9), 
        type: 'warning', 
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
      }]);
    } catch (error) {
      console.error("Failed to cancel process:", error);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col items-center justify-center p-4 md:p-8 font-sans selection:bg-blue-500/30">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse [animation-delay:2s]"></div>
      </div>

      <div className="max-w-4xl w-full z-10">
        {/* Navigation / Logo Area */}
        <div className="flex items-center justify-between mb-12 animate-in fade-in duration-1000">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <span className="text-xl font-bold tracking-tight text-white">Inngest<span className="text-blue-500">.</span>Demo</span>
            </div>
            <div className="hidden md:flex gap-6 text-sm font-medium text-gray-500">
                <span className="hover:text-white cursor-pointer transition-colors">Documentation</span>
                <span className="hover:text-white cursor-pointer transition-colors">Vercel Setup</span>
            </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16 animate-in slide-in-from-top-4 duration-700">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                Orchestrate <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Complex Workflows</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">
                Break the limits of serverless timeouts. Use Inngest to manage long-running tasks as a series of reliable steps.
            </p>
        </div>

        {/* Main Interface Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Control & Status */}
            <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 transition-all hover:border-white/20">
                    <h3 className="text-white font-bold mb-2">Workflow Control</h3>
                    <p className="text-gray-500 text-sm mb-8">Trigger the automated Video AI processing pipeline.</p>
                    
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={startProcess}
                            disabled={isRunning}
                            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden ${
                                isRunning 
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5' 
                                : 'bg-white text-black hover:bg-gray-200 active:scale-[0.98] shadow-2xl shadow-white/5'
                            }`}
                        >
                            {isRunning && (
                                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                            )}
                            {isRunning ? "Pipeline active..." : "Launch Pipeline"}
                        </button>

                        {isRunning && (
                            <button
                                onClick={cancelProcess}
                                className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 active:scale-[0.98]"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                                Cancel Workflow
                            </button>
                        )}
                    </div>
                    
                    {/* Visual Stepper */}
                    <div className="mt-10 pt-8 border-t border-white/5">
                        <div className="flex justify-between relative">
                            {/* Connector Line */}
                            <div className="absolute top-5 left-0 w-full h-[2px] bg-white/5 -z-10"></div>
                            <div 
                                className="absolute top-5 left-0 h-[2px] bg-blue-500 transition-all duration-1000 -z-10"
                                style={{ width: `${(Math.max(0, activeStep - 1) / (workflowSteps.length - 1)) * 100}%` }}
                            ></div>

                            {workflowSteps.map((s, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                                        activeStep > i ? 'bg-blue-500 border-blue-500 text-white' : 
                                        activeStep === i ? 'bg-white/10 border-white/30 text-white animate-pulse' : 
                                        'bg-[#050505] border-white/10 text-gray-600'
                                    }`}>
                                        <span className="text-base">{s.icon}</span>
                                    </div>
                                    <span className={`text-[10px] uppercase tracking-widest font-bold mt-3 ${activeStep >= i ? 'text-white' : 'text-gray-600'}`}>
                                        {s.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600/20 to-blue-600/20 border border-white/10 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                        <span className="text-xs font-bold uppercase tracking-tighter text-blue-400">Vercel Runtime Status</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed font-medium">
                        Your serverless function is protected from timeouts. Inngest handles the state management across steps.
                    </p>
                </div>
            </div>

            {/* Right Column: Console/Logs */}
            <div className="lg:col-span-7">
                <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl h-[520px] flex flex-col overflow-hidden shadow-2xl relative">
                    {/* Console Header */}
                    <div className="bg-white/5 border-b border-white/5 px-6 py-4 flex items-center justify-between">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Live Telemetry Feed</span>
                        <div className="w-10"></div>
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
                                            item.type === 'success' ? 'bg-green-500/5 border-green-500/20 text-green-400' : 
                                            item.type === 'warning' ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-400' : 
                                            'bg-blue-500/5 border-blue-500/20 text-blue-300'
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
                                            <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></span>
                                            <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                            <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
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
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-1000"></div>
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

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </main>
  );
}
