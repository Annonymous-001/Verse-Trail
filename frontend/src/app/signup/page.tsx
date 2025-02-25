"use client";

import { FormEvent, JSX, SVGProps, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { LoaderCircle } from "lucide-react"; // ✅ Import LoaderCircle

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isnameFocused, setIsNameFocused] = useState(false);
  const [isemailFocused, setIsEmailFocused] = useState(false);

  // 🔹 Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/user/me`, {
          withCredentials: true,
        });
        if (response.data?.user) {
          router.push("/blogs");
        }
      } catch (error) {
        console.log("User is not authenticated", error);
      }
    };
    checkAuth();
  }, [router]);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/user/signup`,
        { username, password, name },
        { withCredentials: true }
      );
      console.log("Sign-up successful", response.data);
      router.push("/blogs");
    } catch (error: any) {
      setError(error.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid w-full min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center bg-muted p-6 lg:p-10">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Sign Up</h1>
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link href="/signin" className="underline" prefetch={false}>
                Sign in
              </Link>
            </p>
          </div>
          <form className="space-y-4" onSubmit={handleSignup}>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder={isnameFocused ? "" : "your name"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setIsNameFocused(true)}
                onBlur={() => setIsNameFocused(false)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder={isemailFocused ? "" : "xyz@example.com"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
                required
              />
            </div>
            <div className="relative space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                placeholder="********"
                id="password"
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute bottom-1 right-1 h-7 w-7"
                onClick={togglePasswordVisibility}
              >
                <EyeIcon className="h-4 w-4" />
                <span className="sr-only">Toggle password visibility</span>
              </Button>
            </div>
            {error && <div className="text-red-500">{error}</div>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Signing up...
                </>
              ) : (
                "Sign up"
              )}
            </Button>
          </form>
        </div>
      </div>
      <div className="flex items-center justify-center bg-primary p-6 lg:p-10">
        <div className="mx-auto w-full max-w-md space-y-6">
          <blockquote className="text-lg font-semibold leading-snug text-primary-foreground lg:text-xl lg:leading-normal xl:text-2xl">
            &ldquo;Creating this project was a journey of learning and growth. Every challenge was an opportunity to innovate and improve.&ldquo;
          </blockquote>
          <div>
            <div className="font-semibold text-primary-foreground">Nitin Swami</div>
            <div className="text-sm text-primary-foreground/80">Developer</div>
          </div>
        </div>
      </div>
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
