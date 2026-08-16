"use client";

import Link from "next/link";
import { ALLOWED_ADMIN_EMAIL } from "@/lib/authConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Register() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50/50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Registration Closed</CardTitle>
          <CardDescription>
            CMS access is restricted to one admin account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <p className="text-sm text-gray-600">
              Only {ALLOWED_ADMIN_EMAIL} can log in. Please use the admin login page.
            </p>
            <Link href="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
