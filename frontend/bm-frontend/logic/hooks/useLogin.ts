import { useState, useCallback, useRef, useEffect } from "react";
import axios from "axios";
import { useAuthContext } from "../context/AuthContext";

export type Step = "role" | "password" | "otp";

export const useLogin = () => {
  const auth = useAuthContext();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // --- States ---
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<"renter" | "staff" | "">("");
  const [user, setUser] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Timer Logic for OTP ---
  const [resendTime, setResendTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    setResendTime(60);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setResendTime((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // --- Actions ---

  /**
   * Step 1: Detect User Role
   * Transition: 'role' -> 'password' (staff) OR 'otp' (renter)
   */
  const detectRole = useCallback(async (username: string) => {
    try {
      setLoading(true);
      setMessage("");
      const res = await axios.post(`${API_URL}/accounts/detect-role/`, {
        phone_or_email: username
      });

      const detectedRole = res.data.role;
      setUser(username);
      setRole(detectedRole);

      if (detectedRole === "renter") {
        setStep("otp");
        // For Renters, we trigger the OTP request immediately upon finding them
        await requestOtp(username);
      } else {
        setStep("password");
      }
    } catch (err: any) {
      setMessage(err.response?.data?.error || "User identity not found.");
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  /**
   * Action: Request OTP
   * Used for initial entry and 'Resend' button
   */
  const requestOtp = useCallback(async (usernameOverride?: string) => {
    try {
      setLoading(true);
      setMessage("");
      await axios.post(`${API_URL}/accounts/request-otp/`, {
        phone_or_email: usernameOverride || user
      });
      setMessage("Security code sent successfully!");
      startTimer();
    } catch (err: any) {
      setMessage("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user, API_URL, startTimer]);

  /**
   * Step 2 (Renter Path): Verify OTP
   */
  const verifyOtp = useCallback(async (otp: string) => {
    try {
      setLoading(true);
      setMessage("");
      const res = await axios.post(`${API_URL}/accounts/verify-otp/`, {
        phone_or_email: user,
        otp,
      });

      // Delegate session storage and redirection to AuthContext
      auth.login(res.data.access, res.data.refresh, "renter");
    } catch (err: any) {
      setMessage("Invalid security code.");
    } finally {
      setLoading(false);
    }
  }, [user, API_URL, auth]);

  /**
   * Step 2 (Staff Path): Password Login
   */
  const loginStaff = useCallback(async (username: string, password: string) => {
    try {
      setLoading(true);
      setMessage("");
      const res = await axios.post(`${API_URL}/accounts/token/`, {
        username,
        password
      });

      // Delegate session storage and redirection to AuthContext
      auth.login(res.data.access, res.data.refresh, "staff");
    } catch (err: any) {
      setMessage("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  }, [API_URL, auth]);

  /**
   * Action: Reset the entire flow
   */
  const reset = useCallback(() => {
    setStep("role");
    setRole("");
    setUser("");
    setMessage("");
    setResendTime(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  return {
    // States
    step,
    role,
    user,
    message,
    loading,
    resendTime,
    // Actions
    detectRole,
    requestOtp,
    verifyOtp,
    loginStaff,
    setMessage,
    reset,
  };
};