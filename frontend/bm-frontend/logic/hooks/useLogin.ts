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
   * Action: Request OTP
   * Extracted to be used by detectRole and the Resend button.
   * Logic: Only moves to 'otp' step if the backend allows it (Status check).
   */
  const requestOtp = useCallback(async (usernameOverride?: string) => {
    const targetUser = usernameOverride || user;
    try {
      setLoading(true);
      setMessage("");

      await axios.post(`${API_URL}/accounts/request-otp/`, {
        phone_or_email: targetUser
      });

      // ✅ SUCCESS: Move to OTP entry
      setStep("otp");
      setMessage("Security code sent successfully!");
      startTimer();
    } catch (err: any) {
      // ❌ FAIL: Handle Inactive Renter (403) or Not Found (404)
      const backendError = err.response?.data?.error || err.response?.data?.detail;
      setMessage(backendError || "Failed to send OTP. Please try again.");

      // Ensure we stay on 'role' step so they can fix their input
      setStep("role");
    } finally {
      setLoading(false);
    }
  }, [user, API_URL, startTimer]);

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
        // If renter is found, we immediately attempt to send OTP.
        // requestOtp handles the 'Inactive' check and step transition.
        await requestOtp(username);
      } else if (detectedRole === "staff") {
        setStep("password");
      } else {
        setMessage("Access restricted for this account type.");
      }
    } catch (err: any) {
      const backendError = err.response?.data?.error || err.response?.data?.detail;
      setMessage(backendError || "User identity not found.");
    } finally {
      setLoading(false);
    }
  }, [API_URL, requestOtp]);

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
      const backendError = err.response?.data?.error || err.response?.data?.detail;
      setMessage(backendError || "Invalid security code.");
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

      auth.login(res.data.access, res.data.refresh, "staff");
    } catch (err: any) {
      const backendError = err.response?.data?.error || err.response?.data?.detail;
      setMessage(backendError || "Invalid username or password.");
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
    step,
    role,
    user,
    message,
    loading,
    resendTime,
    detectRole,
    requestOtp,
    verifyOtp,
    loginStaff,
    setMessage,
    reset,
  };
};