import React, { useState } from "react";
import sha256 from "crypto-js/sha256";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ClipLoader from "react-spinners/ClipLoader";
import { useAuth } from "../AuthContext";

const PASSWORD_HASH = import.meta.env.VITE_PASSWORD_HASH as string;

const LoginScreen: React.FC = () => {

  const [masterPassword, setMasterPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (loading) return; // جلوگیری از spam کلیک
    setLoading(true);
    try {
      // شبیه‌سازی delay پردازش
      await new Promise((res) => setTimeout(res, 500));

      if(!masterPassword || masterPassword.trim() === "") {
        toast.error("لطفا رمز عبور را وارد کنید");
        return;
      }

      if (sha256(masterPassword).toString() === PASSWORD_HASH) {
        login(); // بروزرسانی state
        toast.success("ورود موفقیت‌آمیز بود");
        navigate("/home");
      } else {
        toast.error("رمز اشتباه است");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div
        className="max-w-sm w-[90%] rounded-2xl border border-white/10 
                   bg-white/5 p-8 shadow-xl backdrop-blur-lg"
      >
        {/* لوگو / عنوان */}
        <h1
          className="mb-6 bg-gradient-to-r from-purple-400 to-blue-500 
                     bg-clip-text text-center text-3xl font-extrabold text-transparent"
        >
          DayVPN
        </h1>

        {/* ورودی پسورد */}
        <input
          type="password"
          className="mb-4 w-full rounded-lg border border-white/20 
                     bg-transparent px-4 py-3 text-center text-base text-white
                     placeholder:text-white/50 focus:outline-none 
                     focus:ring-2 focus:ring-cyan-400/70 transition duration-300"
          placeholder="Master Password"
          value={masterPassword}
          onChange={(e) => setMasterPassword(e.target.value)}
        />

        {/* دکمه ورود */}
        <button
          onClick={handleLogin}
          className={`w-full flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 font-semibold text-white shadow-md transition duration-300 
                      ${!loading ? "hover:scale-[1.02] hover:shadow-cyan-500/30" : ""}`}
        >
          {loading ? <ClipLoader color="#fff" size={20} /> : "Login"}
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
