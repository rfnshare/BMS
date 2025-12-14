// components/features/Login/LoginUsernameStep.tsx
import { useState } from "react";

interface Props {
  loading: boolean;
  detectRole: (username: string) => Promise<void>;
  setMessage: (msg: string) => void;
  username?: string; // value from parent (optional)
  onUsernameSubmit: (username: string) => void; // send username to parent
}

export default function LoginUsernameStep({
  loading,
  detectRole,
  setMessage,
  username: initialUsername = "",
  onUsernameSubmit,
}: Props) {
  const [username, setUsername] = useState(initialUsername);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    // ✅ store username in parent
    onUsernameSubmit(username);

    // ✅ existing role detection
    await detectRole(username);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          style={{
            height: "55px",
            borderRadius: "10px",
            border: "1px solid #E0E0E0",
            paddingLeft: "20px",
            fontSize: "1rem",
          }}
          placeholder="Phone, Email, or Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoFocus
        />
      </div>

      <button
        type="submit"
        className="btn w-100 btn-lg text-white"
        style={{
          height: "55px",
          borderRadius: "10px",
          backgroundColor: "#4CAF50",
          borderColor: "#4CAF50",
          fontWeight: "600",
        }}
        disabled={loading}
      >
        {loading ? "Checking Role..." : "Next"}
      </button>
    </form>
  );
}
