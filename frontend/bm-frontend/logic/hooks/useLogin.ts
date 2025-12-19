import { useState, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export type Step = "role" | "password" | "otp";

export const useLogin = () => {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<"renter" | "staff" | "">("");
  const [user, setUser] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Helper for consistent error messages ---
  const getErrorMessage = (err: any) => {
    return (
      err.response?.data?.error ||
      err.response?.data?.detail ||
      (typeof err.response?.data === "string" ? err.response.data : "") ||
      "An unexpected error occurred"
    );
  };

  // TEACHING POINT: detectRole sets the step. 
  // We removed requestOtp from here because the Child component (LoginOtpStep) 
  // will handle the request once it mounts.
  const detectRole = useCallback(async (username: string) => {
    try {
      setLoading(true);
      setMessage("");
      const res = await axios.post(`${API_URL}/accounts/detect-role/`, { 
        phone_or_email: username 
      });

      setUser(username);
      setRole(res.data.role);

      if (res.data.role === "renter") {
        setStep("otp"); 
        // Logic: The LoginOtpStep useEffect will now trigger the single OTP request.
      } else {
        setStep("password");
      }
    } catch (err: any) {
      setMessage(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // TEACHING POINT: useCallback ensures this function "identity" stays the same.
  // This prevents the Child component's useEffect from re-triggering.
  const requestOtp = useCallback(async (usernameOverride?: string) => {
    try {
      setLoading(true);
      setMessage("");
      await axios.post(`${API_URL}/accounts/request-otp/`, { 
        phone_or_email: usernameOverride || user 
      });
      setMessage("OTP sent successfully!");
    } catch (err: any) {
      setMessage(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user, API_URL]);

  const verifyOtp = useCallback(async (otp: string) => {
    try {
      setLoading(true);
      setMessage("");
      const res = await axios.post(`${API_URL}/accounts/verify-otp/`, {
        phone_or_email: user,
        otp,
      });
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      router.push("/renter-dashboard");
    } catch (err: any) {
      setMessage(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user, API_URL, router]);

  const loginStaff = useCallback(async (username: string, password: string) => {
    try {
      setLoading(true);
      setMessage("");
      const res = await axios.post(`${API_URL}/accounts/token/`, { 
        username, 
        password 
      });
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      router.push("/admin-dashboard");
    } catch (err: any) {
      setMessage(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [API_URL, router]);

  const reset = useCallback(() => {
    setStep("role");
    setRole("");
    setUser("");
    setMessage("");
  }, []);

  return {
    step,
    role,
    user,
    message,
    loading,
    detectRole,
    requestOtp,
    verifyOtp,
    loginStaff,
    setMessage,
    setUser,
    reset,
  };
};