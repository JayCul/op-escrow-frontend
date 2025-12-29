import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { Images } from "@/utils/images";

const ForgotPassword: React.FC = () => {
  const { forgotPassword, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const dark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await forgotPassword(email);
      if (result?.success) {
        setIsSubmitted(true);
      }
    } catch (error) {
      // Error handled by the auth hook
      console.error("Failed to send reset link:", error);
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
            <h1 className="text-3xl font-bold text-foreground">
              Check your email
            </h1>
            <p className="text-muted-foreground text-lg">
              We've sent a password reset link to
            </p>
            <p className="text-primary font-medium text-lg">{email}</p>
            <p className="text-sm text-muted-foreground">
              If you don't see the email, check your spam folder or try again.
            </p>
          </div>

          <div className="space-y-4 pt-6">
            <Button
              onClick={() => setIsSubmitted(false)}
              variant="outline"
              className="w-full"
            >
              Try another email
            </Button>
            <Link to="/login">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to login
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

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

            <div className="text-center flex flex-col items-center">
              <div className="flex items-center justify-center h-20 w-20 rounded-xl bg-white/40 dark:bg-white/10">
                <img
                  src={dark ? Images.dark_logo : Images.light_logo}
                  alt="Logo"
                  className="h-20 w-auto object-contain"
                />
              </div>
              <h1 className="text-3xl font-bold text-black dark:text-white">
                Reset your password
              </h1>
              <p className="text-muted-foreground mt-2">
                Enter your email and we'll send you a reset link
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email address"
                icon={<Mail className="h-4 w-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={!email}
            >
              Send reset link
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
            <Mail className="h-16 w-16" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Reset Your Password</h2>
          <p className="text-xl opacity-90">
            Secure and easy password recovery
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
