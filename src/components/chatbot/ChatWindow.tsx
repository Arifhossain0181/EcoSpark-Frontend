"use client";

import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { useAuth } from "@/context/authcontext";

const PROJECT_CONTEXT = `EcoSpark is a sustainability idea sharing platform.
Core modules: authentication, ideas, categories, comments, reviews/ratings, votes, payments, watchlist.
Public pages: Home, Ideas, Blog, Community, About, Terms, Privacy.
Ideas features: search, category filter, payment filter (free/paid), author filter, vote filter, sorting, pagination.
Idea details: paid/free access logic, voting, nested comments, watchlist, member reviews.
Dashboards are role-based:
- Member: create/edit idea, submit for review, manage own ideas, purchased ideas.
- Manager: moderate ideas/comments/categories, reports.
- Admin: users management, ideas moderation, comments, payments, stats.
Chatbot can answer project feature questions and database count questions.`;

const QUICK_QUESTIONS = [
  "Platform summary দাও",
  "Paid idea কতটি?",
  "আমার ideas দেখাও",
  "Category list দাও",
  "আমার payment history",
];

const getChatEndpoint = (): string => {
  const rawBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const cleanBase = rawBase.replace(/\/+$/, "");

  if (cleanBase.endsWith("/api")) {
    return `${cleanBase}/chatbot/chat`;
  }

  return `${cleanBase}/api/chatbot/chat`;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
};

type ChatWindowProps = {
  onClose: () => void;
};

export default function ChatWindow({ onClose }: ChatWindowProps) {
  const { user } = useAuth();
  const currentUserId = user?.id || null;
  const currentUserName = user?.name || null;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `হ্যালো${currentUserName ? ` **${currentUserName}**` : ""}! 👋\nআমি EcoSpark Assistant। আপনার যেকোনো প্রশ্ন করুন!`,
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const renderText = (text: string) =>
    text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br/>");

  const TypingDots = () => (
    <div style={{ display: "flex", gap: 4, padding: "10px 14px", alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#86efac",
            animation: "ecoBounce 1.1s infinite",
            animationDelay: `${i * 0.18}s`,
            display: "inline-block",
          }}
        />
      ))}
      <style>{`
        @keyframes ecoBounce {
          0%,80%,100% { transform: translateY(0) }
          40% { transform: translateY(-5px) }
        }
      `}</style>
    </div>
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(rawText?: string): Promise<void> {
    const trimmedInput = (rawText ?? input).trim();
    if (!trimmedInput || loading) return;

    const userMsg: Message = { role: "user", content: trimmedInput };
    const history: Message[] = [...messages, userMsg];

    setMessages([...history, { role: "assistant", content: "", streaming: true }]);
    setInput("");
    setLoading(true);

    try {
      const chatEndpoint = getChatEndpoint();
      const token =
        Cookies.get("accessToken") ||
        (typeof window !== "undefined" ? window.localStorage.getItem("accessToken") || undefined : undefined);

      const res = await fetch(chatEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: trimmedInput,
          history: history.slice(-6),
          projectContext: PROJECT_CONTEXT,
          userId: currentUserId,
          userName: currentUserName,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Chat API request failed: ${res.status} ${errorText}`);
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("No stream response received");
      }

      const decoder = new TextDecoder();
      let fullText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          const data = line.slice(6);
          if (data.trim() === "[DONE]") continue;

          fullText += data;

          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: fullText,
              streaming: true,
            };
            return updated;
          });
        }
      }

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: fullText || "দুঃখিত, একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।",
          streaming: false,
        };
        return updated;
      });
    } catch (error) {
      console.error("Chat request failed:", error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content:
            "সার্ভার থেকে উত্তর আনতে সমস্যা হচ্ছে। Backend server চালু আছে কি না এবং API URL ঠিক আছে কি না চেক করুন।",
          streaming: false,
        };
        return updated;
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div
      style={{
        width: 360,
        height: 540,
        background: "#ffffff",
        borderRadius: 20,
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: "1px solid #dcfce7",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          background: "#16a34a",
          padding: "14px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            🌿
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>EcoSpark Assistant</div>
            <div style={{ color: "#bbf7d0", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
              {currentUserName ? `${currentUserName} · ` : ""}Live DB connected
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "none",
            color: "#fff",
            fontSize: 16,
            width: 28,
            height: 28,
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          background: "#f0fdf4",
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            {msg.role === "assistant" && (
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "#22c55e",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  marginRight: 6,
                  flexShrink: 0,
                  alignSelf: "flex-end",
                }}
              >
                🌿
              </div>
            )}
            <div
              style={{
                maxWidth: "78%",
                background: msg.role === "user" ? "#16a34a" : "white",
                color: msg.role === "user" ? "#fff" : "#1a1a1a",
                padding: msg.streaming && !msg.content ? "0" : "10px 13px",
                borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                fontSize: 13.5,
                lineHeight: 1.6,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                border: msg.role === "assistant" ? "1px solid #dcfce7" : "none",
              }}
            >
              {msg.streaming && !msg.content ? (
                <TypingDots />
              ) : (
                <span dangerouslySetInnerHTML={{ __html: renderText(msg.content) }} />
              )}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && (
        <div
          style={{
            padding: "0 12px 8px",
            display: "flex",
            flexWrap: "wrap",
            gap: 5,
            background: "#f0fdf4",
          }}
        >
          {QUICK_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => void sendMessage(q)}
              style={{
                background: "#fff",
                border: "1px solid #bbf7d0",
                color: "#15803d",
                padding: "4px 10px",
                borderRadius: 20,
                fontSize: 11.5,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div
        style={{
          padding: "10px 12px",
          borderTop: "1px solid #dcfce7",
          display: "flex",
          gap: 8,
          background: "#fff",
        }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) void sendMessage();
          }}
          placeholder={currentUserName ? `${currentUserName}, কিছু জিজ্ঞেস করুন...` : "কিছু জিজ্ঞেস করুন..."}
          style={{
            flex: 1,
            padding: "9px 13px",
            borderRadius: 22,
            border: "1.5px solid #bbf7d0",
            fontSize: 13.5,
            outline: "none",
            background: loading ? "#f8fafc" : "#fff",
            color: "#1a1a1a",
          }}
        />

        <button
          onClick={() => void sendMessage()}
          disabled={loading || !input.trim()}
          style={{
            background: input.trim() && !loading ? "#16a34a" : "#d1fae5",
            color: input.trim() && !loading ? "white" : "#86efac",
            border: "none",
            borderRadius: "50%",
            width: 38,
            height: 38,
            cursor: input.trim() && !loading ? "pointer" : "default",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
