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
    <form onSubmit={handleSubmit} className="animate-fade-in">
      {/* INPUT SECTION */}
      <div className="mb-4 position-relative">
        <label className="form-label fw-bold small text-muted text-uppercase mb-2 px-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
          Account Identity
        </label>
        <div className="position-relative">
          <span 
            className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted"
            style={{ transition: 'color 0.3s', color: isFocused ? '#004D40' : '#ADB5BD' }}
          >
            👤
          </span>
          <input
            type="text"
            className="form-control border-2 shadow-none"
            style={{
              height: "60px",
              borderRadius: "14px",
              paddingLeft: "45px",
              fontSize: "1.05rem",
              backgroundColor: isFocused ? "#fff" : "#F8FDFD",
              borderColor: isFocused ? "#004D40" : "#E0F2F1",
              transition: "all 0.3s ease",
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
        className="btn btn-lg w-100 shadow-sm border-0 mb-3"
        style={{
          height: "60px",
          borderRadius: "14px",
          backgroundColor: "#004D40",
          color: "#fff",
          fontWeight: "700",
          letterSpacing: "0.5px",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        disabled={loading}
      >
        {loading ? (
          <div className="d-flex align-items-center justify-content-center">
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            <span>Verifying...</span>
          </div>
        ) : (
          "Continue"
        )}
      </button>

      {/* ADDITIONAL INFO */}
      <div className="text-center mt-2 px-2">
        <p className="text-muted" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
          By continuing, you agree to our <b>Terms</b> and <b>Security Protocols</b>.
        </p>
      </div>
    </form>
  );
}