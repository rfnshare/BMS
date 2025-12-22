import { useLogin } from "../../../logic/hooks/useLogin";
import LoginUsernameStep from "./LoginUsernameStep";
import LoginPasswordStep from "./LoginPasswordStep";
import LoginOtpStep from "./LoginOtpStep";

export default function LoginForm() {
  // 1. All Data & Actions come from the Hook
  const {
    step,
    user,
    message,
    loading,
    resendTime,
    detectRole,
    requestOtp,
    verifyOtp,
    loginStaff,
    setMessage,
    reset
  } = useLogin();

  // --- MOBILE-FRIENDLY STYLES ---
  const containerStyle: React.CSSProperties = {
    backgroundColor: "#f0f9f8",
    backgroundImage: `
      radial-gradient(at 0% 0%, rgba(0, 77, 64, 0.05) 0, transparent 50%),
      radial-gradient(at 100% 100%, rgba(0, 150, 136, 0.1) 0, transparent 50%)
    `,
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
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
    padding: "2rem",
  };

  const getStepDescription = () => {
    if (step === "role") return "Enter your credentials to continue";
    if (step === "password") return `Logging in as ${user}`;
    if (step === "otp") return "Enter the code sent to your phone";
    return "";
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle} className="shadow-lg">
        {/* BRANDING HEADER */}
        <div className="text-center">
          <div className="mb-3 d-inline-flex align-items-center justify-content-center rounded-circle" style={{width: '60px', height: '60px', backgroundColor: '#E0F2F1'}}>
             <i className="bi bi-building-lock text-primary fs-2"></i>
          </div>
          <h2 className="fw-bold mb-1" style={{ color: "#004D40", fontSize: '1.8rem' }}>BM Portal</h2>
          <p className="mb-4" style={{ color: "#607D8B", fontSize: "0.9rem" }}>{getStepDescription()}</p>
        </div>

        {/* STEP CONTENT SWITCHER */}
        <div className="login-step-container">
          {step === "role" && (
            <LoginUsernameStep
              loading={loading}
              detectRole={detectRole}
              setMessage={setMessage}
              onUsernameSubmit={() => {}} // Hook handles the 'user' state now
            />
          )}

          {step === "password" && (
            <LoginPasswordStep
              loading={loading}
              username={user}
              loginStaff={loginStaff}
              setMessage={setMessage}
              // Instead of window.location.reload, use our hook's reset
              onBack={reset}
            />
          )}

          {step === "otp" && (
            <LoginOtpStep
              loading={loading}
              resendTime={resendTime}
              requestOtp={requestOtp}
              verifyOtp={verifyOtp}
              setMessage={setMessage}
            />
          )}
        </div>

        {/* DYNAMIC FEEDBACK MESSAGE */}
        {message && (
          <div
            className={`mt-4 p-3 rounded-4 text-center small fw-bold animate__animated animate__fadeInUp ${
              message.toLowerCase().includes("error") || 
              message.toLowerCase().includes("failed") || 
              message.toLowerCase().includes("invalid")
                ? "bg-danger-subtle text-danger border border-danger-subtle"
                : "bg-success-subtle text-success border border-success-subtle"
            }`}
          >
            {message}
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-4 pt-3 text-center border-top border-light">
          <p className="text-muted mb-0" style={{ fontSize: '0.7rem' }}>
            &copy; 2025 BMS Portal • Secure Session
          </p>
        </div>
      </div>
    </div>
  );
}