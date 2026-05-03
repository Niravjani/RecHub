import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: "success" | "error", text: string }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      // Always show generic message to prevent user enumeration
      setMessage({
        type: "success",
        text: data.message || "If an account exists, a reset link has been sent.",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Forgot Password</h2>
        <p style={styles.subtext}>
          Enter your email and we'll send you a reset link.
        </p>

        {message && (
          <div
            style={{
              ...styles.alert,
              ...(message.type === "success" ? styles.alertSuccess : styles.alertError),
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label} htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <a href="/login" style={styles.backLink}>
          ← Back to Login
        </a>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    padding: "1rem",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    padding: "2rem",
    width: "100%",
    maxWidth: "420px",
  },
  heading: {
    fontSize: "22px",
    fontWeight: "600",
    margin: "0 0 0.5rem",
    color: "#111",
  },
  subtext: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0 0 1.5rem",
  },
  alert: {
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    fontSize: "14px",
    marginBottom: "1rem",
  },
  alertSuccess: {
    backgroundColor: "#f0fdf4",
    color: "#166534",
    border: "1px solid #bbf7d0",
  },
  alertError: {
    backgroundColor: "#fef2f2",
    color: "#991b1b",
    border: "1px solid #fecaca",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
  },
  input: {
    padding: "0.625rem 0.875rem",
    fontSize: "15px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    color: "#111",
  },
  button: {
    marginTop: "0.5rem",
    padding: "0.7rem",
    fontSize: "15px",
    fontWeight: "500",
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  backLink: {
    display: "block",
    marginTop: "1.25rem",
    fontSize: "14px",
    color: "#6b7280",
    textDecoration: "none",
    textAlign: "center",
  },
};