import LoginForm from "../components/features/Login/LoginForm";
import { useLogin } from "../logic/hooks/useLogin";

export default function LoginPage() {
  const login = useLogin();
  return <LoginForm {...login} />;
}
