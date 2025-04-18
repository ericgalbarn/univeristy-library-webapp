"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { UserListItem } from "./UserList";
import Image from "next/image";
import UserEditModal from "./UserEditModal";
import UserDetailsModal from "./UserDetailsModal";

interface UserRowProps {
  user: UserListItem;
  onUserUpdated: () => void;
}

const UserRow = ({ user, onUserUpdated }: UserRowProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-6 gap-4 border-b border-gray-200 p-4 hover:bg-gray-50">
        <div className="col-span-2 flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-amber-100">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900">{user.fullName}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center">{user.universityId}</div>

        <div className="flex items-center">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              user.status === "APPROVED"
                ? "bg-green-100 text-green-800"
                : user.status === "REJECTED"
                  ? "bg-red-100 text-red-800"
                  : "bg-amber-100 text-amber-800"
            }`}
          >
            {user.status}
          </span>
        </div>

        <div className="flex items-center">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              user.role === "ADMIN"
                ? "bg-purple-100 text-purple-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {user.role}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            className="h-8 w-8 rounded-full bg-transparent p-0 hover:bg-gray-100"
            title="Edit User"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Image
              src="/icons/admin/edit.svg"
              alt="edit"
              width={16}
              height={16}
            />
          </Button>

          <Button
            className="h-8 w-8 rounded-full bg-transparent p-0 hover:bg-gray-100"
            title="View Details"
            onClick={() => setIsDetailsModalOpen(true)}
          >
            <Image
              src="/icons/admin/user.svg"
              alt="view"
              width={16}
              height={16}
            />
          </Button>
        </div>
      </div>

      {isEditModalOpen && (
        <UserEditModal
          user={user}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={onUserUpdated}
        />
      )}
      
      <UserDetailsModal
        userId={user.id}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </>
  );
};

export default UserRow;
