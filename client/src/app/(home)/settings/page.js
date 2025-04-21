"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SettingsPage = () => {
  const [userData, setUserData] = useState({
    Email: "",
    Name: "",
    Phone: "",
    EmailVerified: false,
    PhoneVerified: false,
  });
  const [loading, setLoading] = useState(true);
  const [UserId, setUserId] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  // OTP-related state for phone verification
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(60);

  // Image upload related state
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userIdFromStorage = localStorage.getItem("UserId");
      if (userIdFromStorage) {
        setUserId(userIdFromStorage);
      }
    }
  }, []);

  useEffect(() => {
    if (UserId) {
      fetchUserData();
    }
  }, [UserId]);

  useEffect(() => {
    let timer;
    if (otpSent && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, resendTimer]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/${UserId}`,
        { withCredentials: true }
      );
      setUserData({
        Email: response.data.Email || "",
        Name: response.data.Name || "",
        Phone: response.data.Phone?.slice(3) || "",
        EmailVerified: response.data.EmailVerified || false,
        PhoneVerified: response.data.PhoneVerified || false,
      });
    } catch (error) {
      toast.error("Failed to load user data.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailUpdate = async (value) => {
    try {
      setUpdateLoading(true);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/update-email/${UserId}`,
        { email: value },
        { withCredentials: true }
      );
      if (response.status === 200) {
        toast.info(response.data.message);
        setUserData((prev) => ({ ...prev, EmailVerified: true, Email: value }));
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update email."
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleNameUpdate = async (value) => {
    try {
      setUpdateLoading(true);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/update-name/${UserId}`,
        { name: value },
        { withCredentials: true }
      );
      if (response.status === 200) {
        toast.success("Name updated successfully!");
        setUserData((prev) => ({ ...prev, Name: value }));
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update name."
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  // Phone update: when clicking the button, send OTP request
  const handleSendOtp = async () => {
    if (!/^[0-9]{10}$/.test(userData.Phone)) {
      toast.error("Phone number must be exactly 10 digits.");
      return;
    }
    try {
      setUpdateLoading(true);
      const phoneWithPrefix = `+91${userData.Phone}`;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/send-otp`,
        { UserId, Phone: phoneWithPrefix },
        { withCredentials: true }
      );
      if (response.status === 200) {
        toast.success(response.data.message);
        setOtpSent(true);
        setResendTimer(60);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setUpdateLoading(true);
      const phoneWithPrefix = `+91${userData.Phone}`;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/verify-otp`,
        { UserId, OTP: otp, type: "change", Phone: phoneWithPrefix },
        { withCredentials: true }
      );
      if (response.status === 200) {
        toast.success(response.data.message);
        setUserData((prev) => ({ ...prev, PhoneVerified: true }));
        setOtpSent(false);
        setOtp("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification failed.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const formData = new FormData();
    formData.append("profileImage", image);
    try {
      setUpdateLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/upload-profile-image`,
        formData,
        { headers: { "x-user-id": UserId }, withCredentials: true }
      );
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload image.");
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      {loading ? (
        <p>Loading your current information...</p>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold">Profile Image</label>
            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full border p-2 rounded"
            />
            <button
              className="mt-2 bg-indigo-500 text-white px-4 py-2 rounded"
              onClick={handleImageUpload}
              disabled={updateLoading || !image}
            >
              Upload Profile Image
            </button>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold">Email</label>
            <input
              type="email"
              value={userData.Email}
              onChange={(e) => setUserData({ ...userData, Email: e.target.value })}
              className="w-full border p-2 rounded"
            />
            <button
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => handleEmailUpdate(userData.Email)}
              disabled={updateLoading}
            >
              Update Email
            </button>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold">Name</label>
            <input
              type="text"
              value={userData.Name}
              onChange={(e) => setUserData({ ...userData, Name: e.target.value })}
              className="w-full border p-2 rounded"
            />
            <button
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
              onClick={() => handleNameUpdate(userData.Name)}
              disabled={updateLoading}
            >
              Update Name
            </button>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold">Phone</label>
            <input
              type="text"
              value={userData.Phone}
              onChange={(e) => setUserData({ ...userData, Phone: e.target.value })}
              className="w-full border p-2 rounded"
            />
            <button
              className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded"
              onClick={handleSendOtp}
              disabled={updateLoading}
            >
              {userData.PhoneVerified ? "Update Phone" : "Verify Phone"}
            </button>
          </div>

          {otpSent && (
            <div>
              <label className="block text-gray-700 font-semibold">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border p-2 rounded"
              />
              <button
                className="mt-2 bg-purple-500 text-white px-4 py-2 rounded"
                onClick={handleVerifyOtp}
                disabled={updateLoading}
              >
                Verify OTP
              </button>
              <p className="text-sm mt-2">
                Didn't receive OTP? {resendTimer > 0 ? `Resend in ${resendTimer}s` : <span className="text-blue-500 cursor-pointer" onClick={handleSendOtp}>Resend OTP</span>}
              </p>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default SettingsPage;
