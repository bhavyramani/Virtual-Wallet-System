"use client";

import { Suspense } from "react";
import VerifyEmailComponent from "@/components/VerifyEmailComponent";

const VerifyEmailPage = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <VerifyEmailComponent />
    </Suspense>
  );
};

const LoadingScreen = () => (
  <div className="max-w-lg mx-auto mt-20 p-6 bg-white shadow-md rounded-lg text-center">
    <h1 className="text-2xl font-bold mb-4">Verifying Email...</h1>
    <p>Please wait while we verify your email.</p>
  </div>
);

export default VerifyEmailPage;
