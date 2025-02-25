"use client";
import { FormEvent, JSX, SVGProps, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { LoaderCircle } from "lucide-react"; // ✅ Import LoaderCircle

export default function Signin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Loading state

  // 🔹 Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/user/me`, {
          withCredentials: true,
        });

        if (response.data) {
          router.push("/blogs"); // Redirect if authenticated
        }
      } catch (error) {
        console.log("User not authenticated, staying on sign-in page.");
      }
    };

    checkAuth();
  }, [router]);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSignin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      await axios.post(
        `${BACKEND_URL}/api/v1/user/signin`,
        { username, password },
        { withCredentials: true }
      );

      router.push("/blogs"); // Redirect after successful login
    } catch (error: any) {
      setError(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md px-6 py-8 space-y-6 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Sign in to your account</h1>
          <p className="text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline" prefetch={false}>
              Sign up
            </Link>
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSignin}>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              onChange={(e) => setUsername(e.target.value)}
              id="email"
              type="email"
              placeholder="name@example.com"
              required
            />
          </div>
          <div className="relative">
            <Label htmlFor="password">Password</Label>
            <Input
              onChange={(e) => setPassword(e.target.value)}
              id="password"
              type={passwordVisible ? "text" : "password"}
              placeholder="********"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute bottom-2 right-2 h-7 w-7"
              onClick={togglePasswordVisibility}
            >
              <EyeIcon className="h-4 w-4" />
              <span className="sr-only">Toggle password visibility</span>
            </Button>
          </div>

          {error && <div className="text-red-500">{error}</div>}
          
          {/* ✅ Sign-in Button with Loading State */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function EyeIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
