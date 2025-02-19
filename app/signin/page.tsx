"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { FaGoogle } from "react-icons/fa";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const SignInPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");

  // Signup state
  const [signupFullName, setSignupFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupShowPassword, setSignupShowPassword] = useState(false);
  const [signupError, setSignupError] = useState("");

  // Handle login with email & password
  const handleLogin = async () => {
    setLoginError("");
    setForgotMessage("");
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    if (error) {
      setLoginError(error.message);
    } else {
      router.push("/");
    }
  };

  // Handle sign-up with email & password (store full name as user metadata)
  const handleSignup = async () => {
    setSignupError("");
    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: { full_name: signupFullName },
        // Optionally, add a redirectTo parameter for email verification:
        // redirectTo: `${window.location.origin}/verify-email`
      },
    });
    if (error) {
      setSignupError(error.message);
    } else {
      alert("Check your email for a verification link!");
      router.push("/");
    }
  };

  // Google sign in (works for both login and signup)
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) {
      if (activeTab === "login") {
        setLoginError(error.message);
      } else {
        setSignupError(error.message);
      }
    }
  };

  // Forgot password – send a reset link via email
  const handleForgotPassword = async () => {
    if (!loginEmail) {
      setLoginError("Please enter your email");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(loginEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setLoginError(error.message);
    } else {
      setForgotMessage("Password reset link sent! Check your email.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-500">Moshood Fashion</h1>
          <p className="text-xl mt-2">
            {activeTab === "login" ? "Login" : "Sign Up"}
          </p>
        </div>
        {/* Main Tabs */}
        <div className="flex mb-6 border-b">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2 text-center font-medium ${
              activeTab === "login"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab("signup")}
            className={`flex-1 py-2 text-center font-medium ${
              activeTab === "signup"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
          >
            Sign Up
          </button>
        </div>

        {activeTab === "login" && (
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <div className="relative">
              <input
                type={loginShowPassword ? "text" : "password"}
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <button
                type="button"
                onClick={() => setLoginShowPassword(!loginShowPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
              >
                {loginShowPassword ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </button>
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 transition"
            >
              Login
            </button>
            <div className="text-right text-sm">
              <button
                onClick={handleForgotPassword}
                className="text-blue-500 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="text-center">or continue with</div>
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center border border-gray-300 py-3 rounded hover:bg-gray-100 transition"
            >
              <FaGoogle size={20} className="mr-2" />
              <span>Google</span>
            </button>
            {loginError && (
              <p className="text-center text-red-500">{loginError}</p>
            )}
            {forgotMessage && (
              <p className="text-center text-green-500">{forgotMessage}</p>
            )}
          </div>
        )}

        {activeTab === "signup" && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={signupFullName}
              onChange={(e) => setSignupFullName(e.target.value)}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <input
              type="email"
              placeholder="Email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <div className="relative">
              <input
                type={signupShowPassword ? "text" : "password"}
                placeholder="Password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <button
                type="button"
                onClick={() => setSignupShowPassword(!signupShowPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
              >
                {signupShowPassword ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </button>
            </div>
            <button
              onClick={handleSignup}
              className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 transition"
            >
              Sign Up
            </button>
            <div className="text-center">or continue with</div>
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center border border-gray-300 py-3 rounded hover:bg-gray-100 transition"
            >
              <FaGoogle size={20} className="mr-2" />
              <span>Google</span>
            </button>
            {signupError && (
              <p className="text-center text-red-500">{signupError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignInPage;
