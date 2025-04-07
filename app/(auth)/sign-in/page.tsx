"use client";

import AuthForm from "@/components/AuthForm";
import { signInWithCredentials } from "@/lib/actions/auth";
import { signInSchema } from "@/lib/validation";
import Link from "next/link";
import React from "react";

const Page = () => (
  <div className="space-y-4">
    <AuthForm
      type="SIGN_IN"
      schema={signInSchema}
      defaultValues={{
        email: "",
        password: "",
      }}
      onSubmit={signInWithCredentials}
    />

    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <input
          id="remember-me"
          name="remember-me"
          type="checkbox"
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label
          htmlFor="remember-me"
          className="ml-2 block text-sm text-gray-900"
        >
          Remember me
        </label>
      </div>

      <div className="text-sm">
        <Link
          href="/forgot-password"
          className="font-medium text-primary hover:text-primary/80"
        >
          Forgot password?
        </Link>
      </div>
    </div>
  </div>
);

export default Page;
