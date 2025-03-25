"use client";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { useAtom, useStore } from "jotai";
import { accountMenuState } from "@/app/utils/data/store";
import { useEffect, useState } from "react";
import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { toast } from "sonner";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

// Define type for form data to improve type safety
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp: string;
  password: string;
  country: string;
  zipCode: string;
}

const AccountPopUp = () => {
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useAtom(accountMenuState, {
    store: useStore(),
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSignup, setIsSignup] = useState(true);
  const [hasShownPopup, setHasShownPopup] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    whatsapp: "",
    password: "",
    country: "",
    zipCode: "",
  });
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const { isLoaded: isSignUpLoaded, signUp, setActive } = useSignUp();
  const {
    isLoaded: isSignInLoaded,
    signIn,
    setActive: setSignInActive,
  } = useSignIn();

  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignupSubmit = async () => {
    if (!isSignUpLoaded) return;

    try {
      const result = await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        unsafeMetadata: {
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          country: formData.country,
          zipCode: formData.zipCode,
        },
      });
      console.log(result);

      // Prepare email verification
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingVerification(true);
      setShowVerificationDialog(true);
      setAccountMenuOpen(false);
    } catch (err: any) {
      toast.error("Error during sign up: " + err.message);
    }
  };

  const handleLoginSubmit = async () => {
    if (!isSignInLoaded) return;

    try {
      const result = await signIn.create({
        strategy: "password",
        identifier: formData.email,
        password: formData.password,
      });

      if (result.status === "complete") {
        await setSignInActive({ session: result.createdSessionId });
        setAccountMenuOpen(false);
        toast.success("Successfully signed in!");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error("Error during sign in: " + err.message);
    }
  };

  const handleVerification = async () => {
    if (!isSignUpLoaded || !isSignInLoaded) return;

    try {
      if (true || pendingVerification &&
        (signUp as any).status === "email_code"
      ) {
        // Handle email verification
        const completeSignUp = await signUp.attemptEmailAddressVerification({
          code: verificationCode,
        });

        if (completeSignUp.status === "complete") {
          await setActive({ session: completeSignUp.createdSessionId });
          setShowVerificationDialog(false);
          toast.success("Email verified successfully!");
        }
      } 
      // else {
      //   // Handle password reset
      //   const result = await signIn.attemptFirstFactor({
      //     strategy: "reset_password_email_code",
      //     code: verificationCode,
      //   });

      //   if (result.status === "needs_new_password") {
      //     setShowVerificationDialog(false);
      //     setShowResetPasswordDialog(true);
      //   }
      // }
    } catch (err: any) {
      toast.error("Error during verification: " + err.message);
    }
  };

  const handleOnClickAccountMenu = () => {
    if (isLoaded && isSignedIn) {
      setLogoutDialogOpen(true);
    } else {
      setAccountMenuOpen(true);
    }
  };

  const showUserDetailsHandler = () => {
    console.log("clicked");
    setUserDetailsOpen((prev) => !prev);
  };

  const handleforgotpassword = async () => {
    if (!isSignInLoaded) return;

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: formData.email,
      });

      toast.success("Password reset email sent! Check your inbox.");
      setShowVerificationDialog(true);
      setAccountMenuOpen(false);
      setPendingVerification(true);
    } catch (err: any) {
      toast.error("Error sending reset email: " + err.message);
    }
  };

  const handleResetPassword = async () => {
    if (!isSignInLoaded) return;

    try {
      const result = await signIn.resetPassword({
        password: newPassword,
      });

      if (result.status === "complete") {
        await setSignInActive({ session: result.createdSessionId });
        setShowResetPasswordDialog(false);
        toast.success("Password reset successfully!");
      }
    } catch (err: any) {
      toast.error("Error resetting password: " + err.message);
    }
  };

  return (
    <div className="z-[600]">
      {/* <Dialog open={accountMenuOpen} onOpenChange={setAccountMenuOpen}>
        <DialogTrigger asChild>
          <div className="relative"> */}
      <button
        onClick={handleOnClickAccountMenu}
        className="lg:flex relative font-bold font-play"
      >
        {isSignedIn ? (
          <Image
            src={user.imageUrl}
            alt={`${user?.firstName || ""} ${user?.lastName || ""}`}
            width={32}
            height={32}
            className="rounded-full"
            onClick={showUserDetailsHandler}
          />
        ) : (
          "Login"
        )}
      </button>
      {/* </div>
        </DialogTrigger>
      </Dialog> */}

      <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle className="text-xl font-bold">
            Profile Details
          </DialogTitle>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-center mb-6">
              <Image
                src={user?.imageUrl!}
                alt="Profile"
                width={80}
                height={80}
                className="rounded-full"
              />
            </div>

            <div className="grid gap-2">
              <div>
                <Label className="font-semibold">Name</Label>
                <p className="text-gray-700">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>

              <div>
                <Label className="font-semibold">Email</Label>
                <p className="text-gray-700">
                  {user?.emailAddresses[0]?.emailAddress}
                </p>
              </div>

              <div>
                <Label className="font-semibold">Phone</Label>
                <p className="text-gray-700">
                  {(user as any)?.unsafeMetadata?.phone || "Not provided"}
                </p>
              </div>

              <div>
                <Label className="font-semibold">WhatsApp</Label>
                <p className="text-gray-700">
                  {(user as any)?.unsafeMetadata?.whatsapp || "Not provided"}
                </p>
              </div>

              <div>
                <Label className="font-semibold">Country</Label>
                <p className="text-gray-700">
                  {(user as any)?.unsafeMetadata?.country || "Not provided"}
                </p>
              </div>

              <div>
                <Label className="font-semibold">Zipcode</Label>
                <p className="text-gray-700">
                  {(user as any)?.unsafeMetadata?.zipCode || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="default"
                onClick={() => setUserDetailsOpen(false)}
                className="bg-gray-500 text-white hover:bg-gray-600"
              >
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  signOut();
                  setUserDetailsOpen(false);
                }}
                className="bg-[#c40600] hover:bg-[#a30500]"
              >
                Logout
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={accountMenuOpen} onOpenChange={setAccountMenuOpen}>
        <DialogContent className="sm:max-w-[725px] flex">
          <Card className="space-y-3">
            <Tabs defaultValue="signup">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="signup"
                  className="font-bold data-[state=active]:bg-[#c40600] data-[state=active]:text-white"
                  onClick={() => setIsSignup(true)}
                >
                  Discount-Sign Up
                </TabsTrigger>
                <TabsTrigger
                  value="login"
                  className="font-bold data-[state=active]:bg-[#c40600] data-[state=active]:text-white"
                  onClick={() => setIsSignup(false)}
                >
                  sign in
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <CardHeader>
                  <CardTitle className="font-bold">Sign In</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-login" className="font-bold">
                      Email
                    </Label>
                    <Input
                      id="email-login"
                      name="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-login" className="font-bold">
                      Password
                    </Label>
                    <Input
                      id="password-login"
                      name="password"
                      type="password"
                      required
                      onChange={handleInputChange}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-[#c40600]"
                    onClick={handleLoginSubmit}
                  >
                    Sign In
                  </Button>
                  <Button
                    type="submit"
                    className="w-full bg-[#c40600]"
                    onClick={handleforgotpassword}
                  >
                    Forgot Password
                  </Button>
                </CardFooter>
              </TabsContent>
              <TabsContent value="signup">
                <CardHeader>
                  <CardTitle>Sign Up</CardTitle>
                  <CardDescription>
                    Create a new account to get started
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="font-bold">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        required
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="font-bold">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        required
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-signup" className="font-bold">
                      Email
                    </Label>
                    <Input
                      id="email-signup"
                      name="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signup" className="font-bold">
                      Password
                    </Label>
                    <Input
                      id="password-signup"
                      name="password"
                      type="password"
                      required
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-bold">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1234567890"
                      required
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="font-bold">
                      WhatsApp
                    </Label>
                    <Input
                      id="whatsapp"
                      name="whatsapp"
                      type="tel"
                      placeholder="+1234567890"
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="country" className="font-bold">
                        Country
                      </Label>
                      <Input
                        id="country"
                        name="country"
                        placeholder="India"
                        required
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode" className="font-bold">
                        Zip Code
                      </Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        type="text"
                        required
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-[#c40600]"
                    onClick={handleSignupSubmit}
                  >
                    Sign Up
                  </Button>
                </CardFooter>
              </TabsContent>
            </Tabs>
          </Card>
          <div className="space-y-10 flex flex-col items-center justify-center md:block hidden">
            <div className="flex flex-col items-center justify-center space-y-2 pt-4 px-2">
              <h1 className="sm:text-4xl text-2xl font-bold text-[#646464]">
                GET 25% OFF
              </h1>
              <p className="text-md font-semibold text-center">
                shop at stich my clothes and get discounts.
              </p>
            </div>
            <Image
              src={
                "https://res.cloudinary.com/djndrffon/image/upload/v1742900248/loginImage_hcarbc.jpg"
              }
              alt="login"
              className="object-cover  w-[500px] h-[560px]"
              width={400}
              height={100}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
      >
        <DialogContent>
          <Card>
            <CardHeader>
              <CardTitle>Email Verification</CardTitle>
              <CardDescription>
                Enter the verification code sent to your email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-code" className="font-bold">
                  Verification Code
                </Label>
                <Input
                  id="verification-code"
                  name="verification-code"
                  type="text"
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-[#c40600]"
                onClick={handleVerification}
              >
                Verify Email
              </Button>
            </CardFooter>
          </Card>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showResetPasswordDialog}
        onOpenChange={setShowResetPasswordDialog}
      >
        <DialogContent>
          <Card>
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>Enter your new password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="font-bold">
                  New Password
                </Label>
                <Input
                  id="new-password"
                  name="new-password"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-[#c40600]"
                onClick={handleResetPassword}
              >
                Reset Password
              </Button>
            </CardFooter>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountPopUp;
