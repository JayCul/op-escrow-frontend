import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useIsAdmin } from "@/stores/auth.store";

const normalNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
];

const adminNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Escalations", href: "/escalations", icon: FileText }, //Disputed Escrows
  { name: "Users", href: "/users", icon: Users }, //List of Users
];

export const Sidebar: React.FC = () => {
  const navigation = useIsAdmin() ? adminNavigation : normalNavigation;
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "relative flex flex-col transition-all duration-300 border-r h-full",
        "bg-gradient-to-b from-blue-100 via-blue-200 to-blue-300 h-screen",
        "dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a]",
        collapsed ? "sm:w-20 w-0" : "w-64"
      )}
    >
      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute sm:-right-3 -right-6 top-6 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md transition-transform z-10",
          "hover:scale-105"
        )}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Navigation */}
      <nav
        className={cn(
          "flex flex-col mt-20 space-y-2 px-3 transition-all duration-300",
          collapsed && "items-center px-2"
        )}
      >
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full",
                collapsed ? "justify-center hidden sm:flex" : "",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
