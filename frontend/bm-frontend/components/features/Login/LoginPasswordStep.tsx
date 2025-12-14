// components/features/Login/LoginPasswordStep.tsx
import { useState } from "react";

interface Props {
  loading: boolean;
  username: string; // ✅ receive from LoginForm
  loginStaff: (username: string, password: string) => Promise<void>;
  setMessage: (msg: string) => void;
}

export default function LoginPasswordStep({
  loading,
  username,
  loginStaff,
  setMessage,
}: Props) {
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    // 🔍 optional sanity check (remove later)
    console.log("USERNAME USED FOR LOGIN:", username);

    await loginStaff(username, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <input
          type="password"
          className="form-control"
          style={{ height: "50px", borderRadius: "8px" }}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="btn btn-success w-100"
        style={{ height: "50px", borderRadius: "8px" }}
        disabled={loading}
      >
        {loading ? "Loading..." : "Login"}
      </button>
    </form>
  );
}
