import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { Images } from "@/utils/images";
import { toast } from "sonner";

const ResetPassword: React.FC = () => {
  const { resetPassword, isLoading } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get token from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get("token");
    const emailParam = urlParams.get("email");
    setToken(tokenParam);
    setEmail(emailParam);

    if (!tokenParam) {
      // Redirect to forgot password if no token
      navigate("/forgot-password");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      // You might want to show a toast here
      toast.error("Passwords do not match");
      console.error("Passwords do not match");
      return;
    }

    if (!token) {
      toast.info("No reset token found");
      console.error("No reset token found");
      return;
    }
    if (!email) {
      toast.info("No email found");
      console.error("No email found");
      return;
    }

    try {
      const result = await resetPassword({ email, token, newPassword });

      if (result?.success) {
        setIsSubmitted(true);
        toast.success("Password reset successful");
      }
    } catch (error) {
      // Error handled by the auth hook
      console.error("Failed to reset password:", error);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8 text-center"
        >
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-black dark:text-white">
              Password reset successful!
            </h1>
            <p className="text-muted-foreground text-lg">
              Your password has been updated successfully.
            </p>
            <p className="text-sm text-muted-foreground">
              You can now log in with your new password.
            </p>
          </div>

          <div className="pt-6">
            <Link to="/login">
              <Button className="w-full">Continue to login</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">
            Invalid reset link
          </h1>
          <p className="text-muted-foreground">
            This password reset link is invalid or has expired.
          </p>
          <Link to="/forgot-password">
            <Button>Get new reset link</Button>
          </Link>
        </div>
      </div>
    );
  }

  const passwordsMatch = newPassword === confirmPassword;
  const isFormValid = newPassword && confirmPassword && passwordsMatch;

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Header */}
          <div className="space-y-2">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to login
            </Link>

            <div className="text-center">
              <div className="w-28 h-28 rounded-xl flex items-center justify-center mx-auto mb-4">
                {/* <span className="text-primary-foreground font-bold text-lg">
                             OPEscrow
                           </span> */}
                <img src={Images.dark_logo} alt="Logo" />
              </div>
              <h1 className="text-3xl font-bold">Create new password</h1>
              <p className="text-muted-foreground mt-2">
                Your new password must be different from previous passwords
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  icon={<Lock className="h-4 w-4" />}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  icon={<Lock className="h-4 w-4" />}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {confirmPassword && !passwordsMatch && (
                <p className="text-sm text-destructive">
                  Passwords do not match
                </p>
              )}

              {passwordsMatch && confirmPassword && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  Passwords match
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={!isFormValid}
            >
              Reset password
            </Button>
          </form>

          {/* Help text */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                Back to login
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right side - Illustration */}
      <div className="flex-1 bg-gradient-to-br from-primary to-primary/80 hidden lg:flex items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center text-primary-foreground"
        >
          <div className="w-32 h-32 bg-primary-foreground/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Lock className="h-16 w-16" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Secure Your Account</h2>
          <p className="text-xl opacity-90">
            Create a strong, unique password to protect your account
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
