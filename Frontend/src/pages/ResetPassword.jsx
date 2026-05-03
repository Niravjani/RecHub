import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: "success" | "error", text: string }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (form.password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.message || "Reset failed. Link may have expired." });
      } else {
        setMessage({ type: "success", text: "Password reset successful! Redirecting to login..." });
        setTimeout(() => navigate("/login"), 2500);
      }
    } catch (err) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Reset Password</h2>
        <p style={styles.subtext}>Enter a new password for your account.</p>

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
          <label style={styles.label} htmlFor="password">
            New Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label style={styles.label} htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            placeholder="Re-enter password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Resetting..." : "Reset Password"}
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