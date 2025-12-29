import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { Images } from "@/utils/images";
import { useMetaMask } from "@/hooks/useMetaMask";
import { toast } from "sonner";

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
  });
  const {
    connectWallet,
    isConnecting,
    isMetaMaskInstalled,
    account,
    signMessage,
    disconnectWallet,
  } = useMetaMask();

  const { login, register, isLoading, getNonce, metamaskLogin } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      login({ email: formData.email, password: formData.password });
    } else {
      register({
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
        authProvider: walletConnected ? "metamask" : "local",
        walletAddress: walletConnected ? account! : undefined,
      });
    }
  };

  const handleMetaMaskClick = async () => {
    if (isLogin && !walletConnected) {
      try {
        if (!isMetaMaskInstalled) {
          toast.error("MetaMask not detected. Please install it to continue.");
          return;
        }

        // If wallet not yet connected, connect first
        let walletAddress = account;
        if (!walletAddress) {
          const result = await connectWallet();
          if (!result.success || !result.account) {
            toast.error(result.error || "Failed to connect wallet.");
            return;
          }
          walletAddress = result.account;

          // Brief pause to ensure wallet state is settled
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Step 2: Get nonce
        const { nonce } = await getNonce(walletAddress);
        if (!nonce) {
          toast.error("Failed to get nonce from server.");
          return;
        }

        // Step 3: Sign message with small delay to ensure wallet readiness
        await new Promise((resolve) => setTimeout(resolve, 100));
        console.log("Before signMessage - account:", walletAddress);
        console.log(
          "Before signMessage - ethereum available:",
          !!window.ethereum
        );

        const signature = await signMessage(
          `Login to OP Escrow \nNonce: ${nonce}`
        );

        console.log("After signMessage - signature:", signature);
        if (!signature) {
          toast.error("Message signing cancelled or failed.");
          return;
        }

        // Step 3: Verify on backend
        await metamaskLogin({
          walletAddress: String(walletAddress),
          signature,
        });

        // if (data?.accessToken) {
        //   // Step 4: Save token
        //   sessionStorage.setItem("token", data.accessToken);
        //   toast.success("Logged in successfully via MetaMask!");
        // } else {
        //   toast.error("MetaMask login failed: no token received.");
        // }
      } catch (err) {
        console.error("MetaMask login error:", err);
        // toast.error("Something went wrong during MetaMask login.");
      }

      if (walletConnected) {
        await disconnectWallet();
        setWalletConnected(false);
        return;
      }
    } else {
      console.log("Signup Action");
      const result = walletConnected
        ? disconnectWallet()
        : await connectWallet();

      if (result?.success && result.account) {
        console.log("Connected account:", result);
        setWalletConnected(true);

        toast.success(
          `Connected: ${result.account.slice(0, 6)}...${result.account.slice(
            -4
          )}`
        );
      } else {
        setWalletConnected(false);
      }
    }
  };

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
          <div className="text-center">
            <div className="w-28 h-28 rounded-xl flex items-center justify-center mx-auto mb-4">
              {/* <span className="text-primary-foreground font-bold text-lg">
                OPEscrow
              </span> */}
              <img src={Images.dark_logo} alt="Logo" />
            </div>
            <h1 className="text-3xl font-bold text-black dark:text-gray-100">
              Welcome back
            </h1>
            <p className="text-muted-foreground mt-2">
              {isLogin ? "Sign in to your account" : "Create your account"}
            </p>
          </div>

          {/* MetaMask Button */}
          <Button
            variant={walletConnected ? "destructive" : "secondary"}
            className="w-full"
            disabled={isConnecting || !isMetaMaskInstalled}
            isLoading={isConnecting}
            onClick={handleMetaMaskClick}
          >
            <Wallet className="h-4 w-4 mr-2" />
            {isLogin
              ? "Login with MetaMask"
              : walletConnected
              ? "Disconnect MetaMask"
              : "Connect MetaMask"}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-y-0 flex items-center">
              <div className="w-full border-t border-muted-foreground/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2  text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input
                placeholder="Display Name"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    displayName: e.target.value,
                  }))
                }
                required={!isLogin}
              />
            )}

            <Input
              type="email"
              placeholder="Email address"
              icon={<Mail className="h-4 w-4" />}
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                icon={<Lock className="h-4 w-4" />}
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                required
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

            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-muted-foreground/20"
                  />
                  <span className="ml-2 text-black dark:text-gray-100">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            <Button type="submit" className="w-full" isLoading={isLoading}>
              {isLogin ? "Sign in" : "Create account"}
            </Button>
          </form>

          {/* Switch mode */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
            </span>
            <button
              type="button"
              className="text-primary hover:underline font-medium"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
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
            <Wallet className="h-16 w-16" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Secure Escrow Service</h2>
          <p className="text-xl opacity-90">
            Trustless transactions with blockchain technology
          </p>
        </motion.div>
      </div>
    </div>
  );
};
