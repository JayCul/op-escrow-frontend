import React from "react";
import { Moon, Sun, LogOut, User } from "lucide-react";
import { useThemeStore } from "@/stores/theme.store";
import { useUser } from "@/stores/auth.store";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { Images } from "@/utils/images";

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();

  const user = useUser();
  const { logout } = useAuth();

  return (
    <header
      className={`
        border-b backdrop-blur-md supports-[backdrop-filter]:bg-background/60
        bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300
        dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a]
      `}
    >
      <div className="w-full flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/40 dark:bg-white/10">
            <img
              src={Images.dark_logo}
              alt="Logo"
              className="h-8 w-auto object-contain"
            />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100 hidden sm:inline">
            OP Escrow
          </span>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-full hover:bg-primary/10 transition-colors"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          {/* User Menu */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/70 dark:bg-muted/30">
                <User className="h-4 w-4 opacity-70" />
                <span className="text-sm font-medium">
                  {user.displayName || "User"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="h-9 w-9 rounded-full hover:bg-destructive/10 text-destructive"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
