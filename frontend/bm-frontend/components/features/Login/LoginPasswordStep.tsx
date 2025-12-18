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
    <form onSubmit={handleSubmit} className="animate-fade-in">
      {/* USER CONTEXT (Breadcrumb) */}
      <div className="d-flex justify-content-between align-items-center mb-3 px-1">
        <span className="text-muted small">
          Password for <b className="text-dark">{username}</b>
        </span>
        <button 
          type="button" 
          className="btn btn-link btn-sm p-0 text-decoration-none fw-bold"
          style={{ color: "#00796B", fontSize: "0.8rem" }}
          onClick={() => window.location.reload()} // Simple way to reset to step 1
        >
          Not you?
        </button>
      </div>

      {/* PASSWORD INPUT GROUP */}
      <div className="mb-4 position-relative">
        <input
          type={showPassword ? "text" : "password"}
          className="form-control border-2 shadow-none"
          style={{ 
            height: "55px", 
            borderRadius: "12px", 
            paddingRight: "50px",
            fontSize: "1rem",
            borderColor: "#E0F2F1",
            backgroundColor: "#F8FDFD"
          }}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="button"
          className="position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent pe-3 text-muted"
          onClick={() => setShowPassword(!showPassword)}
          style={{ zIndex: 5 }}
        >
          {showPassword ? "👁️‍🗨️" : "👁️"}
        </button>
      </div>

      {/* LOGIN BUTTON */}
      <button
        type="submit"
        className="btn btn-lg w-100 shadow-sm border-0"
        style={{ 
          height: "55px", 
          borderRadius: "12px", 
          backgroundColor: "#004D40", 
          color: "#fff",
          fontWeight: "700",
          transition: "transform 0.2s, box-shadow 0.2s"
        }}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2"></span>
            Authenticating...
          </>
        ) : (
          "Verify & Enter"
        )}
      </button>

      {/* SECURITY HINT */}
      <div className="mt-4 text-center">
        <p className="text-muted" style={{ fontSize: "0.85rem" }}>
          Forgot password? <span className="fw-bold text-dark cursor-pointer" style={{ cursor: "pointer" }}>Contact Admin</span>
        </p>
      </div>
    </form>
  );
}