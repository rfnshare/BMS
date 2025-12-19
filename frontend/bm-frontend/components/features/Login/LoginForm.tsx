import { useState } from "react";
import LoginUsernameStep from "./LoginUsernameStep";
import LoginPasswordStep from "./LoginPasswordStep";
import LoginOtpStep from "./LoginOtpStep";
import {Step} from "../../../logic/hooks/useLogin";


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

// Modernized Background with an animated "Glow" feel
const backgroundStyle: React.CSSProperties = {
  backgroundColor: "#f0f9f8",
  backgroundImage: `
    radial-gradient(at 0% 0%, rgba(0, 77, 64, 0.05) 0, transparent 50%),
    radial-gradient(at 100% 100%, rgba(0, 150, 136, 0.1) 0, transparent 50%)
  `,
  height: "100vh",
  width: "100vw",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const cardStyle: React.CSSProperties = {
  maxWidth: "420px",
  width: "90%",
  borderRadius: "24px",
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.05)",
  padding: "2.5rem",
  transition: "all 0.3s ease-in-out",
};

const titleStyle: React.CSSProperties = {
  color: "#004D40",
  fontWeight: "800",
  fontSize: "2.25rem",
  letterSpacing: "-0.5px",
  marginBottom: "0.5rem",
};

const subtitleStyle: React.CSSProperties = {
  color: "#607D8B",
  fontSize: "0.95rem",
  marginBottom: "2.5rem",
};

export default function LoginForm(props: LoginFormProps) {
  const [username, setUsername] = useState("");

  // Helper to determine step description
  const getStepDescription = () => {
    if (props.step === "role") return "Enter your credentials to continue";
    if (props.step === "password") return `Logging in as ${username}`;
    if (props.step === "otp") return "Enter the code sent to your phone";
    return "";
  };

  return (
    <div style={backgroundStyle}>
      <div style={cardStyle}>
        {/* BRANDING HEADER */}
        <div className="text-center">
          <h2 style={titleStyle}>BM Portal</h2>
          <p style={subtitleStyle}>{getStepDescription()}</p>
        </div>

        {/* STEP CONTENT WITH TRANSITION WRAPPER */}
        <div className="login-step-container">
          {/* USERNAME STEP */}
          {props.step === "role" && (
            <LoginUsernameStep
              loading={props.loading}
              detectRole={props.detectRole}
              setMessage={props.setMessage}
              username={username}
              onUsernameSubmit={setUsername}
            />
          )}

          {/* PASSWORD STEP */}
          {props.step === "password" && (
            <LoginPasswordStep
              loading={props.loading}
              username={username}
              loginStaff={props.loginStaff}
              setMessage={props.setMessage}
            />
          )}


          {/* OTP STEP */}
{props.step === "otp" && (
  <LoginOtpStep
    loading={props.loading}
    requestOtp={props.requestOtp} // 👈 THIS WAS MISSING
    verifyOtp={props.verifyOtp}
    setMessage={props.setMessage}
  />
)}
        </div>

        {/* FEEDBACK MESSAGE */}
        {props.message && (
          <div
            className={`mt-4 p-3 rounded-3 text-center small fw-medium transition-all ${
              props.message.toLowerCase().includes("error") || props.message.toLowerCase().includes("failed")
                ? "bg-danger-subtle text-danger border border-danger-subtle"
                : "bg-success-subtle text-success border border-success-subtle"
            }`}
          >
            {props.message}
          </div>
        )}

        {/* FOOTER INFO */}
        <div className="mt-5 text-center">
          <p className="text-muted small mb-0">
            &copy; 2025 Building Management System
          </p>
        </div>
      </div>
    </div>
  );
}