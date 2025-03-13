"use client";
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const TransferPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUsers] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [transferAmount, setTransferAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/search/`,
        { user: searchQuery },
        { withCredentials: true }
      );
      setUsers(response.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.response?.data?.errors[0]?.msg
      );
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setTransferAmount("");
    setOtp("");
    setOtpSent(false);
    setOtpVerified(false);
  };

  const handleSendOtp = async () => {
    if (
      !transferAmount ||
      isNaN(transferAmount) ||
      Number(transferAmount) <= 0
    ) {
      toast.error("Please enter a valid amount to transfer.");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/send-otp`,
        { UserId: localStorage.getItem("UserId"), type: "transaction" },
        { withCredentials: true }
      );
      if (response.status === 200) {
        toast.success(response.data.message);
        setOtpSent(true);
        setResendTimer(60);
        let timer = setInterval(() => {
          setResendTimer((prev) => {
            if (prev === 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error("Please enter the OTP.");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/verify-otp`,
        {
          UserId: localStorage.getItem("UserId"),
          OTP: otp,
          type: "transaction",
        },
        { withCredentials: true }
      );
      if (response.status === 200) {
        toast.success("OTP verified successfully!");
        setOtpVerified(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!otpVerified) {
      toast.error("Please verify OTP before making the transfer.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/wallet/transfer`,
        {
          From: localStorage.getItem("UserId"),
          To: selectedUser.UserId,
          Amount: transferAmount,
        },
        { withCredentials: true }
      );

      toast.success("Transfer successful!");
      setSelectedUser(null);
      setTransferAmount("");
      setOtp("");
      setOtpSent(false);
      setOtpVerified(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.response?.data?.errors[0]?.msg
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Transfer Money</h1>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search for user"
          value={searchQuery}
          onChange={handleSearchChange}
          className="p-2 border rounded-md flex-1"
        />
        <button
          onClick={handleSearch}
          className="p-2 bg-blue-500 text-white rounded-md"
        >
          Search
        </button>
      </div>

      {user && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Users Found</h2>
          <div className="p-4 border rounded-lg flex justify-between items-center">
            <div className="flex flex-col">
              <p>
                <strong>Name:</strong> {user.Name}
              </p>
              <p>
                <strong>Email:</strong> {user.Email}
              </p>
              <p>
                <strong>Phone:</strong> {user.Phone}
              </p>
            </div>
            <div>
              <button
                onClick={() => handleSelectUser(user)}
                className="p-2 bg-green-500 text-white rounded-md"
              >
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">
            Transfer to {selectedUser.Name}
          </h2>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Enter amount"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              className="p-2 border rounded-md flex-1"
              min="1"
            />
            <button
              onClick={handleSendOtp}
              className="p-2 bg-yellow-500 text-white rounded-md"
              disabled={loading}
            >
              {otpSent ? "Resend OTP" : "Send OTP"}
            </button>
          </div>

          {otpSent && (
            <div className="mt-4">
              <label className="block text-gray-700 font-semibold">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="p-2 border rounded-md w-full"
              />
              <button
                onClick={handleVerifyOtp}
                className="mt-2 p-2 bg-purple-500 text-white rounded-md w-full"
                disabled={loading}
              >
                Verify OTP
              </button>
              <p className="text-sm mt-2">
                Didn't receive OTP?{" "}
                {resendTimer > 0 ? (
                  `Resend in ${resendTimer}s`
                ) : (
                  <span
                    className="text-blue-500 cursor-pointer"
                    onClick={handleSendOtp}
                  >
                    Resend OTP
                  </span>
                )}
              </p>
            </div>
          )}

          {otpVerified && (
            <button
              onClick={handleTransfer}
              className="mt-4 p-2 bg-blue-500 text-white rounded-md w-full"
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm Transfer"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TransferPage;
