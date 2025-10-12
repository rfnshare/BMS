// pages/login.tsx
import {useState} from "react";
import {useForm} from "react-hook-form";
import axios from "axios";
import {useRouter} from "next/router";

interface FormData {
    username: string;
    password?: string;
    otp?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Login() {
    const router = useRouter();
    const [step, setStep] = useState<"role" | "otp" | "password">("role");
    const [role, setRole] = useState<"renter" | "staff" | "">("");
    const [user, setUser] = useState("");
    const [message, setMessage] = useState("");

    const {register, handleSubmit} = useForm<FormData>();

    // Detect role
    const detectRole = async (data: { username: string }) => {
        try {
            const res = await axios.post(`${API_URL}/accounts/detect-role/`, {
                phone_or_email: data.username,
            });

            setUser(data.username);
            setRole(res.data.role);

            if (res.data.role === "renter") {
                setStep("otp");

                // auto-request OTP
                try {
                    await axios.post(`${API_URL}/accounts/request-otp/`, {
                        phone_or_email: data.username,
                    });
                    setMessage("OTP sent successfully!");
                } catch (err: any) {
                    setMessage(err.response?.data?.error || "Error sending OTP");
                }
            } else {
                setStep("password");
            }
        } catch (err: any) {
            setMessage(err.response?.data?.error || "User not found");
        }
    };

    // Request OTP
    const requestOtp = async () => {
        try {
            await axios.post(`${API_URL}/accounts/request-otp/`, {phone_or_email: user});
            setMessage("OTP sent successfully!");
        } catch (err: any) {
            setMessage(err.response?.data?.error || "Error sending OTP");
        }
    };

    // Verify OTP
    const verifyOtp = async (data: FormData) => {
        try {
            const res = await axios.post(`${API_URL}/accounts/verify-otp/`, {
                phone_or_email: user,
                otp: data.otp,
            });
            localStorage.setItem("access", res.data.access);
            localStorage.setItem("refresh", res.data.refresh);
            router.push("/renter-dashboard");
        } catch (err: any) {
            setMessage(err.response?.data?.error || "Invalid OTP");
        }
    };

    // Staff login
    const loginStaff = async (data: FormData) => {
        try {
            const res = await axios.post(`${API_URL}/token/`, {
                username: data.username,
                password: data.password,
            });
            localStorage.setItem("access", res.data.access);
            localStorage.setItem("refresh", res.data.refresh);
            router.push("/admin-dashboard");
        } catch (err: any) {
            setMessage(err.response?.data?.detail || "Invalid credentials");
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow-lg p-4" style={{maxWidth: "400px", width: "100%"}}>
                <h2 className="text-success mb-4 text-center">BM Login</h2>

                <form
                    onSubmit={handleSubmit(
                        step === "role" ? detectRole : step === "otp" ? verifyOtp : loginStaff
                    )}
                >
                    {step === "role" && (
                        <div className="mb-3">
                            <input
                                {...register("username")}
                                type="text"
                                className="form-control"
                                placeholder="Phone, Email or Username"
                                required
                            />
                        </div>
                    )}

                    {step === "password" && (
                        <div className="mb-3">
                            <input
                                {...register("password")}
                                type="password"
                                className="form-control"
                                placeholder="Password"
                                required
                            />
                        </div>
                    )}

                    {step === "otp" && (
                        <>
                            <div className="mb-2">
                                <input
                                    {...register("otp")}
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter OTP"
                                    required
                                />
                            </div>
                            <div className="mb-3 text-end">
                                <button
                                    type="button"
                                    className="btn btn-link p-0"
                                    onClick={requestOtp}
                                >
                                    Resend OTP
                                </button>
                            </div>
                        </>
                    )}

                    <button className="btn btn-success w-100">
                        {step === "role" ? "Next" : step === "password" ? "Login" : "Verify OTP"}
                    </button>

                    {message && <div className="mt-3 text-danger">{message}</div>}
                </form>
            </div>
        </div>
    );
}
