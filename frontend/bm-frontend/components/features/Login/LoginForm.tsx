// components/features/Login/LoginForm.tsx
import { useState } from "react";
import LoginUsernameStep from "./LoginUsernameStep";
import LoginPasswordStep from "./LoginPasswordStep";
import LoginOtpStep from "./LoginOtpStep";
import { Step } from "../../../hooks/useLogin";

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

const backgroundStyle: React.CSSProperties = {
  backgroundColor: "#E8F6F4",
  backgroundImage: `
    linear-gradient(135deg, #E8F6F4 0%, #D0EBE8 100%),
    url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+...")
  `,
  backgroundRepeat: "repeat",
  backgroundSize: "200px",
  backgroundBlendMode: "multiply, normal",
};

const cardStyle: React.CSSProperties = {
  maxWidth: "min(400px, 90vw)",
  width: "100%",
  borderRadius: "20px",
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  boxShadow:
    "0 15px 50px rgba(0, 77, 64, 0.1), 0 0 10px rgba(0, 0, 0, 0.05)",
};

const titleStyle: React.CSSProperties = {
  color: "#004D40",
  fontWeight: "700",
  fontSize: "2rem",
};

export default function LoginForm(props: LoginFormProps) {
  // ✅ Parent owns username (Option 2)
  const [username, setUsername] = useState("");

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={backgroundStyle}
    >
      <div className="card login-card p-4 p-md-5" style={cardStyle}>
        <h2 className="text-center mb-5" style={titleStyle}>
          BM Login
        </h2>

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
            verifyOtp={props.verifyOtp}
            setMessage={props.setMessage}
          />
        )}

        {/* MESSAGE */}
        {props.message && (
          <p
            className={`text-center mt-3 ${
              props.message.includes("Error")
                ? "text-danger"
                : "text-success"
            }`}
            style={{ fontSize: "0.9rem" }}
          >
            {props.message}
          </p>
        )}
      </div>
    </div>
  );
}