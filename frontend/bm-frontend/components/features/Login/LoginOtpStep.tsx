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

  // Locks the initial request to prevent double execution
  const hasRequestedInitial = useRef(false);

  const combinedOtp = otpDigits.join("");
  const isOtpComplete = combinedOtp.length === otpLength;

  const [resendTime, setResendTime] = useState(60);

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTime > 0) {
      timer = setInterval(() => setResendTime((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTime]);

  // Trigger initial OTP request
  useEffect(() => {
    if (!hasRequestedInitial.current) {
      requestOtp();
      hasRequestedInitial.current = true;
    }
  }, [requestOtp]);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    // 🔥 MOBILE FIX: Get the last character to handle auto-fill and paste better
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
    if (loading) return;
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
    <form onSubmit={handleSubmit} className="px-1">
      {/* OTP INPUT GROUP */}
      <div className="d-flex justify-content-between gap-1 gap-md-2 mb-4">
        {otpDigits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { otpInputRefs.current[i] = el; }}
            type="tel" // 🔥 Forces numeric keypad on mobile
            inputMode="numeric" // 🔥 Better compatibility for Android/iOS numeric keyboard
            autoComplete="one-time-code" // 🔥 Helps iOS auto-fill OTP from SMS
            pattern="\d*"
            maxLength={1}
            value={digit}
            onFocus={() => setActiveIdx(i)}
            onChange={(e) => handleOtpChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className="form-control text-center p-0"
            disabled={loading}
            style={{
              width: "100%", // 🔥 Responsive width
              maxWidth: "48px",
              height: "56px",
              borderRadius: "14px",
              fontSize: "1.4rem",
              fontWeight: "700",
              color: "#004D40",
              border: activeIdx === i ? "2px solid #004D40" : "2px solid #E0E0E0",
              backgroundColor: activeIdx === i ? "#fff" : "#F5FBF9",
              boxShadow: activeIdx === i ? "0 4px 12px rgba(0, 77, 64, 0.12)" : "none",
              transition: "all 0.15s ease",
              opacity: loading ? 0.6 : 1
            }}
            required
          />
        ))}
      </div>

      {/* TIMER & RESEND SECTION */}
      <div className="mb-4 text-center">
        {resendTime > 0 ? (
          <div className="badge bg-light text-muted border px-3 py-2 rounded-pill">
            Resend in <span className="text-dark fw-bold">{resendTime}s</span>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-link btn-sm text-decoration-none fw-bold p-0"
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
        className={`btn btn-lg w-100 py-3 rounded-pill transition-all ${
            isOtpComplete && !loading ? "btn-primary shadow" : "btn-light border text-muted"
        }`}
        style={{
            fontWeight: "700",
            backgroundColor: isOtpComplete && !loading ? "#004D40" : "",
            borderColor: isOtpComplete && !loading ? "#004D40" : "",
            fontSize: "1rem"
        }}
        disabled={loading || !isOtpComplete}
      >
        {loading ? (
          <div className="d-flex align-items-center justify-content-center">
            <span className="spinner-border spinner-border-sm me-2"></span>
            Verifying...
          </div>
        ) : "Secure Login"}
      </button>

      <div className="mt-4 text-center">
        <p className="text-muted x-small mb-0 px-2" style={{ lineHeight: '1.4' }}>
          <i className="bi bi-shield-check me-1"></i>
          We've sent a 6-digit security code to your registered device.
        </p>
      </div>
    </form>
  );
}