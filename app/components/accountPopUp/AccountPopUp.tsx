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
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import {
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Edit2,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  MapPin,
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

  // Reset form when modal closes/opens
  useEffect(() => {
    if (!accountMenuOpen) {
      setTimeout(() => {
        setStep("email");
        setOtp(["", "", "", "", "", ""]);
        setIsSubmitting(false);
        setIsGoogleSubmitting(false);
      }, 200);
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
      toast.error(err?.errors?.[0]?.longMessage || err?.message || "Failed to initiate Google sign in.");
      setIsGoogleSubmitting(false);
    }
  };

  // Step 1: Submit Email (Determine Sign-In vs Sign-Up and trigger OTP)
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
      // 1. First attempt to initiate Sign-In
      const signInAttempt = await signIn.create({
        identifier: cleanEmail,
      });

      // User exists! Prepare Email Code OTP
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
        // Fallback: If email_code is not a supported factor, attempt reset/sign up
        throw new Error("Email code verification not supported for this account.");
      }
    } catch (err: any) {
      const errorCode = err?.errors?.[0]?.code;

      // 2. User does not exist (form_identifier_not_found) -> Trigger Sign-Up seamlessly
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
          toast.success("Verification code sent! Welcome to the atelier.");
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
            "Unable to sign in with this email. Please try again."
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
      toast.success("A fresh verification code has been sent!");
    } catch (err: any) {
      toast.error(err?.errors?.[0]?.longMessage || "Failed to resend code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Handle individual digit inputs for OTP
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric inputs
    const numericValue = value.replace(/[^0-9]/g, "");

    if (numericValue.length > 1) {
      // Handle paste of full code
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

    // Auto-advance to next box
    if (numericValue && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
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
          console.log("Sign-in incomplete status:", completeSignIn.status);
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
          console.log("Sign-up incomplete status:", completeSignUp.status);
          toast.info("Verification step required.");
        }
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      toast.error(
        err?.errors?.[0]?.longMessage ||
          err?.message ||
          "Invalid or expired verification code. Please check and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Header click handler
  const handleOnClickAccountMenu = () => {
    if (isUserLoaded && isSignedIn) {
      setUserDetailsOpen(true);
    } else {
      setAccountMenuOpen(true);
    }
  };

  return (
    <div className="z-[600]">
      {/* Navbar Avatar / Login Trigger */}
      <button
        type="button"
        onClick={handleOnClickAccountMenu}
        className="flex items-center gap-2 font-medium text-sm transition-all focus:outline-none"
        aria-label={isSignedIn ? "Account Profile" : "Sign In to your Account"}
      >
        {isUserLoaded && isSignedIn ? (
          <div className="flex items-center gap-2 group">
            {user?.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt={user.fullName || "User Avatar"}
                width={32}
                height={32}
                className="rounded-full ring-2 ring-stone-200 group-hover:ring-stone-400 transition-all object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-stone-200">
                {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <span className="hidden xl:inline text-xs font-serif tracking-wide text-stone-700 group-hover:text-black">
              {user?.firstName || "My Account"}
            </span>
          </div>
        ) : (
          <span className="font-serif tracking-wider uppercase text-xs px-3 py-1.5 rounded-full border border-stone-300 text-stone-800 hover:border-black hover:text-black transition-all">
            Sign In
          </span>
        )}
      </button>

      {/* 1. Logged-in Profile Modal */}
      <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-2xl border border-stone-200 shadow-2xl bg-white">
          <DialogTitle className="sr-only">Atelier Profile</DialogTitle>
          <DialogDescription className="sr-only">
            View your account details, measurements, and session information.
          </DialogDescription>

          {/* Profile Header */}
          <div className="bg-stone-950 text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="relative z-10 flex items-center gap-4">
              {user?.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt={user?.fullName || "User Avatar"}
                  width={68}
                  height={68}
                  className="rounded-full ring-4 ring-white/10 object-cover shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-stone-800 border border-white/20 flex items-center justify-center text-white text-xl font-serif">
                  {user?.firstName?.[0] || "U"}
                </div>
              )}
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Atelier Client
                </span>
                <h3 className="text-xl font-serif font-medium mt-1 text-white">
                  {user?.fullName || user?.firstName || "Valued Client"}
                </h3>
                <p className="text-xs text-stone-400">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Account Details Body */}
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-[10px] text-stone-500 uppercase font-mono">Authentication</p>
                  <p className="font-medium text-stone-800">Verified & Active</p>
                </div>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-stone-600 shrink-0" />
                <div>
                  <p className="text-[10px] text-stone-500 uppercase font-mono">Member Since</p>
                  <p className="font-medium text-stone-800">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "2025"}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-stone-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUserDetailsOpen(false)}
                className="text-stone-600 hover:text-stone-900 border-stone-200"
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
                className="bg-red-800 hover:bg-red-900 text-white flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. Unified Passwordless Sign-In & Sign-Up Modal */}
      <Dialog open={accountMenuOpen} onOpenChange={setAccountMenuOpen}>
        <DialogContent className="sm:max-w-[850px] p-0 overflow-hidden rounded-2xl border border-stone-200 shadow-2xl bg-white focus:outline-none">
          <DialogTitle className="sr-only">Atelier Authentication</DialogTitle>
          <DialogDescription className="sr-only">
            Sign in or create your Stitch My Clothes atelier account using email OTP or Google.
          </DialogDescription>

          <div className="flex flex-col md:flex-row w-full min-h-[520px]">
            {/* Left Column: Bespoke Atelier Editorial Showcase */}
            <div className="md:w-[42%] w-full relative bg-stone-950 text-white flex flex-col justify-between p-8 overflow-hidden min-h-[220px] md:min-h-full">
              {/* Background Editorial Image */}
              <Image
                src="https://res.cloudinary.com/djndrffon/image/upload/v1742900248/loginImage_hcarbc.jpg"
                alt="Bespoke Menswear"
                fill
                priority
                className="object-cover object-top opacity-55"
              />
              {/* Luxury Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-950/40" />

              {/* Top Branding */}
              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10px] tracking-widest uppercase font-mono text-stone-200">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Bespoke Menswear
                </div>
                <h2 className="text-2xl font-serif tracking-wider font-light uppercase text-white">
                  Stitch My Clothes
                </h2>
              </div>

              {/* Bottom Editorial Copy & Perks */}
              <div className="relative z-10 space-y-4 pt-8 md:pt-0">
                <div className="space-y-1">
                  <h3 className="text-lg font-serif font-medium text-white">
                    Crafted for Perfection.
                  </h3>
                  <p className="text-xs text-stone-300 leading-relaxed font-light">
                    Join our atelier to save custom 3D shirt configurations, fabric swatches, and bespoke measurements.
                  </p>
                </div>

                <div className="space-y-1.5 text-[11px] text-stone-300 font-light border-t border-white/10 pt-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Instant 1-click passwordless login</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Saved tailored measurement profile</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Exclusive atelier discounts & perks</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Unified Passwordless Auth Form */}
            <div className="flex-1 p-8 sm:p-10 flex flex-col justify-center bg-white">
              {step === "email" ? (
                /* ================= STEP 1: EMAIL & GOOGLE ================= */
                <div className="space-y-6 max-w-sm mx-auto w-full">
                  <div className="space-y-1.5 text-center md:text-left">
                    <h3 className="text-2xl font-serif font-medium text-stone-900 tracking-tight">
                      Welcome to the Atelier
                    </h3>
                    <p className="text-xs text-stone-500 font-light leading-relaxed">
                      Enter your email to sign in or create an account. No passwords required.
                    </p>
                  </div>

                  {/* 1-Tap Google OAuth */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleOAuth}
                    disabled={isGoogleSubmitting || isSubmitting}
                    className="w-full h-11 border-stone-200 hover:border-stone-400 hover:bg-stone-50/80 transition-all text-xs font-medium text-stone-800 flex items-center justify-center gap-2.5 rounded-xl shadow-xs"
                  >
                    {isGoogleSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-stone-600" />
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

                  {/* Clean Divider */}
                  <div className="relative flex items-center justify-center">
                    <div className="w-full border-t border-stone-200" />
                    <span className="absolute bg-white px-3 text-[11px] font-mono uppercase tracking-wider text-stone-400">
                      or with email
                    </span>
                  </div>

                  {/* Email Input Form */}
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="auth-email" className="text-xs font-medium text-stone-700">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="auth-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="client@example.com"
                          autoComplete="email"
                          className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-stone-200 text-stone-900 placeholder:text-stone-400 text-xs focus:outline-none focus:ring-2 focus:ring-red-900/15 focus:border-red-900 transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting || isGoogleSubmitting}
                      className="w-full h-11 bg-red-900 hover:bg-red-950 text-white rounded-xl text-xs font-medium transition-all shadow-sm flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Sending code...</span>
                        </>
                      ) : (
                        <>
                          <span>Continue with Email</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Security Note */}
                  <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-stone-400 font-light">
                    <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                    <span>Passwordless & secure email verification</span>
                  </div>
                </div>
              ) : (
                /* ================= STEP 2: 6-DIGIT OTP ================= */
                <div className="space-y-6 max-w-sm mx-auto w-full">
                  <div className="space-y-1.5 text-center md:text-left">
                    <div className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 font-medium bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 mb-1">
                      <Mail className="w-3 h-3" />
                      Code Sent
                    </div>
                    <h3 className="text-2xl font-serif font-medium text-stone-900 tracking-tight">
                      Check Your Inbox
                    </h3>
                    <p className="text-xs text-stone-500 font-light leading-relaxed">
                      Enter the 6-digit verification code sent to:
                    </p>
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200/80 text-xs text-stone-800 font-medium mt-1">
                      <span className="truncate max-w-[210px]">{email}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setStep("email");
                          setOtp(["", "", "", "", "", ""]);
                        }}
                        className="text-stone-500 hover:text-stone-900 transition-colors p-0.5"
                        title="Edit email"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* 6 Individual OTP Boxes */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
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
                          className="w-11 h-13 text-center text-xl font-mono font-semibold rounded-xl border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900 transition-all bg-stone-50/50 shadow-2xs"
                        />
                      ))}
                    </div>

                    <Button
                      type="button"
                      onClick={() => verifyOtpCode()}
                      disabled={isSubmitting || otp.includes("")}
                      className="w-full h-11 bg-red-900 hover:bg-red-950 text-white rounded-xl text-xs font-medium transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <span>Verify & Continue</span>
                      )}
                    </Button>
                  </div>

                  {/* Resend & Back Controls */}
                  <div className="pt-2 flex items-center justify-between text-xs text-stone-500 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("email");
                        setOtp(["", "", "", "", "", ""]);
                      }}
                      className="hover:text-stone-900 transition-colors text-[11px]"
                    >
                      ← Back to email
                    </button>

                    <div>
                      {resendCooldown > 0 ? (
                        <span className="text-[11px] font-mono text-stone-400">
                          Resend in {resendCooldown}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={isSubmitting}
                          className="text-[11px] font-medium text-red-900 hover:underline transition-colors"
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
    </div>
  );
};

export default AccountPopUp;
