import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  User,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function AuthPages({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    const endpoint = isLogin ? "/api/v1/auth/login" : "/api/v1/auth/signup";
    try {
      const response = await axios.post(endpoint, formData);
      if (isLogin) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("username", response.data.username);
        onAuthSuccess(response.data);
      } else {
        setSuccess("Account created! You can now sign in.");
        setTimeout(() => {
          setIsLogin(true);
          setSuccess("");
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Authentication session failed.");
      setFormData({ email: "", username: "", password: "" });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    "AI-powered insight generation",
    "Multi-format chart rendering",
    "Secure JWT-authenticated sessions",
    "Exportable PDF intelligence reports",
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#FAFBFC",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Left Branding Panel ── */}
      <div
        style={{
          width: "50%",
          background: "#111318",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle accent blob */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "360px",
            height: "360px",
            background:
              "radial-gradient(circle, rgba(124,143,245,0.18) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "-60px",
            width: "280px",
            height: "280px",
            background:
              "radial-gradient(circle, rgba(124,143,245,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "#7C8FF5",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(124,143,245,0.4)",
            }}
          >
            <Sparkles size={20} color="#fff" />
          </div>
          <span
            style={{
              fontSize: "20px",
              fontWeight: "800",
              color: "#fff",
              letterSpacing: "-0.03em",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Hypergrapher
          </span>
        </div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#7C8FF5",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            AI Analytics Platform
          </p>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: "800",
              color: "#fff",
              lineHeight: "1.15",
              letterSpacing: "-0.03em",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              marginBottom: "20px",
            }}
          >
            The intelligence layer for your structured data.
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "#8A8FA3",
              lineHeight: "1.7",
              marginBottom: "40px",
            }}
          >
            Transform raw CSV datasets into executive insights with
            enterprise-grade AI.
          </p>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    background: "rgba(124,143,245,0.2)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <CheckCircle2 size={12} color="#7C8FF5" />
                </div>
                <span style={{ fontSize: "14px", color: "#C8CBDA" }}>{f}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ShieldCheck size={14} color="#12B76A" />
          <span
            style={{ fontSize: "12px", color: "#5A5F72", fontWeight: "500" }}
          >
            BCrypt encrypted · JWT secured · H2 persisted
          </span>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 32px",
          position: "relative",
          background:
            "radial-gradient(1200px 600px at 100% 0%, rgba(124,143,245,0.08) 0%, transparent 60%), #FAFBFC",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: "100%",
            maxWidth: "440px",
            background: "#FFFFFF",
            border: "1px solid #ECEEF3",
            borderRadius: "20px",
            padding: "40px 36px",
            boxShadow:
              "0 1px 2px rgba(15,17,23,0.04), 0 24px 48px -24px rgba(15,17,23,0.18)",
          }}
        >
          {/* Segmented Tabs */}
          <div
            role="tablist"
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              background: "#F1F3F8",
              borderRadius: "12px",
              padding: "4px",
              marginBottom: "32px",
            }}
          >
            <motion.div
              aria-hidden="true"
              animate={{ x: isLogin ? 0 : "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              style={{
                position: "absolute",
                top: 4,
                left: 4,
                width: "calc(50% - 4px)",
                height: "calc(100% - 8px)",
                background: "#FFFFFF",
                borderRadius: "9px",
                boxShadow:
                  "0 1px 2px rgba(15,17,23,0.06), 0 4px 12px rgba(15,17,23,0.06)",
              }}
            />
            {[
              { label: "Sign In", val: true },
              { label: "Create Account", val: false },
            ].map((tab) => {
              const active = isLogin === tab.val;
              return (
                <button
                  key={tab.label}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setIsLogin(tab.val);
                    setError("");
                    setSuccess("");
                  }}
                  style={{
                    position: "relative",
                    zIndex: 1,
                    padding: "10px 12px",
                    borderRadius: "9px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "13.5px",
                    fontFamily: "inherit",
                    background: "transparent",
                    color: active ? "#0F1117" : "#7A7F94",
                    transition: "color 0.2s ease",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Heading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "h-login" : "h-signup"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              style={{ marginBottom: "28px" }}
            >
              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: "#0F1117",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  letterSpacing: "-0.03em",
                  marginBottom: "6px",
                  lineHeight: 1.2,
                }}
              >
                {isLogin ? "Welcome back" : "Create your workspace"}
              </h2>
              <p
                style={{
                  fontSize: "14px",
                  color: "#7A7F94",
                  lineHeight: 1.5,
                }}
              >
                {isLogin
                  ? "Sign in to continue to your analytics workspace."
                  : "Spin up a new account in under a minute."}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Error / Success */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  background: "#FEF3F2",
                  border: "1px solid #FECACA",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  overflow: "hidden",
                }}
              >
                <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: "13px", color: "#991B1B", fontWeight: 500 }}>
                  {error}
                </span>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  background: "#ECFDF3",
                  border: "1px solid #A7F3D0",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  overflow: "hidden",
                }}
              >
                <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: "13px", color: "#065F46", fontWeight: 500 }}>
                  {success}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <AnimatePresence initial={false}>
              {!isLogin && (
                <motion.div
                  key="email-field"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: "hidden" }}
                >
                  <AuthField
                    label="Email address"
                    icon={<Mail size={16} color="#9AA0B4" />}
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(v) => setFormData({ ...formData, email: v })}
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AuthField
              label="Username"
              icon={<User size={16} color="#9AA0B4" />}
              type="text"
              placeholder="j.smith"
              value={formData.username}
              onChange={(v) => setFormData({ ...formData, username: v })}
              required
            />

            <AuthField
              label="Password"
              icon={<Lock size={16} color="#9AA0B4" />}
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(v) => setFormData({ ...formData, password: v })}
              required
              trailing={
                isLogin && (
                  <button
                    type="button"
                    style={{
                      fontSize: "12px",
                      color: "#6366F1",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                      padding: 0,
                    }}
                  >
                    Forgot?
                  </button>
                )
              }
            />

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={!isLoading ? { y: -1 } : {}}
              whileTap={!isLoading ? { y: 0, scale: 0.99 } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              style={{
                marginTop: "8px",
                padding: "14px 18px",
                fontSize: "14px",
                fontWeight: 700,
                fontFamily: "inherit",
                borderRadius: "12px",
                border: "none",
                cursor: isLoading ? "not-allowed" : "pointer",
                background: "linear-gradient(180deg, #1F2230 0%, #0F1117 100%)",
                color: "#FFFFFF",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow:
                  "0 1px 2px rgba(15,17,23,0.2), 0 8px 20px -8px rgba(15,17,23,0.6)",
                opacity: isLoading ? 0.75 : 1,
                transition: "background 0.2s ease, opacity 0.2s ease",
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  <span>Authenticating…</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? "Sign in to workspace" : "Create account"}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer link */}
          <div
            style={{
              marginTop: "28px",
              paddingTop: "20px",
              borderTop: "1px solid #ECEEF3",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "13px", color: "#7A7F94" }}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setSuccess("");
                }}
                style={{
                  color: "#6366F1",
                  fontWeight: 700,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  padding: 0,
                  textDecoration: "underline",
                  textDecorationColor: "transparent",
                  textUnderlineOffset: "3px",
                  transition: "text-decoration-color 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.textDecorationColor = "#6366F1")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.textDecorationColor = "transparent")
                }
              >
                {isLogin ? "Sign up free" : "Sign in"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .hg-input {
          width: 100%;
          background: #FFFFFF;
          border: 1.5px solid #E4E7EE;
          border-radius: 10px;
          padding: 12px 14px 12px 40px;
          font-size: 14px;
          font-family: inherit;
          color: #0F1117;
          outline: none;
          transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
        }
        .hg-input::placeholder { color: #A8AEC2; }
        .hg-input:hover { border-color: #CDD2DD; }
        .hg-input:focus {
          border-color: #6366F1;
          box-shadow: 0 0 0 4px rgba(99,102,241,0.12);
          background: #FFFFFF;
        }
      `}</style>
    </div>
  );
}

function AuthField({
  label,
  icon,
  type,
  placeholder,
  value,
  onChange,
  required,
  trailing,
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "6px",
        }}
      >
        <label
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#3D4252",
            display: "block",
          }}
        >
          {label}
        </label>
        {trailing}
      </div>
      <div style={{ position: "relative" }}>
        <span
          style={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            display: "inline-flex",
            pointerEvents: "none",
          }}
        >
          {icon}
        </span>
        <input
          className="hg-input"
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          autoComplete={
            type === "password"
              ? "current-password"
              : type === "email"
              ? "email"
              : "username"
          }
        />
      </div>
    </div>
  );
}
