'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SettingsPage = () => {
  const [userData, setUserData] = useState({
    Email: '',
    Name: '',
    Phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [UserId, setUserId] = useState(null); // State to store UserId

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/${UserId}`, {
        withCredentials: true,
      });
      setUserData({
        Email: response.data.Email || '',
        Name: response.data.Name || '',
        Phone: response.data.Phone || '',
      });
    } catch (err) {
      toast.error('Failed to load user data.');
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userIdFromStorage = localStorage.getItem('UserId');
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/${UserId}`,
        userData,
        { withCredentials: true }
      );

      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      {loading ? (
        <p>Loading your current information...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              name="Email"
              value={userData.Email || ''}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded-md"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              id="name"
              type="text"
              name="Name"
              value={userData.Name || ''}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded-md"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              id="phone"
              type="text"
              name="Phone"
              value={userData.Phone || ''}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded-md"
              placeholder="Enter your phone number"
            />
          </div>

          <button
            type="submit"
            className="mt-4 w-full p-2 bg-blue-500 text-white rounded-md"
          >
            Save Changes
          </button>
        </form>
      )}
    </div>
  );
};

export default SettingsPage;
