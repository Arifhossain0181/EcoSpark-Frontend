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
};

type ChatWindowProps = {
  onClose: () => void;
};

export default function ChatWindow({ onClose }: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "হ্যালো! আমি Ecospark assistant। আপনি জিজ্ঞেস করতে পারেন",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user?.name) return;

    setMessages((prev) => {
      const alreadyGreeted = prev.some(
        (msg) => msg.role === "assistant" && msg.content.includes(user.name)
      );
      if (alreadyGreeted) return prev;

      return [
        {
          role: "assistant",
          content: `Hi ${user.name}! `,
        },
        ...prev,
      ];
    });
  }, [user?.name]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(): Promise<void> {
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;

    const userMsg: Message = { role: "user", content: trimmedInput };
    const history: Message[] = [...messages, userMsg];

    setMessages([...history, { role: "assistant", content: "" }]);
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
            };
            return updated;
          });
        }
      }
    } catch (error) {
      console.error("Chat request failed:", error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content:
            "সার্ভার থেকে উত্তর আনতে সমস্যা হচ্ছে। Backend server চালু আছে কি না এবং API URL ঠিক আছে কি না চেক করুন।",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        width: 340,
        height: 480,
        background: "white",
        borderRadius: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: "#6366f1",
          padding: "14px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ color: "white", fontWeight: 600, fontSize: 15 }}>Shop Assistant</div>
          <div style={{ color: "#c7d2fe", fontSize: 12 }}>সবসময় online</div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "white",
            fontSize: 20,
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              background: msg.role === "user" ? "#6366f1" : "#f1f5f9",
              color: msg.role === "user" ? "white" : "#1e293b",
              padding: "8px 12px",
              borderRadius: 12,
              maxWidth: "80%",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {msg.content || (loading && msg.role === "assistant" ? "..." : "")}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <div
        style={{
          padding: "10px 12px",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          gap: 8,
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="কিছু জিজ্ঞেস করুন..."
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            fontSize: 14,
            outline: "none",
          }}
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            background: "#6366f1",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "8px 14px",
            cursor: "pointer",
            fontSize: 18,
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
