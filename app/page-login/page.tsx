"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Login } from "@/app/api/auth/verification/authUtils"; // Adjust path if necessary!

const REMEMBER_ME_EMAIL_KEY = "borneo.auth.remembered_email";
const REMEMBER_ME_PASSWORD_KEY = "borneo.auth.remembered_password";
const REMEMBER_ME_PREFERENCE_KEY = "borneo.auth.remember_me";

// --- REUSABLE FORM COMPONENT ---
const FormContent = ({
  mode,
  loginMethod,
  setLoginMethod,
  handleToggle,
  isAnimating
}: {
  mode: "login" | "signup";
  loginMethod: "magic" | "password";
  setLoginMethod: (val: "magic" | "password") => void;
  handleToggle: () => void;
  isAnimating: boolean;
}) => {
  const isLoginMode = mode === "login";
  
  // --- Form States ---
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  // --- Backend Hook ---
  const { 
    sendMagicLink, 
    loginWithPassword, 
    signUpAndSendOtp, 
    verifyOtpAndLogin,
    sendPasswordReset, 
    loading, 
    message, 
    setMessage 
  } = Login();

  // Clear messages when switching tabs
  useEffect(() => {
    setMessage(null);
    setIsOtpSent(false);
  }, [mode, loginMethod, setMessage]);

  useEffect(() => {
    if (!isLoginMode) {
      return;
    }

    const savedPreference = localStorage.getItem(REMEMBER_ME_PREFERENCE_KEY);
    if (savedPreference !== null) {
      setRememberMe(savedPreference === "true");
    }

    const rememberedEmail = localStorage.getItem(REMEMBER_ME_EMAIL_KEY);
    const rememberedPassword = localStorage.getItem(REMEMBER_ME_PASSWORD_KEY);

    if (rememberedEmail) {
      setEmail(rememberedEmail);
    }

    if (rememberedPassword) {
      setPassword(rememberedPassword);
    }
  }, [isLoginMode]);

  const persistRememberedCredentials = (loginEmail: string, loginPassword: string) => {
    localStorage.setItem(REMEMBER_ME_PREFERENCE_KEY, String(rememberMe));

    if (rememberMe) {
      localStorage.setItem(REMEMBER_ME_EMAIL_KEY, loginEmail);
      localStorage.setItem(REMEMBER_ME_PASSWORD_KEY, loginPassword);
      return;
    }

    localStorage.removeItem(REMEMBER_ME_EMAIL_KEY);
    localStorage.removeItem(REMEMBER_ME_PASSWORD_KEY);
  };

  // --- Validation Logic ---
  const isPasswordLongEnough = password.length >= 8;
  const doPasswordsMatch = password === confirmPassword;
  
  const isSubmitDisabled = loading || (isLoginMode 
    ? (loginMethod === "magic" ? !email : (!email || !password)) 
    : (!email || !otp || !fullName || !isPasswordLongEnough || !doPasswordsMatch));

 
  // --- Action Handlers ---
  const handleSendOtp = async () => {
    // 1. Check if name and email are filled
    if (!email || !fullName) {
      setMessage({ type: 'error', text: 'Please enter your Full Name and Email first.' });
      return;
    }
    // 2. Check if passwords are valid
    if (!isPasswordLongEnough || !doPasswordsMatch) {
      setMessage({ type: 'error', text: 'Please set and confirm a valid password (min 8 characters) before sending the OTP.' });
      return;
    }
    

    const res = await signUpAndSendOtp(email, password, fullName);

   
    if (res.success) {
      setIsOtpSent(true);
    }

  };
  // --- Action Handlers ---
  const handleForgotPassword = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address first.' });
      return;
    }
    await sendPasswordReset(email);
  };
  
  const handleSubmit = async () => {
    if (isLoginMode) {
      // 1. MAGIC LINK LOGIN
      if (loginMethod === "magic") {
        await sendMagicLink(email);
      } 
      // 2. PASSWORD LOGIN
      else {
        const res = await loginWithPassword(email, password);
        
        if (res.success && res.user) { 
          setIsRedirecting(true); 

          persistRememberedCredentials(email, password);

          // 🚨 THE FIX: Manually explicitly save the token so your profile page can read it!
          // (Note: If your custom hook returns the token as `res.token` instead of `res.session.access_token`, update the variable name below!)
          const token = res.session?.access_token;
          if (token) {
            localStorage.setItem("supabase.auth.token", token);
          }

          await fetch("/api/auth/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: res.user.id, email: res.user.email, name: "Resident" })
          });
          
          setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
          setTimeout(() => {
            window.location.replace("/");
          }, 1500);
        }
      }
    } else {
      // 3. SIGN UP & VERIFY OTP
      const res = await verifyOtpAndLogin(email, otp);
      
      // 🚨 Added && res.user && res.session to satisfy TypeScript's null checks!
      if (res.success && res.user && res.session) {
        setIsRedirecting(true); 

        // 🚨 Extract the token correctly from the new session object
        const token = res.session.access_token;
        if (token) {
          localStorage.setItem("supabase.auth.token", token);
        }

        await fetch("/api/auth/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: res.user.id, email: res.user.email, name: fullName })
        });
        
        setMessage({ type: 'success', text: 'Account verified! Logging you in...' });
        handleToggle();
        
        setTimeout(() => {
          window.location.replace("/");
        }, 1500);
      }
    }
  };
  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center animate-in fade-in duration-500 py-4">
    
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-5 shrink-0">
        <div className="flex items-center justify-center h-20 w-20 min-h-20 min-w-20 mb-2 shrink-0">
          <img src="/favicon.ico" alt="logo" className="h-full w-full object-contain" />
        </div>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Hachimi AI</h1>
        <p className="text-xs tracking-widest text-gray-500 uppercase mt-1">The Resilient Editorial</p>
      </div>

      {/* Dynamic Titles */}
      <h2 className="text-2xl font-bold text-[#1a1a1a] mb-1">
        {isLoginMode ? "Welcome Back" : "Join the Hub"}
      </h2>
      <p className="text-sm text-gray-500 mb-4 text-center">
        {isLoginMode ? "Please enter your details to sign in." : "Please enter your details to create an account."}
      </p>

      {/* --- NEW: Server Message Banner --- */}
      {message && (
        <div className={`w-full p-3 rounded-xl text-xs font-bold mb-4 text-center animate-in slide-in-from-top-2 ${
          message.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Login Toggle */}
      {isLoginMode && (
        <div className="flex w-full bg-gray-100 rounded-full p-1 mb-5">
          <button
            onClick={() => setLoginMethod("magic")}
            className={`flex-1 py-1.5 text-sm font-medium rounded-full transition-all ${
              loginMethod === "magic" ? "bg-white text-[#1a1a1a] shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Magic Link
          </button>
          <button
            onClick={() => setLoginMethod("password")}
            className={`flex-1 py-1.5 text-sm font-medium rounded-full transition-all ${
              loginMethod === "password" ? "bg-white text-[#1a1a1a] shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Password
          </button>
        </div>
      )}

      
      {/* Inputs Stack */}
      <div className="w-full flex flex-col gap-2.5 mb-4">
        
        {isLoginMode ? (
          /* =========================================
             LOGIN MODE (Tab Order: Email -> Password)
             ========================================= */
          <>
            {/* 1. Email (Login) */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-3 mb-1 block">Email Address</label>
              <input 
                type="email" 
                placeholder="HachimiAI@gmail.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-100 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-[#183d2e]/30 transition-all" 
              />
            </div>

            {/* 2. Password (Login) */}
            {loginMethod === "password" && (
              <div className="flex w-full flex-col">
                <div className="flex justify-between items-center pr-3 mb-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-3 block">Password</label>
                  <button 
                    type="button" 
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="text-[10px] font-bold text-[#183d2e] hover:underline disabled:opacity-50"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-100 text-sm pl-4 pr-10 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-[#183d2e]/30 border border-transparent transition-all [&::-ms-reveal]:hidden [&::-ms-clear]:hidden" 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 flex items-center justify-center outline-none"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
            )}

            <label className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-gray-600 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => {
                  const nextRememberMe = e.target.checked;
                  setRememberMe(nextRememberMe);
                  localStorage.setItem(REMEMBER_ME_PREFERENCE_KEY, String(nextRememberMe));

                  if (!nextRememberMe) {
                    localStorage.removeItem(REMEMBER_ME_EMAIL_KEY);
                    localStorage.removeItem(REMEMBER_ME_PASSWORD_KEY);
                  }
                }}
                className="h-4 w-4 rounded border-gray-300 accent-[#183d2e] focus:ring-[#183d2e]/30"
              />
              Remember me
            </label>
          </>
        ) : (
          
          <>
            {/* 1. Full Name */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-3 mb-1 block">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Hachimi" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isOtpSent}
                  className={`w-full bg-gray-100 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-[#183d2e]/30 transition-all ${isOtpSent ? "opacity-60 cursor-not-allowed" : ""}`} 
                />
              </div>
            </div>

            {/* 2. Passwords */}
            <div className="flex w-full gap-3">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-3 mb-1 block">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Min. 8 chars" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isOtpSent}
                    className={`w-full bg-gray-100 text-sm pl-4 pr-10 py-2.5 rounded-xl outline-none focus:ring-2 transition-all [&::-ms-reveal]:hidden [&::-ms-clear]:hidden ${
                      password.length > 0 && !isPasswordLongEnough 
                        ? "focus:ring-red-500 border border-red-500" 
                        : "focus:ring-[#183d2e]/30 border border-transparent"
                    } ${isOtpSent ? "opacity-60 cursor-not-allowed" : ""}`} 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 flex items-center justify-center outline-none"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {password.length > 0 && !isPasswordLongEnough && (
                  <span className="text-[10px] text-red-500 font-semibold pl-3 mt-1 block">Too short</span>
                )}
              </div>

              <div className="flex-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-3 mb-1 block">Confirm Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isOtpSent}
                    className={`w-full bg-gray-100 text-sm pl-4 pr-10 py-2.5 rounded-xl outline-none focus:ring-2 transition-all [&::-ms-reveal]:hidden [&::-ms-clear]:hidden ${
                      confirmPassword.length > 0 && !doPasswordsMatch 
                        ? "focus:ring-red-500 border border-red-500" 
                        : "focus:ring-[#183d2e]/30 border border-transparent"
                    } ${isOtpSent ? "opacity-60 cursor-not-allowed" : ""}`} 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 flex items-center justify-center outline-none"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {confirmPassword.length > 0 && !doPasswordsMatch && (
                  <span className="text-[10px] text-red-500 font-semibold pl-3 mt-1 block">Doesn't match</span>
                )}
              </div>
            </div>

            {/* 3. Email & OTP Button */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-3 mb-1 block">Email Address</label>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="HachimiAI@gmail.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isOtpSent}
                  className={`w-full bg-gray-100 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-[#183d2e]/30 transition-all ${isOtpSent ? "opacity-60 cursor-not-allowed" : ""}`} 
                />
                <button 
                  type="button" 
                  onClick={handleSendOtp}
                  disabled={loading || isOtpSent}
                  className="bg-[#183d2e]/10 hover:bg-[#183d2e]/20 text-[#183d2e] text-xs font-bold px-4 rounded-xl transition-all whitespace-nowrap active:scale-95 disabled:opacity-50"
                >
                  {isOtpSent ? "OTP Sent ✓" : "Send OTP"}
                </button>
              </div>
            </div>

            {/* 4. Verification Code */}
            <div>
              <div className="flex justify-between items-center pr-3 mb-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-3 block">Verification Code</label>
                <span className="text-[10px] font-semibold text-gray-400">Check your inbox</span>
              </div>
              <input 
                type="text" 
                placeholder="Enter 8-digit OTP" 
                maxLength={8} 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-gray-100 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-[#183d2e]/30 transition-all tracking-[0.2em] font-medium text-center" 
              />
            </div>
          </>
        )}
      </div>

      {/* Main Action Button */}
      <button 
        type="button"
        onClick={handleSubmit}
        // 🚨 Update this line to include isRedirecting
        disabled={isSubmitDisabled || isRedirecting}
        className={`w-full font-medium py-3 rounded-full flex items-center justify-center gap-2 transition-all shadow-md ${
          isSubmitDisabled || isRedirecting
            ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
            : "bg-[#183d2e] hover:bg-[#122e22] text-white active:scale-[0.98]"
        }`}
      >
        {/* 🚨 Update this line to check isRedirecting */}
        {loading || isRedirecting ? (
          "Processing..."
        ) : (
          <>
            {isLoginMode ? (loginMethod === "magic" ? "Send Magic Link" : "Login") : "Sign Up"}
            {isLoginMode && loginMethod === "magic" && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
          </>
        )}
      </button>

      {/* Switch State Link */}
      <div className="mt-5 text-sm text-gray-500 flex gap-1">
        {isLoginMode ? "Don't have an account?" : "Already have an account?"}
        <button 
          onClick={handleToggle} 
          disabled={isAnimating || loading}
          className={`font-bold text-[#183d2e] hover:underline ${isAnimating || loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isLoginMode ? "Sign Up" : "Sign In"}
        </button>
      </div>
      
      <div className="mt-6 text-[10px] text-gray-400 tracking-wider md:hidden uppercase flex gap-4">
        <Link href="#" className="hover:text-gray-600">Privacy Policy</Link>
      </div>
    </div>
  );
};

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [visibleMode, setVisibleMode] = useState<"login" | "signup">("login");
  const [loginMethod, setLoginMethod] = useState<"magic" | "password">("magic");
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    const nextIsLogin = !isLogin;
    setIsLogin(nextIsLogin);

    setTimeout(() => {
      setVisibleMode(nextIsLogin ? "login" : "signup");
    }, 300);

    setTimeout(() => {
      setIsAnimating(false);
    }, 700);
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center p-4 md:p-8 pt-12 pb-20 min-h-screen overflow-hidden">
        {/* 2. NEW: Dedicated Background Image Layer */}
      <div 
        className={`
          absolute inset-0 z-0
          bg-cover bg-center bg-no-repeat
          transition-opacity duration-1000
          ${isLogin ? "opacity-70" : "opacity-50"} // Adjust OPACITY LEVEL here!
        `}
        style={{ backgroundImage: "url('/bg1.jpg')" }}
      />
      {/* 3. OPTIONAL OVERLAY: Darkens slightly for contrast (Now sits on z-10) */}
      <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none"></div>
      
      {/* 4. CONTENT WRAPPER: Sits above background and overlay (Added z-20) */}
      <div className="relative z-20 w-full flex flex-col items-center">
      {/* MOBILE LAYOUT */}
      <div className="w-full max-w-md mt-12 md:hidden flex flex-col items-center">
        <div className="bg-white w-full rounded-[2.5rem] shadow-xl p-8 pt-10">
            {/* 🚨 PINNED MOBILE ARROW */}
          <Link href="/" className="absolute top-6 left-6 flex items-center text-gray-400 hover:text-[#183d2e] transition-colors group">
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">arrow_back</span>
          </Link>
          <FormContent 
            mode={isLogin ? "login" : "signup"} 
            loginMethod={loginMethod}
            setLoginMethod={setLoginMethod}
            handleToggle={handleToggle}
            isAnimating={isAnimating}
          /> 
        </div>
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="hidden md:flex relative w-full max-w-250 h-180 bg-white rounded-[2.5rem] shadow-xl overflow-hidden mt-12">
        
        {/* LEFT: Image Panel */}
        <div 
          className={`absolute top-0 w-1/2 h-full z-10 transition-transform duration-700 ease-in-out ${
            isLogin ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="absolute inset-0 bg-[#183d2e]">
            <Image 
              src="/login-bg.jpeg"
              alt="Background"
              fill
              className="object-cover opacity-90"
            />
          </div>

          <div className="absolute top-1/2 left-12 -translate-y-1/2 text-white max-w-[320px]">
            <h1 className="text-5xl font-bold leading-tight drop-shadow-md mb-6">
              Building<br/>stronger,<br/>together.
            </h1>
            <p className="text-sm text-white/80 leading-relaxed font-light drop-shadow-sm border-l-2 border-white/30 pl-4">
              Empowering communities with AI-driven disaster preparedness, real-time alerts, and unified resilience planning.
            </p>
          </div>

          <div className="absolute bottom-10 left-12 flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2.5 shadow-lg transition-transform hover:scale-105 cursor-default">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-xs font-medium text-white tracking-wide drop-shadow-sm">
              BorNEO Network Active
            </span>
          </div>
        </div>

        {/* RIGHT: Form Panel */}
        <div 
          className={`absolute top-0 w-1/2 h-full bg-white flex flex-col justify-center items-center px-12 transition-transform duration-700 ease-in-out ${
            isLogin ? "translate-x-full" : "translate-x-0"
          }`}
        >
            {/* 🚨 PINNED DESKTOP ARROW (Right exactly where your red circle is!) */}
          <Link 
              href="/" 
              className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#183d2e] transition-colors group"
          >
              <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">arrow_back</span>
              Back
          </Link>

          <FormContent 
            mode={visibleMode} 
            loginMethod={loginMethod}
            setLoginMethod={setLoginMethod}
            handleToggle={handleToggle}
            isAnimating={isAnimating}
          />
        </div>
      </div>
      </div>
    </div>
  );
}