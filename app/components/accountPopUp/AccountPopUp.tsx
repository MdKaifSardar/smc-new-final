"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAtom, useStore } from "jotai";
import { accountMenuState } from "@/app/utils/data/store";
import { useSignIn, useSignUp, useUser, useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import {
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Edit2,
  ShieldCheck,
  LogOut,
  Calendar,
} from "lucide-react";

type AuthStep = "email" | "otp";
type AuthMode = "sign-in" | "sign-up";

const AccountPopUp = () => {
  const [accountMenuOpen, setAccountMenuOpen] = useAtom(accountMenuState, {
    store: useStore(),
  });
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);

  // Auth flow states
  const [step, setStep] = useState<AuthStep>("email");
  const [authMode, setAuthMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Clerk Hooks
  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const { isLoaded: isUserLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  // Reset form when modal closes
  useEffect(() => {
    if (!accountMenuOpen) {
      const timeout = setTimeout(() => {
        setStep("email");
        setOtp(["", "", "", "", "", ""]);
        setIsSubmitting(false);
        setIsGoogleSubmitting(false);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [accountMenuOpen]);

  // Resend OTP countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Handle Google 1-Tap OAuth
  const handleGoogleOAuth = async () => {
    if (!isSignInLoaded) return;
    setIsGoogleSubmitting(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err: any) {
      console.error("Google OAuth error:", err);
      const rawMsg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || "";
      if (rawMsg.includes("oauth_google") || rawMsg.includes("allowed values for parameter strategy")) {
        toast.error("Google login is not enabled in your Clerk Dashboard yet. Please enable 'Google' under Configure > Social Connections.");
      } else {
        toast.error(rawMsg || "Failed to initiate Google sign in.");
      }
      setIsGoogleSubmitting(false);
    }
  };

  // Step 1: Submit Email (Dynamically route to Sign-In vs Sign-Up and send OTP)
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!isSignInLoaded || !isSignUpLoaded) {
      toast.error("Authentication service is loading. Please try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Try initiating Sign-In
      const signInAttempt = await signIn.create({
        identifier: cleanEmail,
      });

      // User exists! Prepare Email Code factor
      const emailCodeFactor = signInAttempt.supportedFirstFactors?.find(
        (factor: any) => factor.strategy === "email_code"
      ) as any;

      if (emailCodeFactor && emailCodeFactor.emailAddressId) {
        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: emailCodeFactor.emailAddressId,
        });

        setAuthMode("sign-in");
        setStep("otp");
        setResendCooldown(45);
        toast.success("Verification code sent to your email!");
      } else {
        throw new Error("Email verification is not enabled for this user.");
      }
    } catch (err: any) {
      const errorCode = err?.errors?.[0]?.code;

      // 2. User does not exist (form_identifier_not_found) -> Auto Sign-Up
      if (errorCode === "form_identifier_not_found" || errorCode === "identifier_not_found") {
        try {
          await signUp.create({
            emailAddress: cleanEmail,
          });

          await signUp.prepareEmailAddressVerification({
            strategy: "email_code",
          });

          setAuthMode("sign-up");
          setStep("otp");
          setResendCooldown(45);
          toast.success("Verification code sent! Welcome to Stitch My Clothes.");
        } catch (signUpErr: any) {
          console.error("Sign-up initiation error:", signUpErr);
          toast.error(
            signUpErr?.errors?.[0]?.longMessage ||
              signUpErr?.message ||
              "Could not send verification code. Please check your email."
          );
        }
      } else {
        console.error("Sign-in initiation error:", err);
        toast.error(
          err?.errors?.[0]?.longMessage ||
            err?.message ||
            "Unable to proceed with this email. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsSubmitting(true);
    try {
      if (authMode === "sign-in") {
        const emailCodeFactor = signIn?.supportedFirstFactors?.find(
          (factor: any) => factor.strategy === "email_code"
        ) as any;
        if (emailCodeFactor?.emailAddressId) {
          await signIn?.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId: emailCodeFactor.emailAddressId,
          });
        }
      } else {
        await signUp?.prepareEmailAddressVerification({
          strategy: "email_code",
        });
      }
      setResendCooldown(45);
      toast.success("A new verification code has been sent!");
    } catch (err: any) {
      toast.error(err?.errors?.[0]?.longMessage || "Failed to resend code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Handle individual digit inputs for OTP
  const handleOtpChange = (index: number, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");

    if (numericValue.length > 1) {
      // Pasting full code
      const pastedDigits = numericValue.slice(0, 6).split("");
      const newOtp = [...otp];
      pastedDigits.forEach((digit, i) => {
        newOtp[i] = digit;
      });
      setOtp(newOtp);

      const nextFocus = Math.min(pastedDigits.length, 5);
      otpInputRefs.current[nextFocus]?.focus();

      if (pastedDigits.length === 6) {
        verifyOtpCode(newOtp.join(""));
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = numericValue;
    setOtp(newOtp);

    // Auto-advance
    if (numericValue && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-verify if all 6 digits are complete
    const completeCode = newOtp.join("");
    if (completeCode.length === 6 && !newOtp.includes("")) {
      verifyOtpCode(completeCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP Code
  const verifyOtpCode = async (codeToVerify?: string) => {
    const fullCode = codeToVerify || otp.join("");
    if (fullCode.length !== 6) {
      toast.error("Please enter the complete 6-digit code.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (authMode === "sign-in") {
        if (!isSignInLoaded || !signIn) return;

        const completeSignIn = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code: fullCode,
        });

        if (completeSignIn.status === "complete") {
          await setSignInActive({ session: completeSignIn.createdSessionId });
          setAccountMenuOpen(false);
          toast.success("Welcome back to Stitch My Clothes!");
        } else {
          toast.info("Additional verification required.");
        }
      } else {
        if (!isSignUpLoaded || !signUp) return;

        const completeSignUp = await signUp.attemptEmailAddressVerification({
          code: fullCode,
        });

        if (completeSignUp.status === "complete") {
          await setSignUpActive({ session: completeSignUp.createdSessionId });
          setAccountMenuOpen(false);
          toast.success("Welcome to Stitch My Clothes! Account created successfully.");
        } else {
          toast.info("Verification step required.");
        }
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      toast.error(
        err?.errors?.[0]?.longMessage ||
          err?.message ||
          "Invalid or expired verification code. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navbar button click handler
  const handleOnClickAccountMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUserLoaded && isSignedIn) {
      setUserDetailsOpen(true);
    } else {
      setAccountMenuOpen(true);
    }
  };

  return (
    <>
      {/* Navbar Trigger Button: Perfectly matches the exact font, size, and weight of Navbar links */}
      <button
        type="button"
        onClick={handleOnClickAccountMenu}
        className="w-full h-full font-play font-bold text-inherit hover:text-black transition-colors flex items-center gap-2 focus:outline-none select-none text-left"
        aria-label={isSignedIn ? "Account Profile" : "Sign in to Stitch My Clothes"}
      >
        {isUserLoaded && isSignedIn ? (
          <div className="flex items-center gap-2">
            {user?.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt={user.fullName || "User"}
                width={26}
                height={26}
                className="rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#A7120B] text-white flex items-center justify-center text-xs font-bold shrink-0">
                {user?.firstName?.[0] || "U"}
              </div>
            )}
            <span className="truncate max-w-[100px]">{user?.firstName || "Account"}</span>
          </div>
        ) : (
          <span>Login</span>
        )}
      </button>

      {/* 1. Logged-in Profile Modal */}
      <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
        <DialogContent className="w-[94vw] max-w-[440px] p-0 overflow-hidden rounded-2xl border border-gray-200 shadow-2xl bg-white font-play">
          <DialogTitle className="sr-only">Account Profile</DialogTitle>
          <DialogDescription className="sr-only">
            View your profile details and session.
          </DialogDescription>

          {/* Profile Header */}
          <div className="bg-[#1f1d1d] text-white p-6 relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-4">
              {user?.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt={user?.fullName || "User"}
                  width={64}
                  height={64}
                  className="rounded-full ring-2 ring-white/20 object-cover shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#A7120B] flex items-center justify-center text-white text-2xl font-bold shrink-0">
                  {user?.firstName?.[0] || "U"}
                </div>
              )}
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#A7120B] bg-white px-2 py-0.5 rounded">
                  SMC Member
                </span>
                <h3 className="text-xl font-bold mt-1.5 text-white truncate">
                  {user?.fullName || user?.firstName || "Valued Client"}
                </h3>
                <p className="text-xs text-gray-300 truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Body */}
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Status</p>
                  <p className="font-semibold text-gray-900">Verified Client</p>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-gray-600 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Member Since</p>
                  <p className="font-semibold text-gray-900">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })
                      : "2025"}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUserDetailsOpen(false)}
                className="font-play font-bold text-gray-700 hover:text-black border-gray-300"
              >
                Close
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={async () => {
                  await signOut();
                  setUserDetailsOpen(false);
                  toast.success("Signed out successfully.");
                }}
                className="bg-[#A7120B] hover:bg-[#8e0f09] text-white font-play font-bold flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. Unified Passwordless Auth Modal: Fully responsive on mobile & uniform with site theme */}
      <Dialog open={accountMenuOpen} onOpenChange={setAccountMenuOpen}>
        <DialogContent className="w-[94vw] sm:max-w-[780px] p-0 overflow-hidden rounded-2xl border border-gray-200 shadow-2xl bg-white font-play max-h-[92vh] overflow-y-auto">
          <DialogTitle className="sr-only">Sign In or Sign Up</DialogTitle>
          <DialogDescription className="sr-only">
            Instant passwordless authentication via email verification code or Google.
          </DialogDescription>

          <div className="flex flex-col md:flex-row w-full min-h-[460px]">
            {/* Desktop Left Column: Bespoke Atelier Editorial Showcase */}
            <div className="hidden md:flex md:w-[42%] relative bg-[#18181b] text-white flex-col justify-between p-8 overflow-hidden shrink-0">
              <Image
                src="https://res.cloudinary.com/djndrffon/image/upload/v1742900248/loginImage_hcarbc.jpg"
                alt="Stitch My Clothes"
                fill
                priority
                className="object-cover object-top opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/35" />

              {/* Top Branding */}
              <div className="relative z-10 space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] tracking-widest uppercase font-bold text-white">
                  <Sparkles className="w-3 h-3 text-[#A7120B]" />
                  Custom Menswear
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white uppercase font-play">
                  Stitch My Clothes
                </h2>
              </div>

              {/* Editorial Copy & Perks */}
              <div className="relative z-10 space-y-3">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white leading-tight">
                    Crafted to Your Measurements.
                  </h3>
                  <p className="text-xs text-gray-300 font-normal leading-relaxed">
                    Save your custom shirt configurations, fabric choices, and tailored fit in one place.
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-gray-200 border-t border-white/15 pt-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C40600] shrink-0" />
                    <span>Instant passwordless access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C40600] shrink-0" />
                    <span>Saved 3D custom shirt designs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C40600] shrink-0" />
                    <span>Exclusive client promotions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Header Banner: Compact, stylish banner shown only on mobile */}
            <div className="md:hidden bg-[#18181b] text-white p-4 text-center relative border-b border-gray-800">
              <h2 className="text-lg font-bold uppercase tracking-wider text-white font-play">
                Stitch My Clothes
              </h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Custom Tailored Menswear</p>
            </div>

            {/* Right Column: Unified Form */}
            <div className="flex-1 p-6 sm:p-10 flex flex-col justify-center bg-white">
              {step === "email" ? (
                /* ================= STEP 1: EMAIL & GOOGLE ================= */
                <div className="space-y-5 max-w-sm mx-auto w-full">
                  <div className="space-y-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-black font-play">
                      Welcome Back
                    </h3>
                    <p className="text-xs text-gray-500 font-normal leading-relaxed">
                      Enter your email to sign in or create an account. No password needed.
                    </p>
                  </div>

                  {/* 1-Tap Google OAuth */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleOAuth}
                    disabled={isGoogleSubmitting || isSubmitting}
                    className="w-full h-11 border-gray-300 hover:border-black hover:bg-gray-50 transition-all text-xs font-bold font-play text-gray-800 flex items-center justify-center gap-2.5 rounded-lg shadow-2xs"
                  >
                    {isGoogleSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-gray-600" />
                    ) : (
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span>Continue with Google</span>
                  </Button>

                  {/* Divider */}
                  <div className="relative flex items-center justify-center my-1">
                    <div className="w-full border-t border-gray-200" />
                    <span className="absolute bg-white px-3 text-[11px] font-bold uppercase text-gray-400 font-play tracking-wider">
                      or with email
                    </span>
                  </div>

                  {/* Email Input Form */}
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="auth-email-input"
                        className="text-xs font-bold text-gray-700 uppercase font-play tracking-wide"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="auth-email-input"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="m@example.com"
                          autoComplete="email"
                          className="w-full h-11 pl-10 pr-3.5 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#A7120B] focus:border-[#A7120B] transition-all font-play"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting || isGoogleSubmitting}
                      className="w-full h-11 bg-[#A7120B] hover:bg-[#8e0f09] text-white rounded-lg text-sm font-bold font-play transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Sending code...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Verification Code</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Security Footer */}
                  <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-gray-500 font-normal">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#A7120B]" />
                    <span>Passwordless & secure email verification</span>
                  </div>
                </div>
              ) : (
                /* ================= STEP 2: 6-DIGIT OTP ================= */
                <div className="space-y-5 max-w-sm mx-auto w-full">
                  <div className="space-y-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mb-1">
                      <Mail className="w-3 h-3" />
                      Code Sent
                    </div>
                    <h3 className="text-2xl font-bold text-black font-play">
                      Check Your Inbox
                    </h3>
                    <p className="text-xs text-gray-500 font-normal leading-relaxed">
                      Enter the 6-digit verification code sent to:
                    </p>
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 text-xs text-gray-900 font-bold font-play mt-1">
                      <span className="truncate max-w-[200px]">{email}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setStep("email");
                          setOtp(["", "", "", "", "", ""]);
                        }}
                        className="text-gray-500 hover:text-black transition-colors p-0.5"
                        title="Edit email"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* 6 Individual Numeric OTP Boxes - Fully responsive */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            otpInputRefs.current[index] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-10 sm:w-12 h-12 sm:h-14 text-center text-xl sm:text-2xl font-bold font-mono rounded-lg border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-[#A7120B] focus:border-[#A7120B] transition-all bg-gray-50"
                        />
                      ))}
                    </div>

                    <Button
                      type="button"
                      onClick={() => verifyOtpCode()}
                      disabled={isSubmitting || otp.includes("")}
                      className="w-full h-11 bg-[#A7120B] hover:bg-[#8e0f09] text-white rounded-lg text-sm font-bold font-play transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <span>Verify & Sign In</span>
                      )}
                    </Button>
                  </div>

                  {/* Resend & Back Controls */}
                  <div className="pt-2 flex items-center justify-between text-xs text-gray-600 border-t border-gray-100 font-play">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("email");
                        setOtp(["", "", "", "", "", ""]);
                      }}
                      className="hover:text-black transition-colors text-xs font-semibold"
                    >
                      ← Back to email
                    </button>

                    <div>
                      {resendCooldown > 0 ? (
                        <span className="text-xs font-mono text-gray-400">
                          Resend in {resendCooldown}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={isSubmitting}
                          className="text-xs font-bold text-[#A7120B] hover:underline transition-colors"
                        >
                          Resend code
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccountPopUp;
