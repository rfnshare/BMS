import { useState, useRef } from "react";

interface Props {
  loading: boolean;
  resendTime: number; // ✅ Now provided by hook
  requestOtp: () => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  setMessage: (msg: string) => void;
}

export default function LoginOtpStep({
  loading,
  resendTime,
  requestOtp,
  verifyOtp,
  setMessage
}: Props) {
  const otpLength = 6;
  const [otpDigits, setOtpDigits] = useState(new Array(otpLength).fill(""));
  const [activeIdx, setActiveIdx] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const combinedOtp = otpDigits.join("");
  const isOtpComplete = combinedOtp.length === otpLength;

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value.slice(-1);
    if (!/^\d*$/.test(val)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = val;
    setOtpDigits(newDigits);

    if (val && index < otpLength - 1) {
      otpInputRefs.current[index + 1]?.focus();
      setActiveIdx(index + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
      setActiveIdx(index - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setMessage('');
    if (isOtpComplete) await verifyOtp(combinedOtp);
  };

  const handleResend = () => {
    if (loading || resendTime > 0) return;
    setMessage('');
    requestOtp();
  };

  return (
    <form onSubmit={handleSubmit} className="px-1">
      <div className="d-flex justify-content-between gap-1 gap-md-2 mb-4">
        {otpDigits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { otpInputRefs.current[i] = el; }}
            type="tel"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit}
            onFocus={() => setActiveIdx(i)}
            onChange={(e) => handleOtpChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className="form-control text-center p-0"
            disabled={loading}
            style={{
              width: "100%",
              maxWidth: "48px",
              height: "56px",
              borderRadius: "14px",
              fontSize: "1.4rem",
              fontWeight: "700",
              color: "#004D40",
              border: activeIdx === i ? "2px solid #004D40" : "2px solid #E0E0E0",
              backgroundColor: activeIdx === i ? "#fff" : "#F5FBF9",
              transition: "all 0.15s ease",
            }}
          />
        ))}
      </div>

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

      <button
        type="submit"
        className={`btn btn-lg w-100 py-3 rounded-pill transition-all ${
            isOtpComplete && !loading ? "btn-primary shadow" : "btn-light border text-muted"
        }`}
        style={{
            fontWeight: "700",
            backgroundColor: isOtpComplete && !loading ? "#004D40" : "",
            borderColor: isOtpComplete && !loading ? "#004D40" : "",
        }}
        disabled={loading || !isOtpComplete}
      >
        {loading ? "Verifying..." : "Secure Login"}
      </button>
    </form>
  );
}