import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { authService, usersService } from "@/services/escrows.service";
import { toast } from "sonner";
import type { ForgotPasswordResponse, ResetPasswordResponse } from "@/types";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const { setUser, logout: storeLogout } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      sessionStorage.setItem("accessToken", data.data.accessToken);
      sessionStorage.setItem("refreshToken", data.data.refreshToken);
      sessionStorage.setItem("user", JSON.stringify(data.data.user));
      setUser(data.data.user);
      navigate("/dashboard");

      toast.success("Welcome back!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Login failed");
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      sessionStorage.setItem("accessToken", data.data.accessToken);
      sessionStorage.setItem("refreshToken", data.data.refreshToken);
      sessionStorage.setItem("user", JSON.stringify(data.data.user));
      navigate("/dashboard");
      toast.success("Account created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Registration failed");
    },
  });

  const getNonce = useMutation({
    mutationFn: async (walletAddress: string) => {
      const response = await authService.getNonce({ walletAddress });
      return response.data; // Axios wraps it in .data
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to get nonce");
    },
  });

  const metamaskLogin = useMutation({
    mutationFn: (data: { walletAddress: string; signature: string }) =>
      authService.metamaskLogin(data),
    onSuccess: (data) => {
      sessionStorage.setItem("accessToken", data.data.accessToken);
      sessionStorage.setItem("refreshToken", data.data.refreshToken);
      sessionStorage.setItem("user", JSON.stringify(data.data.user));
      setUser(data.data.user);
      navigate("/dashboard");
      toast.success("MetaMask login successful!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "MetaMask login failed");
    },
  });

  // Logout function
  const logout = () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    storeLogout();
    queryClient.clear();
    toast.success("Logged out successfully");
  };

  // Get user profile
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => usersService.getProfile().then((res) => res.data),
    enabled: !!sessionStorage.getItem("accessToken"),
  });

  // Side effect for user profile
  if (userProfile) {
    sessionStorage.setItem("user", JSON.stringify(userProfile));
  }

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await authService.forgotPassword(email);
      return response.data; // This will be ForgotPasswordResponse
    },
    onSuccess: (data: ForgotPasswordResponse) => {
      toast.success(data.message || "Password reset link sent to your email");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send reset link");
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      token: string;
      newPassword: string;
    }) => {
      const response = await authService.resetPassword(data);
      return response.data; // This will be ResetPasswordResponse
    },
    onSuccess: (data: ResetPasswordResponse) => {
      toast.success(data.message || "Password reset successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to reset password");
    },
  });
  return {
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    getNonce: getNonce.mutateAsync,
    metamaskLogin: metamaskLogin.mutateAsync,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
    logout,
    isLoading:
      loginMutation.isPending ||
      registerMutation.isPending ||
      forgotPasswordMutation.isPending ||
      resetPasswordMutation.isPending ||
      metamaskLogin.isPending ||
      getNonce.isPending,
    user: userProfile,
  };
};
