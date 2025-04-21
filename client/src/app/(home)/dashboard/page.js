"use client";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  const [pageSize, setPageSize] = useState(10);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchProfileData = async () => {
    try {
      const UserId = localStorage.getItem("UserId");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/${UserId}`,
        { withCredentials: true }
      );
      setProfile(response.data);
    } catch (err) {
      setErrorProfile("Failed to load profile data.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchTransactions = async (pageNumber, selectedPageSize) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/wallet/transactions`,
        {
          params: { page: pageNumber, page_size: selectedPageSize },
          withCredentials: true,
        }
      );
      setTransactions(response.data.transactions);
      setTotalTransactions(response.data.total_transactions);
      setPage(pageNumber);
    } catch (err) {
      setErrorTransactions("Failed to load transactions.");
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    document.title = "Profile";
    fetchProfileData();
    fetchTransactions(1, pageSize);
  }, [pageSize]);

  const totalPages = Math.ceil(totalTransactions / pageSize);
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalTransactions);

  const generatePDF = async () => {
    if (!startDate || !endDate) {
      alert("Please select a start and end date.");
      return;
    }

    try {
      const txRes = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/wallet/transactions`,
        {
          params: { start_date: startDate, end_date: endDate },
          withCredentials: true,
        }
      );
      const transactions = txRes.data.transactions;

      const userIds = Array.from(
        new Set(transactions.flatMap((tx) => [tx.From, tx.To]))
      );

      const userDetails = {};
      await Promise.all(
        userIds.map(async (id) => {
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/${id}`,
            { withCredentials: true }
          );
          userDetails[id] = res.data;
        })
      );

      const doc = new jsPDF();
      doc.text("Transaction Report", 14, 15);
      autoTable(doc, {
        head: [["From (Email | Name | Phone)", "To (Email | Name | Phone)", "Amount", "Date"]],
        body: transactions.map((tx) => [
          `${userDetails[tx.From]?.Email || "N/A"} | ${userDetails[tx.From]?.Name || "N/A"} | ${userDetails[tx.From]?.Phone || "N/A"}`,
          `${userDetails[tx.To]?.Email || "N/A"} | ${userDetails[tx.To]?.Name || "N/A"} | ${userDetails[tx.To]?.Phone || "N/A"}`,
          `${tx.Amount}`,
          new Date(tx.Date).toLocaleString(),
        ]),
        startY: 20,
      });
      doc.save("transactions.pdf");
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF.");
    }
  };



  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

      {/* Profile Section */}
      {loadingProfile ? (
        <p className="text-gray-500">Loading profile...</p>
      ) : errorProfile ? (
        <p className="text-red-500">{errorProfile}</p>
      ) : (
        <div className="space-y-2">
          <p><strong>Email:</strong> {profile?.Email}</p>
          <p><strong>Name:</strong> {profile?.Name}</p>
          <p><strong>Phone:</strong> {profile?.Phone}</p>
          <p><strong>Balance:</strong> ₹{profile?.Balance}</p>
        </div>
      )}

      <hr className="my-6 border-gray-300" />

      <h2 className="text-xl font-bold mb-4">Transactions</h2>

      {/* Date Range Filter and PDF Button */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex flex-col">
          <label>Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <div className="flex flex-col">
          <label>End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <button
          onClick={generatePDF}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-5"
        >
          Download PDF
        </button>
      </div>

      {/* Pagination Section */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-700">
          Page {page} of {totalPages} ({startIndex}-{endIndex} of {totalTransactions})
        </p>
        <div>
          <button className="px-3 py-1 bg-gray-300 rounded mr-2 disabled:opacity-50" disabled={page === 1} onClick={() => fetchTransactions(page - 1, pageSize)}>Prev</button>
          <button className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50" disabled={page === totalPages} onClick={() => fetchTransactions(page + 1, pageSize)}>Next</button>
        </div>
      </div>

      {/* Page Size Selector */}
      <div className="mb-4">
        <label className="font-semibold mr-2">Show:</label>
        <select value={pageSize} onChange={(e) => {
          const newSize = Number(e.target.value);
          setPageSize(newSize);
          fetchTransactions(1, newSize);
        }} className="p-2 border rounded-md w-24 text-center">
          <option value="10">10</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>

      {/* Transactions Table */}
      {loadingTransactions ? (
        <p className="text-gray-500">Loading transactions...</p>
      ) : errorTransactions ? (
        <p className="text-red-500">{errorTransactions}</p>
      ) : transactions.length === 0 ? (
        <p className="text-gray-500">No transactions found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Sr. No</th>
              <th className="border border-gray-300 p-2">From</th>
              <th className="border border-gray-300 p-2">To</th>
              <th className="border border-gray-300 p-2">Amount</th>
              <th className="border border-gray-300 p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <tr key={tx.Id} className="text-center">
                <td className="border border-gray-300 p-2">{startIndex + index}</td>
                <td className="border border-gray-300 p-2">{tx.From}</td>
                <td className="border border-gray-300 p-2">{tx.To}</td>
                <td className="border border-gray-300 p-2">₹{tx.Amount}</td>
                <td className="border border-gray-300 p-2">{new Date(tx.Date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProfilePage;
