import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SierraLeoneFlag } from "./SierraLeoneFlag";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const SYSTEM_INSTRUCTION = `
You are "Salone Immigration Assistant", an expert AI virtual guide for the Republic of Sierra Leone Immigration Department (SLID), powered by Google Gemini.
You must adopt the signature conversational structure, intelligence, warmth, and polish of ChatGPT.

Conversational Format Protocol (Follow for Every Response):
1. Step 1 — Exchange Greetings & Friendly Acknowledgement:
   - Always open your response with a warm, courteous greeting and friendly acknowledgement (e.g. "Hello! Welcome to the Sierra Leone Immigration Assistant. It is a pleasure to assist you today!" or "Hi there! I would be delighted to help you with that.").
2. Step 2 — Clear & Structured Information:
   - Move smoothly into the core answer. Use clear paragraphs, organized bullet points (•), and bold section titles.
3. Step 3 — Helpful Next Steps & Closing:
   - Conclude with a welcoming question or actionable next step (e.g. "Please let me know if you need help starting your application or have any other questions!").

Core Knowledge Base:
1. Visa Types & Fees:
   - Tourist e-Visa (Single Entry, 30 days): $80 USD.
   - Business e-Visa (Single or Multiple Entry, up to 90 days): $160 USD.
   - Transit Visa (Up to 7 days for connecting flights): $40 USD.
   - Diplomatic / Official Visa: $0 (Gratis) with official diplomatic note verbale.

2. Document & Passport Requirements:
   - Biometric Passport valid for at least 6 months beyond intended date of departure.
   - At least 2 blank passport pages.
   - Recent passport photograph with white background.
   - Flight itinerary / return ticket and proof of accommodation/hotel booking.
   - International Yellow Fever Vaccination Certificate (mandatory upon arrival).

3. ECOWAS Citizens Exemption:
   - Citizens of ECOWAS member states (Ghana, Nigeria, Guinea, Liberia, Senegal, Côte d'Ivoire, Gambia, Benin, Burkina Faso, Cape Verde, Guinea-Bissau, Mali, Niger, Togo) do NOT require an entry visa under the ECOWAS Free Movement Protocol.
   - They must hold a valid biometric passport or ECOWAS Travel Certificate and receive an entry stamp upon arrival.

4. Border Checkpoints:
   - FNA: Freetown International Airport (Lungi) — Main air entry.
   - Queen Elizabeth II Quay (Seaport) — Maritime passenger/cargo terminal.
   - Gbalamuya Border Post (Kambia) — Primary Guinea land crossing.
   - Jendema Border Post (Pujehun) — Primary Liberia land crossing.
   - Koindu Border Post (Kailahun) — Tri-border crossing.

5. Application & Turnaround Time:
   - e-Visa applications are submitted online 24/7.
   - Standard processing turnaround time is 48 to 72 business hours.
   - Once approved, applicants receive a Digital Visa Certificate with an encrypted QR Code.
   - Upon arrival at the border, show the QR code on mobile or printed pass along with physical passport.

Formatting Rules:
- Do NOT leave raw asterisks in sentences. Use clean text and standard bullet points.
- Keep the tone polite, patriotic, helpful, and natural.
`;

const QUICK_PROMPTS = [
  "What are the official e-Visa fees?",
  "What documents do I need for my biometric passport?",
  "Do ECOWAS citizens need a visa?",
  "How long does visa approval take?",
  "What are the authorized border checkpoints?",
];

/**
 * Custom Sierra Leone Flag Tricolour AI Chatbot Icon (Green, White, Blue)
 */
function SaloneChatbotBadgeIcon({ size = 44 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-md"
    >
      {/* Outer Tricolor Ring */}
      <circle cx="32" cy="32" r="30" fill="#0B4F6C" />

      {/* Top Green Arc */}
      <path
        d="M 10.8 17.5 A 30 30 0 0 1 53.2 17.5 L 48 24 A 23 23 0 0 0 16 24 Z"
        fill="#1EB53A"
      />
      {/* Middle White Arc */}
      <path
        d="M 4.5 32 A 30 30 0 0 1 10.8 17.5 L 16 24 A 23 23 0 0 0 9 32 Z"
        fill="#FFFFFF"
      />
      <path
        d="M 59.5 32 A 30 30 0 0 0 53.2 17.5 L 48 24 A 23 23 0 0 1 55 32 Z"
        fill="#FFFFFF"
      />
      {/* Bottom Blue Arc */}
      <path
        d="M 10.8 46.5 A 30 30 0 0 0 53.2 46.5 L 48 40 A 23 23 0 0 1 16 40 Z"
        fill="#0072C6"
      />

      {/* Inner Metallic Disc */}
      <circle cx="32" cy="32" r="21" fill="#0C1B2A" stroke="#FFFFFF" strokeWidth="1.5" />

      {/* Robot Antenna */}
      <rect x="30.5" y="16" width="3" height="5" rx="1.5" fill="#1EB53A" />
      <circle cx="32" cy="15" r="2.5" fill="#0072C6" stroke="#FFFFFF" strokeWidth="0.8" />

      {/* Robot Head */}
      <rect x="18" y="21" width="28" height="22" rx="7" fill="#FFFFFF" stroke="#0B4F6C" strokeWidth="1.5" />

      {/* Visor */}
      <rect x="21" y="24" width="22" height="11" rx="4" fill="#0C1B2A" />

      {/* Glowing Eyes */}
      <circle cx="26.5" cy="29.5" r="2.5" fill="#1EB53A" />
      <circle cx="27" cy="29" r="0.8" fill="#FFFFFF" />

      <circle cx="37.5" cy="29.5" r="2.5" fill="#0072C6" />
      <circle cx="38" cy="29" r="0.8" fill="#FFFFFF" />

      {/* Friendly Smile */}
      <path
        d="M 28 38 Q 32 41 36 38"
        stroke="#1EB53A"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Ears */}
      <circle cx="16.5" cy="32" r="2" fill="#1EB53A" />
      <circle cx="47.5" cy="32" r="2" fill="#0072C6" />
    </svg>
  );
}

export function ApplicantAiChatbot() {
  const location = useLocation();
  const { profile } = useAuth();

  // Strictly hide chatbot on internal staff officer consoles, or for internal staff users
  const isInternalStaffRoute =
    location.pathname.startsWith("/staff/request-access") ||
    location.pathname.startsWith("/admin/users") ||
    location.pathname.startsWith("/admin/checkpoints") ||
    location.pathname.startsWith("/admin/reports") ||
    location.pathname.startsWith("/admin/audit-log") ||
    location.pathname === "/admin" ||
    location.pathname.startsWith("/visa-officer") ||
    location.pathname.startsWith("/border/check-in") ||
    location.pathname.startsWith("/border/verify") ||
    location.pathname.startsWith("/border/watchlist") ||
    location.pathname.startsWith("/border/overstays");

  const isStaffUser = profile && profile.role !== "applicant";

  if (isInternalStaffRoute || isStaffUser) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    return (
      import.meta.env.VITE_GEMINI_API_KEY ||
      localStorage.getItem("slid_gemini_api_key") ||
      ""
    );
  });
  const [tempKeyInput, setTempKeyInput] = useState(apiKey);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content:
        "Hello! I am **Salone Immigration Assistant** 🇸🇱, your conversational AI guide powered by Google Gemini.\n\nWhether you are planning a trip to the Lion Mountains, applying for an e-Visa, or need entry requirements, I am here to assist you. How can I help today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const abortStreamRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming, streamingText, isOpen]);

  useEffect(() => {
    function handleOpenChat(e: any) {
      setIsOpen(true);
      const query = e?.detail;
      if (query && typeof query === "string") {
        setTimeout(() => {
          sendMessage(query);
        }, 150);
      }
    }

    window.addEventListener("open-ai-chat", handleOpenChat);
    return () => window.removeEventListener("open-ai-chat", handleOpenChat);
  }, []);

  function saveKey(keyToSave: string) {
    const trimmed = keyToSave.trim();
    setApiKey(trimmed);
    localStorage.setItem("slid_gemini_api_key", trimmed);
    setShowKeyModal(false);
  }

  // ChatGPT-style typewriter streaming simulation
  async function streamResponseText(fullText: string) {
    setIsStreaming(true);
    setStreamingText("");
    abortStreamRef.current = false;

    const words = fullText.split(" ");
    let currentAccumulated = "";

    for (let i = 0; i < words.length; i++) {
      if (abortStreamRef.current) break;

      currentAccumulated += (i === 0 ? "" : " ") + words[i];
      setStreamingText(currentAccumulated);

      // Natural ChatGPT typing rhythm: 12ms to 24ms per word
      await new Promise((resolve) => setTimeout(resolve, 16));
    }

    setIsStreaming(false);
    setStreamingText("");

    const assistantMsg: Message = {
      id: Math.random().toString(36).substring(2, 9),
      role: "assistant",
      content: abortStreamRef.current ? currentAccumulated : fullText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setLoading(false);
  }

  function handleStopGenerating() {
    abortStreamRef.current = true;
    setIsStreaming(false);
    setLoading(false);
  }

  async function sendMessage(textToSend?: string) {
    const text = (textToSend || input).trim();
    if (!text || loading || isStreaming) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substring(2, 9),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessagesHistory = [...messages, userMessage];
    setMessages(newMessagesHistory);
    setInput("");
    setLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const activeKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY;

    // 1. Direct Live Google Gemini API Request
    if (activeKey) {
      const contents = newMessagesHistory.slice(-8).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      let lastErrorMessage = "";
      let successReply = null;

      try {
        let targetModels: string[] = [];
        try {
          const listRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${activeKey}`
          );
          if (listRes.ok) {
            const listData = await listRes.json();
            if (Array.isArray(listData.models)) {
              targetModels = listData.models
                .filter((m: any) =>
                  m.supportedGenerationMethods?.includes("generateContent")
                )
                .map((m: any) => m.name);
            }
          }
        } catch (err) {
          // ignore
        }

        if (targetModels.length === 0) {
          targetModels = [
            "models/gemini-2.0-flash",
            "models/gemini-1.5-flash-8b",
            "models/gemini-1.5-flash",
            "models/gemini-1.5-pro",
            "models/gemini-pro",
          ];
        }

        for (const modelPath of targetModels) {
          try {
            const cleanModel = modelPath.startsWith("models/")
              ? modelPath
              : `models/${modelPath}`;
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/${cleanModel}:generateContent?key=${activeKey}`;

            const res = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents,
                systemInstruction: {
                  parts: [{ text: SYSTEM_INSTRUCTION }],
                },
                generationConfig: {
                  temperature: 0.4,
                  maxOutputTokens: 1000,
                },
              }),
            });

            const data = await res.json();

            if (res.ok) {
              const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (reply) {
                successReply = reply;
                break;
              }
            } else {
              lastErrorMessage = data.error?.message || `Status ${res.status}`;
            }
          } catch (e: any) {
            lastErrorMessage = e.message;
          }
        }
      } catch (err: any) {
        lastErrorMessage = err.message;
      }

      if (successReply) {
        await streamResponseText(successReply);
        return;
      } else if (lastErrorMessage) {
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2, 9),
            role: "assistant",
            content: `⚠️ **Google Gemini API**: ${lastErrorMessage}\n\nPlease check your API key in settings or verify that Google Gemini API is enabled in your Google Cloud / AI Studio project.`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        setLoading(false);
        return;
      }
    }

    // 2. Try Backend API
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessagesHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          await streamResponseText(data.reply);
          return;
        }
      }
    } catch (e) {
      // Backend not running
    }

    // 3. Prompt user for API key
    const fallbackNotice = `### 🔑 Google Gemini API Key Required\n\nTo chat live with Google Gemini, please configure your free API key:\n1. Click the **⚙️ Key** icon in the header above, or\n2. Add \`VITE_GEMINI_API_KEY=AIzaSy...\` in **\`frontend/.env\`**.\n\n👉 Get a free key at: [Google AI Studio](https://aistudio.google.com/app/apikey)`;
    await streamResponseText(fallbackNotice);
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  }

  function renderFormattedContent(text: string) {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="h-1.5" />;
      }

      if (trimmed.startsWith("### ")) {
        const headerText = trimmed.replace("### ", "").replace(/\*/g, "");
        return (
          <p key={idx} className="font-bold text-ink text-xs mt-2.5 mb-1 font-['Tahoma']">
            {headerText}
          </p>
        );
      }

      if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
        const item = trimmed.replace(/^[\*\-•]\s*/, "");
        return (
          <div key={idx} className="flex items-start gap-2 ml-1 my-1 text-xs text-ink/90 leading-relaxed font-['Tahoma']">
            <span className="text-primary font-bold text-xs mt-0.5">•</span>
            <div>{parseInlineMarkdown(item)}</div>
          </div>
        );
      }

      return (
        <p key={idx} className="text-xs text-ink/90 leading-relaxed my-1 font-['Tahoma']">
          {parseInlineMarkdown(trimmed)}
        </p>
      );
    });
  }

  function parseInlineMarkdown(text: string) {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\))/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const cleanBold = part.slice(2, -2).replace(/\*/g, "");
        return <strong key={i} className="font-bold text-ink">{cleanBold}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        const cleanItalic = part.slice(1, -1).replace(/\*/g, "");
        return <span key={i} className="text-primary font-medium">{cleanItalic}</span>;
      }
      const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        return (
          <Link key={i} to={linkMatch[2]} className="text-primary font-bold underline hover:text-primary-dark">
            {linkMatch[1].replace(/\*/g, "")}
          </Link>
        );
      }
      return part.replace(/\*/g, "");
    });
  }

  return (
    <div className="fixed bottom-20 right-3.5 sm:bottom-6 sm:right-6 z-50 font-['Tahoma']">
      {/* 1. Right-Hand Floating Chatbot Launcher with Green, White & Blue Tricolour Logo */}
      {!isOpen && (
        <div className="relative group flex items-center justify-end">
          {/* Floating Tooltip Label */}
          <div className="absolute right-16 bg-[#0B1528] text-white border border-emerald-500/40 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none hidden sm:flex items-center gap-2">
            <SierraLeoneFlag width={14} height={9} />
            <span>Chat with Salone Immigration AI ✦</span>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="relative flex items-center justify-center w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-[#0A1220] border-2 border-emerald-500/50 shadow-2xl hover:shadow-emerald-900/60 transition transform hover:scale-110 active:scale-95 cursor-pointer overflow-hidden p-0.5 group-hover:border-emerald-400"
            title="Chat with Salone Immigration AI"
            aria-label="Open Immigration AI Virtual Assistant"
          >
            <div className="absolute inset-0 rounded-full p-[2px] bg-gradient-to-b from-[#1EB53A] via-white to-[#0072C6]">
              <div className="w-full h-full bg-[#070D18] rounded-full flex items-center justify-center">
                <SaloneChatbotBadgeIcon size={40} />
              </div>
            </div>

            {/* Online Green Pulsing Beacon */}
            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#22C55E] border-2 border-[#0A1220] animate-pulse"></span>
          </button>
        </div>
      )}

      {/* 2. ChatGPT-Style Interactive Chat Window */}
      {isOpen && (
        <div className="bg-white border border-primary-light rounded-2xl shadow-2xl w-[94vw] sm:w-[410px] h-[80vh] sm:h-[580px] max-h-[640px] flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-primary text-white p-3.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <SaloneChatbotBadgeIcon size={32} />
              <div>
                <div className="flex items-center gap-1.5">
                  <SierraLeoneFlag width={14} height={9} />
                  <p className="text-xs font-bold leading-tight">Salone Immigration AI</p>
                </div>
                <p className="text-[10px] text-white/80 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-approved"></span>
                  ChatGPT-Style Gemini AI ✦
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowKeyModal(!showKeyModal)}
                title="Configure Gemini API Key"
                className="text-white/80 hover:text-white text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition cursor-pointer"
              >
                ⚙️ Key
              </button>
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: "welcome-msg",
                      role: "assistant",
                      content:
                        "Chat conversation reset! I am Salone Immigration Assistant 🇸🇱. How can I assist your visa, passport, or travel requirements today?",
                      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    },
                  ])
                }
                title="New Chat"
                className="text-white/70 hover:text-white text-xs px-2 py-1 rounded cursor-pointer"
              >
                ↻ New
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white text-lg font-bold p-1 cursor-pointer"
                title="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* National Tri-Color Accent Line (Green - White - Blue) */}
          <div className="h-1.5 w-full grid grid-cols-3">
            <div className="bg-[#1EB53A]"></div>
            <div className="bg-white"></div>
            <div className="bg-[#0072C6]"></div>
          </div>

          {/* API Key Modal */}
          {showKeyModal && (
            <div className="p-3 bg-canvas border-b border-primary-light text-xs animate-fade-in">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-ink">Google Gemini API Key:</span>
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="text-ink-soft hover:text-ink font-bold"
                >
                  ✕
                </button>
              </div>
              <div className="flex gap-1.5 mb-1.5">
                <input
                  type="password"
                  placeholder="Paste AIzaSy... key here"
                  value={tempKeyInput}
                  onChange={(e) => setTempKeyInput(e.target.value)}
                  className="flex-1 border border-primary-light rounded px-2.5 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={() => saveKey(tempKeyInput)}
                  className="bg-primary text-white text-[11px] font-semibold px-3 py-1 rounded hover:bg-primary-dark cursor-pointer"
                >
                  Save
                </button>
              </div>
              <p className="text-[10px] text-ink-soft">
                Get a free key at 👉{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline font-medium"
                >
                  Google AI Studio
                </a>
              </p>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-canvas/30">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col group ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div className="flex items-start gap-2 max-w-[88%]">
                  {m.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      🤖
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs ${
                      m.role === "user"
                        ? "bg-primary text-white rounded-br-none"
                        : "bg-white border border-primary-light text-ink rounded-bl-none"
                    }`}
                  >
                    {m.role === "user" ? (
                      <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                    ) : (
                      <div>{renderFormattedContent(m.content)}</div>
                    )}
                  </div>
                </div>

                {/* ChatGPT Message Action Bar */}
                <div className="flex items-center gap-2 mt-1 px-1 text-[9px] text-ink-soft font-mono">
                  <span>{m.timestamp}</span>
                  {m.role === "assistant" && (
                    <button
                      onClick={() => handleCopy(m.content, m.id)}
                      className="opacity-0 group-hover:opacity-100 hover:text-primary transition cursor-pointer flex items-center gap-1"
                      title="Copy response"
                    >
                      {copiedMessageId === m.id ? (
                        <span className="text-status-approved font-bold">✓ Copied</span>
                      ) : (
                        <span>📋 Copy</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* ChatGPT-Style Live Streaming Indicator */}
            {isStreaming && (
              <div className="flex flex-col items-start">
                <div className="flex items-start gap-2 max-w-[88%]">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    🤖
                  </div>
                  <div className="bg-white border border-primary-light text-ink rounded-2xl rounded-bl-none px-3.5 py-2.5 text-xs shadow-2xs">
                    <div>{renderFormattedContent(streamingText)}</div>
                    <span className="inline-block w-1.5 h-3.5 bg-primary ml-0.5 animate-pulse align-middle"></span>
                  </div>
                </div>
              </div>
            )}

            {/* Waiting for first token */}
            {loading && !isStreaming && (
              <div className="flex items-center gap-2 text-ink-soft text-xs bg-white border border-primary-light rounded-xl px-3.5 py-2 max-w-[70%] shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce delay-100"></span>
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce delay-200"></span>
                <span className="text-[11px] italic">Salone AI is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Stop Generating Button (While Streaming) */}
          {isStreaming && (
            <div className="flex justify-center -mb-2 z-10">
              <button
                onClick={handleStopGenerating}
                className="bg-white border border-primary-light text-ink hover:bg-canvas text-xs px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>⏹</span>
                <span>Stop generating</span>
              </button>
            </div>
          )}

          {/* Quick Prompts Carousel */}
          {!loading && !isStreaming && (
            <div className="p-2 bg-white border-t border-primary-light/50 overflow-x-auto flex gap-1.5 no-scrollbar">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(prompt)}
                  className="whitespace-nowrap text-[10px] bg-canvas hover:bg-primary-light border border-primary-light text-primary font-medium px-2.5 py-1 rounded-full transition cursor-pointer flex-shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* ChatGPT-Style Multi-line Auto-expanding Input Box */}
          <div className="p-3 bg-white border-t border-primary-light">
            <div className="relative flex items-end bg-canvas/60 border border-primary-light rounded-2xl px-3.5 py-2 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition">
              <textarea
                ref={textareaRef}
                rows={1}
                placeholder="Message Salone Immigration AI..."
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={loading || isStreaming}
                className="flex-1 text-xs bg-transparent border-0 resize-none focus:outline-none max-h-24 leading-relaxed font-['Tahoma']"
              />

              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading || isStreaming}
                className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs hover:bg-primary-dark disabled:opacity-30 disabled:hover:bg-primary transition cursor-pointer flex-shrink-0 ml-1.5 shadow-xs"
                title="Send message (Enter)"
              >
                ↑
              </button>
            </div>
            <p className="text-[9px] text-center text-ink-soft mt-1.5">
              Press <kbd className="font-mono bg-canvas px-1 rounded border border-primary-light/60">Enter</kbd> to send • <kbd className="font-mono bg-canvas px-1 rounded border border-primary-light/60">Shift + Enter</kbd> for new line
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
