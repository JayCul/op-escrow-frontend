import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { usersService } from "@/services/escrows.service";

import { cn } from "@/utils/cn";
import type { User } from "@/types";

export const UsersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => usersService.getAll(),
    staleTime: 60000,
  });

  const filteredUsers = users?.data?.filter((user: User) => {
    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    return (
      user.displayName?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6  text-gray-900 dark:text-gray-100 ">
      <h1 className="text-2xl font-semibold mb-4 text-center">Users</h1>

      <div className="flex justify-end mb-6 gap-4">
        <Input
          className="w-96"
          placeholder="Search by name or email…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-gray-500">Loading users...</div>
      ) : filteredUsers?.length === 0 ? (
        <div className="text-gray-400">No users found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-blue-400 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Wallet</th>
                <th className="px-4 py-2 text-left">Verified</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers?.map((user: User) => (
                <tr
                  key={user._id}
                  className="border-b border-gray-200 dark:border-gray-700"
                >
                  <td className="px-4 py-2">{user.displayName}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2 break-all">{user.walletAddress}</td>
                  <td className="px-4 py-2">
                    <VerificationPill verified={user.isVerified} />
                  </td>
                  <td className="px-4 py-2">
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const VerificationPill: React.FC<{ verified: boolean }> = ({ verified }) => (
  <span
    className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
      verified
        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
        : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
    )}
  >
    {verified ? "Verified" : "Unverified"}
  </span>
);
