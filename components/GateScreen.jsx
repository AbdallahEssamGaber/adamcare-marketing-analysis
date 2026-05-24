import { useState } from "react";

export default function GateScreen({ onLogin }) {
  const [keyInput, setKeyInput] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const result = await onLogin(keyInput);
    if (!result.ok) setError(result.error);
    setSubmitting(false);
  }

  return (
    <div className="gate">
      <h1>foradam.care</h1>
      <p>Enter your access key to continue</p>
      <form className="gate-input" onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Access key"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          autoFocus
        />
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? "..." : "Enter"}
        </button>
      </form>
      {error && <p className="gate-error">{error}</p>}
    </div>
  );
}
