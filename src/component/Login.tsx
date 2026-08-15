import { useEffect, useState, type FormEvent } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, LogIn } from "lucide-react";

import Logo2 from "../assets/Image/logo2.png";
import { getAuthToken } from "../services/authSession";
import { sendLogin } from "../services/authService";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (getAuthToken()) {
      navigate("/DashboardMain", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await sendLogin({
        username,
        password,
      });
      toast.success("Login successful!");
      navigate("/DashboardMain", { replace: true });
    } catch {
      setError("Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4"
        style={{
          backgroundImage: `url(${Logo2})`,
          backgroundPosition: "center",
        }}
      >
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md p-6 border border-white/30 rounded-xl shadow-2xl backdrop-blur-sm bg-black/20"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
            <p className="text-sm text-white/70">
              Enter your credentials to continue
            </p>
          </div>

          <div className="mb-4">
            <label
              htmlFor="username"
              className="block mb-2 text-sm font-medium text-white/90"
            >
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-white/90"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="mb-4 text-sm font-medium text-red-300 bg-red-500/10 border border-red-400/20 rounded-lg p-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Login
              </>
            )}
          </button>

          <div className="mt-4 text-center">
            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} GST Billing System
            </p>
          </div>
        </form>
      </div>
      <ToastContainer />
    </>
  );
};

export default Login;
