// components/features/Login/LoginOtpStep.tsx
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
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const combinedOtp = otpDigits.join("");
  const isOtpComplete = combinedOtp.length === otpLength;

  const [resendTime, setResendTime] = useState(60); // Start the timer immediately
  const [initialRequestSent, setInitialRequestSent] = useState(false);

  // Effect for the countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTime > 0) {
      timer = setInterval(() => setResendTime((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTime]);

  // Initial OTP request on mount
  useEffect(() => {
    if (!initialRequestSent) {
      requestOtp();
      setInitialRequestSent(true);
    }
  }, [initialRequestSent, requestOtp]);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value.slice(-1);
    if (!/^\d*$/.test(val)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = val;
    setOtpDigits(newDigits);

    // Auto-focus logic
    if (val && index < otpLength - 1) otpInputRefs.current[index + 1]?.focus();
    else if (!val && index > 0 && e.nativeEvent.inputType === 'deleteContentBackward') {
        otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Handle backspace to move to the previous field
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages
    if (isOtpComplete) await verifyOtp(combinedOtp);
  };

  const handleResend = () => {
    setMessage('');
    requestOtp();
    setResendTime(60);
  };

  const inputStyle: React.CSSProperties = {
    // We use a flexible width (vw) and min/max limits
    width: "min(45px, 12vw)",
    height: "55px",
    borderRadius: "10px",
    border: "1px solid #E0E0E0",
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#004D40",
    // Smaller margin on very small screens, thanks to the fixed width
    margin: "0 3px",
    boxShadow: 'none',
    transition: 'border-color 0.2s',
  };

  const buttonStyle: React.CSSProperties = {
    height: "55px",
    borderRadius: "10px",
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
    fontWeight: "600",
  };

 return (
    <form onSubmit={handleSubmit}>
      <p className="text-center text-muted mb-4" style={{ fontSize: '0.9rem' }}>
        Please enter the 6-digit code sent to your registered contact.
      </p>

      {/* Using 'justify-content-center' with small margins ensures they stay
        centered and fit well on small screens.
      */}
      <div className="d-flex justify-content-center mb-4">
        {otpDigits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (otpInputRefs.current[i] = el)}
            type="tel"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className="form-control text-center"
            style={inputStyle}
            required
          />
        ))}
      </div>
      <div className="mb-4 text-center">
        <button type="button" className="btn btn-link p-0" onClick={handleResend} disabled={resendTime > 0} style={{ color: resendTime > 0 ? '#B0BEC5' : '#4CAF50', fontWeight: '500' }}>
          {resendTime > 0 ? `Resend code in ${resendTime}s` : "Resend OTP"}
        </button>
      </div>
      <button className="btn w-100 text-white" style={buttonStyle} disabled={loading || !isOtpComplete}>
        {loading ? "Verifying..." : "Verify OTP"}
      </button>
    </form>
  );
}