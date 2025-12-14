// logic/hooks/useLogin.ts
import { useState } from "react";
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

  const detectRole = async (username: string) => {
    try {
      setLoading(true);
      setMessage("");
      const res = await axios.post(`${API_URL}/accounts/detect-role/`, { phone_or_email: username });

      setUser(username);
      setRole(res.data.role);

      if (res.data.role === "renter") {
        setStep("otp");
        await requestOtp(username);
      } else {
        setStep("password");
      }
    } catch (err: any) {
      setMessage(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const requestOtp = async (usernameOverride?: string) => {
    try {
      setLoading(true);
      setMessage("");
      await axios.post(`${API_URL}/accounts/request-otp/`, { phone_or_email: usernameOverride || user });
      setMessage("OTP sent successfully!");
    } catch (err: any) {
      setMessage(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (otp: string) => {
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
  };

  const loginStaff = async (username: string, password: string) => {
    try {
      setLoading(true);
      setMessage("");
      const res = await axios.post(`${API_URL}/accounts/token/`, { username, password });
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      router.push("/admin-dashboard");
    } catch (err: any) {
      setMessage(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep("role");
    setRole("");
    setUser("");
    setMessage("");
  };

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
