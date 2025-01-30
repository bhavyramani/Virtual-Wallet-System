"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [errorProfile, setErrorProfile] = useState(null);
  const [errorTransactions, setErrorTransactions] = useState(null);
  const [page, setPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const pageSize = 10;

  const fetchProfileData = async () => {
    try {
      const UserId = localStorage.getItem("UserId");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/${UserId}`,
        {
          withCredentials: true,
        }
      );
      setProfile(response.data);
    } catch (err) {
      console.error(err);
      setErrorProfile("Failed to load profile data.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchTransactions = async (pageNumber) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/wallet/transactions`,
        {
          params: { page: pageNumber, page_size: pageSize },
          withCredentials: true,
        }
      );
      
      setTransactions(response.data.transactions);
      setTotalTransactions(response.data.total_transactions);
      setPage(pageNumber);
    } catch (err) {
      console.error(err);
      setErrorTransactions("Failed to load transactions.");
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    document.title = "Profile";
    fetchProfileData();
    fetchTransactions(1);
  }, []);

  const totalPages = Math.ceil(totalTransactions / pageSize);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

      {/* Profile Section */}
      {loadingProfile ? (
        <p className="text-gray-500">Loading profile...</p>
      ) : errorProfile ? (
        <p className="text-red-500">{errorProfile}</p>
      ) : (
        <div className="space-y-4">
          <p>
            <strong>Email:</strong> {profile?.Email || "Not provided"}
          </p>
          <p>
            <strong>Name:</strong> {profile?.Name || "Not provided"}
          </p>
          <p>
            <strong>Phone:</strong> {profile?.Phone || "Not provided"}
          </p>
          <p>
            <strong>Balance:</strong> ₹{profile?.Balance || "N/A"}
          </p>
        </div>
      )}

      <hr className="my-6 border-gray-300" />

      {/* Transactions Section */}
      <h2 className="text-xl font-bold mb-4">Transactions</h2>
      {loadingTransactions ? (
        <p className="text-gray-500">Loading transactions...</p>
      ) : errorTransactions ? (
        <p className="text-red-500">{errorTransactions}</p>
      ) : transactions.length === 0 ? (
        <p className="text-gray-500">No transactions found.</p>
      ) : (
        <>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">From</th>
                <th className="border border-gray-300 p-2">To</th>
                <th className="border border-gray-300 p-2">Amount</th>
                <th className="border border-gray-300 p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.Id} className="text-center border border-gray-300">
                  <td className="border border-gray-300 p-2">{tx.From}</td>
                  <td className="border border-gray-300 p-2">{tx.To}</td>
                  <td className="border border-gray-300 p-2">₹{tx.Amount}</td>
                  <td className="border border-gray-300 p-2">
                    {new Date(tx.Date).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-between mt-4">
            <button
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
              disabled={page === 1}
              onClick={() => fetchTransactions(page - 1)}
            >
              Previous
            </button>
            <p>
              Page {page} of {totalPages}
            </p>
            <button
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
              disabled={page === totalPages}
              onClick={() => fetchTransactions(page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
