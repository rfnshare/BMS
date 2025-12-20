import { useState } from "react";
import LoginUsernameStep from "./LoginUsernameStep";
import LoginPasswordStep from "./LoginPasswordStep";
import LoginOtpStep from "./LoginOtpStep";
import { Step } from "../../../logic/hooks/useLogin";

interface LoginFormProps {
  step: Step;
  loading: boolean;
  message: string;
  detectRole: (username: string) => Promise<void>;
  requestOtp: () => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  loginStaff: (username: string, password: string) => Promise<void>;
  setMessage: (msg: string) => void;
}

export default function LoginForm(props: LoginFormProps) {
  const [username, setUsername] = useState("");

  // --- MOBILE-FRIENDLY STYLES ---
  const containerStyle: React.CSSProperties = {
    backgroundColor: "#f0f9f8",
    backgroundImage: `
      radial-gradient(at 0% 0%, rgba(0, 77, 64, 0.05) 0, transparent 50%),
      radial-gradient(at 100% 100%, rgba(0, 150, 136, 0.1) 0, transparent 50%)
    `,
    minHeight: "100vh", // Use minHeight so it can grow if keyboard pops up
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px", // Prevents card from touching screen edges on mobile
  };

  const cardStyle: React.CSSProperties = {
    maxWidth: "420px",
    width: "100%",
    borderRadius: "28px",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
    padding: "2rem", // Slightly reduced padding for mobile comfort
    transition: "all 0.3s ease",
  };

  const titleStyle: React.CSSProperties = {
    color: "#004D40",
    fontWeight: "800",
    fontSize: "1.8rem", // Slightly smaller for mobile scaling
    letterSpacing: "-0.5px",
    marginBottom: "0.25rem",
  };

  const subtitleStyle: React.CSSProperties = {
    color: "#607D8B",
    fontSize: "0.9rem",
    marginBottom: "2rem",
  };

  const getStepDescription = () => {
    if (props.step === "role") return "Enter your credentials to continue";
    if (props.step === "password") return `Logging in as ${username}`;
    if (props.step === "otp") return "Enter the code sent to your phone";
    return "";
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle} className="shadow-lg">
        {/* BRANDING HEADER */}
        <div className="text-center">
          {/* Icon/Logo Placeholder for better Mobile UI */}
          <div className="mb-3 d-inline-flex align-items-center justify-content-center bg-teal-100 rounded-circle" style={{width: '60px', height: '60px', backgroundColor: '#E0F2F1'}}>
             <i className="bi bi-building-lock text-primary fs-2"></i>
          </div>
          <h2 style={titleStyle}>BM Portal</h2>
          <p style={subtitleStyle}>{getStepDescription()}</p>
        </div>

        {/* STEP CONTENT */}
        <div className="login-step-container">
          {props.step === "role" && (
            <LoginUsernameStep
              loading={props.loading}
              detectRole={props.detectRole}
              setMessage={props.setMessage}
              username={username}
              onUsernameSubmit={setUsername}
            />
          )}

          {props.step === "password" && (
            <LoginPasswordStep
              loading={props.loading}
              username={username}
              loginStaff={props.loginStaff}
              setMessage={props.setMessage}
            />
          )}

          {props.step === "otp" && (
            <LoginOtpStep
              loading={props.loading}
              requestOtp={props.requestOtp}
              verifyOtp={props.verifyOtp}
              setMessage={props.setMessage}
            />
          )}
        </div>

        {/* FEEDBACK MESSAGE */}
        {props.message && (
          <div
            className={`mt-4 p-3 rounded-4 text-center small fw-bold animate__animated animate__headShake ${
              props.message.toLowerCase().includes("error") || props.message.toLowerCase().includes("failed") || props.message.toLowerCase().includes("not found")
                ? "bg-danger-subtle text-danger border border-danger-subtle"
                : "bg-success-subtle text-success border border-success-subtle"
            }`}
          >
            {props.message}
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-4 pt-2 text-center border-top border-light">
          <p className="text-muted" style={{ fontSize: '0.75rem' }}>
            By continuing, you agree to our <span className="text-primary">Terms</span> and <span className="text-primary">Security Protocols</span>.
          </p>
          <p className="text-muted mt-3 mb-0" style={{ fontSize: '0.7rem' }}>
            &copy; 2025 BMS Portal
          </p>
        </div>
      </div>
    </div>
  );
}