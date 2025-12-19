import { useState, useRef, useEffect } from "react";

interface Props {
  loading: boolean;
  requestOtp: () => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  setMessage: (msg: string) => void;
}

export default function LoginOtpStep({ loading, requestOtp, verifyOtp, setMessage }: Props) {
  const otpLength = 6;
  const [otpDigits, setOtpDigits] = useState(new Array(otpLength).fill(""));
  const [activeIdx, setActiveIdx] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // TEACHING POINT: We use useRef here instead of useState because useRef
  // updates immediately (synchronously). This is what stops the double OTP email.
  const hasRequestedInitial = useRef(false);

  const combinedOtp = otpDigits.join("");
  const isOtpComplete = combinedOtp.length === otpLength;

  const [resendTime, setResendTime] = useState(60);

  // Timer logic for the Resend button
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTime > 0) {
      timer = setInterval(() => setResendTime((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTime]);

  // FIX: The Initial Request Trigger
  useEffect(() => {
    if (!hasRequestedInitial.current) {
      requestOtp();
      hasRequestedInitial.current = true; // Locks the function immediately
    }
  }, [requestOtp]);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value.slice(-1);
    if (!/^\d*$/.test(val)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = val;
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (val && index < otpLength - 1) {
      otpInputRefs.current[index + 1]?.focus();
      setActiveIdx(index + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
        setActiveIdx(index - 1);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple submissions
    setMessage('');
    if (isOtpComplete) await verifyOtp(combinedOtp);
  };

  const handleResend = () => {
    if (loading) return;
    setMessage('');
    requestOtp();
    setResendTime(60);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* OTP INPUT GROUP */}
      <div className="d-flex justify-content-between mb-4">
        {otpDigits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { otpInputRefs.current[i] = el; }}
            type="tel"
            maxLength={1}
            value={digit}
            onFocus={() => setActiveIdx(i)}
            onChange={(e) => handleOtpChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className="form-control text-center p-0"
            disabled={loading} // Disable inputs during verification
            style={{
              width: "min(48px, 13vw)",
              height: "60px",
              borderRadius: "12px",
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#004D40",
              border: activeIdx === i ? "2px solid #004D40" : "2px solid #E0E0E0",
              backgroundColor: activeIdx === i ? "#fff" : "#f8fdfc",
              boxShadow: activeIdx === i ? "0 0 10px rgba(0, 77, 64, 0.1)" : "none",
              transition: "all 0.2s ease",
              opacity: loading ? 0.6 : 1
            }}
            required
          />
        ))}
      </div>

      {/* TIMER & RESEND SECTION */}
      <div className="mb-4 text-center">
        {resendTime > 0 ? (
          <p className="text-muted small">
            Resend code available in <span className="fw-bold text-dark">{resendTime}s</span>
          </p>
        ) : (
          <button
            type="button"
            className="btn btn-link btn-sm text-decoration-none fw-bold"
            onClick={handleResend}
            disabled={loading}
            style={{ color: "#00796B" }}
          >
            Didn't receive code? Resend Now
          </button>
        )}
      </div>

      {/* SUBMIT BUTTON */}
      <button
        type="submit"
        className={`btn btn-lg w-100 py-3 rounded-3 shadow-sm transition-all ${
            isOtpComplete && !loading ? "btn-primary shadow" : "btn-light border text-muted"
        }`}
        style={{
            fontWeight: "700",
            backgroundColor: isOtpComplete && !loading ? "#004D40" : "",
            borderColor: isOtpComplete && !loading ? "#004D40" : ""
        }}
        disabled={loading || !isOtpComplete}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2"></span>
            Verifying...
          </>
        ) : "Verify & Log In"}
      </button>

      <p className="mt-4 text-center text-muted small px-3">
        Checking your security. We sent a code to your registered device.
      </p>
    </form>
  );
}