"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      const newEmail = searchParams.get("newEmail");
      if (!token) {
        toast.error("Invalid verification link.");
        return;
      }

      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/verify-email`,
          { token, newEmail },
          { withCredentials: true }
        );
        toast.success(data.message);
        setVerified(true);
        setTimeout(() => router.push("/settings"), 3000); // Redirect to settings after 3s
      } catch (error) {
        toast.error("Verification failed. Try again.");
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="max-w-lg mx-auto mt-20 p-6 bg-white shadow-md rounded-lg text-center">
      <h1 className="text-2xl font-bold mb-4">
        {loading
          ? "Verifying Email..."
          : verified
          ? "Success!"
          : "Verification Failed"}
      </h1>
      <p>
        {loading
          ? "Please wait while we verify your email."
          : verified
          ? "Redirecting to settings..."
          : "Please try again later."}
      </p>
    </div>
  );
};

export default page;
//
