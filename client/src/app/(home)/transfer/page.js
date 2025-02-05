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
    } catch (err) {
      toast.error("Failed to search for user.");
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setTransferAmount("");
  };

  const handleTransfer = async () => {
    if (
      !transferAmount ||
      isNaN(transferAmount) ||
      Number(transferAmount) <= 0
    ) {
      toast.error("Please enter a valid amount to transfer.");
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
    } catch (err) {
      toast.error("Transfer failed.");
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
              onClick={handleTransfer}
              className="p-2 bg-blue-500 text-white rounded-md"
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm Transfer"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferPage;
