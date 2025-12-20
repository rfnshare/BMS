import { useState } from "react";

interface Props {
  loading: boolean;
  username: string;
  loginStaff: (username: string, password: string) => Promise<void>;
  setMessage: (msg: string) => void;
}

export default function LoginPasswordStep({
  loading,
  username,
  loginStaff,
  setMessage,
}: Props) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    await loginStaff(username, password);
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in px-1">
      {/* USER CONTEXT (Breadcrumb) */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex flex-column">
          <span className="text-muted" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>PASSWORD FOR</span>
          <span className="text-dark fw-bold small truncate" style={{ maxWidth: '150px' }}>{username}</span>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm rounded-pill px-3 border-opacity-25"
          style={{ fontSize: "0.75rem" }}
          onClick={() => window.location.reload()}
        >
          Change User
        </button>
      </div>

      {/* PASSWORD INPUT GROUP */}
      <div className="mb-4 position-relative">
        <input
          /* 🔥 MOBILE FIX: Setting fontSize to 16px (1rem) prevents iOS auto-zoom */
          type={showPassword ? "text" : "password"}
          inputMode="text"
          autoComplete="current-password"
          className="form-control border-2 shadow-none"
          style={{
            height: "58px",
            borderRadius: "14px",
            paddingRight: "55px",
            fontSize: "1rem",
            borderColor: "#E0F2F1",
            backgroundColor: "#F8FDFD",
            transition: "border-color 0.2s"
          }}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {/* 🔥 TOUCH TARGET: Increased padding and width for easier tapping */}
        <button
          type="button"
          className="position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent h-100 px-3 d-flex align-items-center justify-content-center"
          onClick={() => setShowPassword(!showPassword)}
          style={{ zIndex: 5, width: "50px" }}
        >
          <i className={`bi bi-${showPassword ? "eye-slash" : "eye"} fs-5 text-muted`}></i>
        </button>
      </div>

      {/* LOGIN BUTTON */}
      <button
        type="submit"
        className="btn btn-lg w-100 shadow-sm border-0 d-flex align-items-center justify-content-center"
        style={{
          height: "58px",
          borderRadius: "14px",
          backgroundColor: "#004D40",
          color: "#fff",
          fontWeight: "700",
          fontSize: "1.1rem"
        }}
        disabled={loading || !password}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-3" role="status"></span>
            Checking...
          </>
        ) : (
          "Unlock Portal"
        )}
      </button>

      {/* SECURITY HINT */}
      <div className="mt-4 text-center">
        <button
          type="button"
          className="btn btn-link btn-sm text-decoration-none text-muted p-0"
          style={{ fontSize: "0.85rem" }}
        >
          Forgot password? <span className="fw-bold text-dark">Contact Admin</span>
        </button>
      </div>
    </form>
  );
}