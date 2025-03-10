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
  });
  const [loading, setLoading] = useState(true);
  const [UserId, setUserId] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

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

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/${UserId}`,
        { withCredentials: true }
      );
      setUserData({
        Email: response.data.Email || "",
        Name: response.data.Name || "",
        Phone: response.data.Phone || "",
        EmailVerified: response.data.EmailVerified || false,
      });
    } catch (error) {
      toast.error("Failed to load user data.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (field, value) => {
    try {
      setUpdateLoading(true);
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/update-${field}/${UserId}`,
        { [field]: value },
        { withCredentials: true }
      );

      if (field === "email") {
        toast.info(data.message);
        setUserData((prev) => ({ ...prev, EmailVerified: false }));
      } else if (field === "Phone") {
        toast.info("Phone number updated. Verification required.");
      } else {
        toast.success("Name updated successfully!");
      }

      setUserData((prev) => ({ ...prev, [field]: value }));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update information."
      );
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
          {/* Email */}
          <div className="flex items-center gap-2">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={userData.Email || ""}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, Email: e.target.value }))
                }
                className="mt-1 block w-full p-2 border rounded-md"
                placeholder="Enter your email"
              />
            </div>
            <button
              style={{ display: `${updateLoading ? "none" : "block"}` }}
              onClick={() => handleUpdate("email", userData.Email)}
              className="p-2 bg-blue-500 text-white rounded-md"
            >
              {userData.EmailVerified ? "Save" : "Verify"}
            </button>
          </div>

          {/* Name */}
          <div className="flex items-center gap-2">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={userData.Name || ""}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, Name: e.target.value }))
                }
                className="mt-1 block w-full p-2 border rounded-md"
                placeholder="Enter your name"
              />
            </div>
            <button
              onClick={() => handleUpdate("name", userData.Name)}
              className="p-2 bg-blue-500 text-white rounded-md"
              disabled={updateLoading}
            >
              Save
            </button>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-2">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="text"
                value={userData.Phone || ""}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, Phone: e.target.value }))
                }
                className="mt-1 block w-full p-2 border rounded-md"
                placeholder="Enter your phone number"
              />
            </div>
            <button
              onClick={() => handleUpdate("phone", userData.Phone)}
              className="p-2 bg-blue-500 text-white rounded-md"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
