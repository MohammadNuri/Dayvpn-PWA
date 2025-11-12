import React, { useState } from "react";
import sha256 from "crypto-js/sha256";
import { useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import { useAuth } from "../AuthContext.tsx";
import { showErrorToast, showSuccessToast } from "../toast.tsx";

const PASSWORD_HASH = import.meta.env.VITE_PASSWORD_HASH as string;

// A simple inline SVG for the lock icon
const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="h-5 w-5"
  >
    <path
      fillRule="evenodd"
      d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
      clipRule="evenodd"
    />
  </svg>
);

const LoginScreen: React.FC = () => {
  const [masterPassword, setMasterPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // Get the login function from context
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 500));

      if (!masterPassword || masterPassword.trim() === "") {
        showErrorToast("لطفا رمز عبور را وارد کنید");
        return;
      }

      if (sha256(masterPassword).toString() === PASSWORD_HASH) {
        // Call the context login function
        // This will set the expiry time and save to localStorage
        login();
        
        showSuccessToast("ورود موفقیت‌آمیز بود");
        navigate("/home", { replace: true }); // Navigate after successful login
      } else {
        showErrorToast("رمز اشتباه است");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Main container: Centers content vertically and horizontally
    <div className="flex min-h-screen w-screen items-center justify-center p-4">
      
      {/* Glassmorphism Card: Responsive width and padding */}
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 
                   bg-white/5 p-6 shadow-xl backdrop-blur-lg sm:p-8"
      >
        {/* Title */}
        <h1
          className="mb-8 bg-gradient-to-r from-purple-400 to-blue-500 
                     bg-clip-text text-center text-3xl font-extrabold text-transparent"
        >
          DayVPN
        </h1>

        {/* Input group with icon (RTL friendly) */}
        <div className="relative mb-6">
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
            <span className="text-white/40">
              <LockIcon />
            </span>
          </div>

          <input
            type="password"
            className="w-full rounded-lg border border-white/20 
                       bg-transparent px-4 py-3 pr-10 text-right
                       text-base text-white placeholder:text-right 
                       placeholder:text-white/50 focus:outline-none 
                       focus:ring-2 focus:ring-cyan-400/70 transition duration-300"
            placeholder="رمز عبور"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            // Handle Enter key press
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleLogin()}
          />
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading} // Disable button when loading
          className={`w-full flex items-center justify-center rounded-lg bg-gradient-to-r 
                      from-purple-500 to-blue-500 px-6 py-3 
                      font-semibold text-white shadow-md transition duration-300 
                      ${!loading 
                          ? "hover:scale-[1.02] hover:shadow-cyan-500/30" 
                          : "opacity-70 cursor-not-allowed" // Style for loading state
                      }`}
        >
          {loading ? <ClipLoader color="#fff" size={20} /> : "ورود"}
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;