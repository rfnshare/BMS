import { useState } from "react";

interface Props {
  loading: boolean;
  detectRole: (username: string) => Promise<void>;
  setMessage: (msg: string) => void;
  username?: string;
  onUsernameSubmit: (username: string) => void;
}

export default function LoginUsernameStep({
  loading,
  detectRole,
  setMessage,
  username: initialUsername = "",
  onUsernameSubmit,
}: Props) {
  const [username, setUsername] = useState(initialUsername);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    onUsernameSubmit(username);
    await detectRole(username);
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in px-1">
      {/* INPUT SECTION */}
      <div className="mb-4 position-relative">
        <label
          className="form-label fw-bold text-muted text-uppercase mb-2 px-1"
          style={{ fontSize: '0.7rem', letterSpacing: '0.8px' }}
        >
          Account Identity
        </label>

        <div className="position-relative">
          {/* Replacing emoji with a cleaner icon for consistent cross-platform rendering */}
          <span
            className="position-absolute top-50 start-0 translate-middle-y ps-3"
            style={{
                transition: 'color 0.3s',
                color: isFocused ? '#004D40' : '#9E9E9E',
                zIndex: 5
            }}
          >
            <i className="bi bi-person-circle fs-5"></i>
          </span>

          <input
            /* 🔥 MOBILE FIX: fontSize: 16px (1rem) prevents auto-zoom on mobile browsers */
            type="text"
            inputMode="email" /* 🔥 Opens a keyboard with '@' and '.' shortcuts */
            autoComplete="username"
            className="form-control border-2 shadow-none"
            style={{
              height: "58px",
              borderRadius: "16px",
              paddingLeft: "48px",
              fontSize: "1rem",
              backgroundColor: isFocused ? "#fff" : "#F8FDFD",
              borderColor: isFocused ? "#004D40" : "#E0F2F1",
              transition: "all 0.2s ease",
            }}
            placeholder="Phone, Email, or Username"
            value={username}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
        </div>
      </div>

      {/* ACTION BUTTON */}
      <button
        type="submit"
        className="btn btn-lg w-100 shadow-sm border-0 d-flex align-items-center justify-content-center"
        style={{
          height: "58px",
          borderRadius: "16px",
          backgroundColor: "#004D40",
          color: "#fff",
          fontWeight: "700",
          fontSize: "1.1rem",
          transition: "background-color 0.2s"
        }}
        disabled={loading || !username}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-3" role="status"></span>
            Checking...
          </>
        ) : (
          "Continue"
        )}
      </button>

      {/* ADDITIONAL INFO - Simplified for small screens */}
      <div className="text-center mt-4">
        <p className="text-muted mb-0" style={{ fontSize: '0.75rem', lineHeight: '1.5' }}>
          New here? <span className="text-primary fw-bold">Request Access</span>
        </p>
      </div>
    </form>
  );
}