// logic/services/authService.ts
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Detects whether a username belongs to a renter or staff.
 */
export async function detectRole(phone_or_email: string) {
  const res = await axios.post(`${API_URL}/accounts/detect-role/`, { phone_or_email });
  return res.data; // { role: "renter" | "staff" }
}

/**
 * Requests an OTP for renter login.
 */
export async function requestOtp(phone_or_email: string) {
  const res = await axios.post(`${API_URL}/accounts/request-otp/`, { phone_or_email });
  return res.data;
}

/**
 * Verifies the OTP and returns access/refresh tokens.
 */
export async function verifyOtp(phone_or_email: string, otp: string) {
  const res = await axios.post(`${API_URL}/accounts/verify-otp/`, { phone_or_email, otp });
  return res.data; // { access, refresh }
}

/**
 * Logs in staff using username/password.
 */
export async function loginStaff(username: string, password: string) {
  const res = await axios.post(`${API_URL}/accounts/token/`, { username, password });
  return res.data; // { access, refresh }
}
