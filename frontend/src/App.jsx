import { useState } from "react";
import ReactMarkdown from "react-markdown";
import "./app.css";

const API_URL = "http://127.0.0.1:8000";
const suggestions = [
  { title: "Track an order", text: "Where is my order?" },
  { title: "Payment support", text: "My payment was deducted twice. Please help urgently." },
  { title: "Say hello", text: "Hi, good morning!" },
  { title: "Ask a question", text: "What time is it now?" },
];

function Icon({ name, ...props }) {
  const paths = {
    sparkle: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z"/><path d="m19 14 1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1L19 14Z"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    chat: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/></>,
    bot: <><rect x="4" y="7" width="16" height="13" rx="4"/><path d="M12 3v4M9 13h.01M15 13h.01M9 17h6"/></>,
    user: <><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="8" r="4"/></>,
    send: <><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></>,
    copy: <><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}

export default function App() {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [status, setStatus] = useState("AI responses are suggestions. Review before sending to a customer.");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event?.preventDefault();
    const text = message.trim();
    if (!text || loading) return;

    setConversation((items) => [...items, { type: "user", text }]);
    setMessage("");
    setLoading(true);
    setStatus("Writing a helpful response…");

    try {
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const result = await response.json();
      if (!response.ok) {
        const detail = typeof result.detail === "string" ? result.detail : "The request could not be processed.";
        throw new Error(detail);
      }
      setConversation((items) => [...items, { type: "assistant", text: result.ai_response, details: result }]);
      setStatus("Response ready. Review it before using.");
    } catch (error) {
      setConversation((items) => [...items, { type: "error", text: error.message || "Could not connect to the backend." }]);
      setStatus("Something went wrong. Check that the backend is running, then try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyResponse(text) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("Response copied to clipboard.");
    } catch {
      setStatus("Clipboard access failed. Select and copy the response manually.");
    }
  }

  function resetChat() {
    setConversation([]);
    setMessage("");
    setStatus("AI responses are suggestions. Review before sending to a customer.");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><Icon name="sparkle" /></span> AI Assistant</div>
        <button type="button" className="new-chat" onClick={resetChat}><Icon name="plus" /> New conversation</button>
        <div className="side-label">Workspace</div>
        <div className="side-link active"><Icon name="chat" /> AI response assistant</div>
        <div className="sidebar-bottom">
          <div className="online"><span className="online-dot" /> Backend Connected</div>
          <p className="side-note">FastAPI + Groq</p>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          {/* The Knight's Move – A subtle, strategic chess reference 
          perfect for an application figuring out the best "next move" for a customer message. */}
          <div><div className="top-title">The Knight's Move</div></div>
          <div className="top-pill"><span className="online-dot" /> System ready</div>
        </header>

        <div className="chat-scroll">
          {conversation.length === 0 ? (
            <section className="welcome">
              <div className="welcome-icon"><Icon name="sparkle" /></div>
              <h1>How can I help you reply?</h1>
              <p>Suggested Responses</p>
              <div className="suggestions">
                {suggestions.map((item) => (
                  <button key={item.title} className="suggestion" type="button" onClick={() => setMessage(item.text)}>
                    <strong>{item.title}</strong>{item.text}
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <section className="conversation" aria-live="polite">
              {conversation.map((item, index) => item.type === "user" ? (
                <div className="chat-row user" key={`user-${index}`}>
                  <span className="avatar"><Icon name="user" /></span>
                  <div className="message-wrap"><div className="message-meta">You</div><div className="bubble">{item.text}</div></div>
                </div>
              ) : item.type === "error" ? (
                <div className="chat-row" key={`error-${index}`}>
                  <span className="avatar"><Icon name="bot" /></span>
                  <div className="message-wrap"><div className="message-meta">Assistant</div><div className="bubble">{item.text}</div></div>
                </div>
              ) : (
                <div key={`assistant-${index}`}>
                  <details className="intent-disclosure">
                    <summary>
                      <span className="intent-chevron" aria-hidden="true">›</span>
                      <span>Detected intent</span>
                      <strong>{item.details.intent.replaceAll("_", " ")}</strong>
                    </summary>
                    <div className="api-result-label">API response</div>
                    <pre>{JSON.stringify(item.details, null, 2)}</pre>
                  </details>
                  <div className="chat-row">
                    <span className="avatar"><Icon name="bot" /></span>
                    <div className="message-wrap">
                      <div className="message-meta">Chat-Bot</div>
                      <div className="bubble markdown-result"><ReactMarkdown>{item.text || "No response was returned."}</ReactMarkdown></div>
                      <div className="response-tools"><button className="copy-button" type="button" onClick={() => copyResponse(item.text)}><Icon name="copy" /> Copy response</button><span>·</span><span>AI generated</span></div>
                    </div>
                  </div>
                </div>
              ))}
              {loading && <div className="chat-row"><span className="avatar"><Icon name="bot" /></span><div className="message-wrap"><div className="message-meta">Chat-Bot</div><div className="bubble"><div className="typing" aria-label="Generating response"><i/><i/><i/></div></div></div></div>}
            </section>
          )}
        </div>

        <div className="composer-wrap">
          <form className="composer" onSubmit={handleSubmit}>
            <textarea aria-label="Customer message" rows={1} maxLength={5000} value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); handleSubmit(event); } }} placeholder="Write or paste a customer message…" />
            <div className="composer-foot"><span className="composer-hint">Enter to send · Shift + Enter for a new line</span><button className="send-button" type="submit" aria-label="Generate response" disabled={loading || !message.trim()}><Icon name="send" /></button></div>
          </form>
          <p className="status-line" role="status">{status}</p>
        </div>
      </main>
    </div>
  );
}
