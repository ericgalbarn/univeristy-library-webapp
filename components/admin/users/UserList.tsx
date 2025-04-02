import React from "react";
import UserRow from "./UserRow";
import { ROLE_ENUM, STATUS_ENUM } from "@/db/schema";

export type UserListItem = {
  id: string;
  fullName: string;
  email: string;
  universityId: number;
  status: (typeof STATUS_ENUM.enumValues)[number];
  role: (typeof ROLE_ENUM.enumValues)[number];
};

interface UserListProps {
  users: UserListItem[];
}

const UserList = ({ users }: UserListProps) => {
  return (
    <div className="rounded-lg border border-gray-200">
      <div className="grid grid-cols-6 gap-4 border-b border-gray-200 bg-gray-50 p-4 font-medium">
        <div className="col-span-2">Name / Email</div>
        <div>University ID</div>
        <div>Status</div>
        <div>Role</div>
        <div>Actions</div>
      </div>

      {users && users.length > 0 ? (
        <div>
          {users.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500">No users found</div>
      )}
    </div>
  );
};

export default UserList;
