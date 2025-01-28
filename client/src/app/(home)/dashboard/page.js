'use client'
import axios from 'axios';
import React, { useEffect } from 'react'

const DashboardPage = () => {

  const fetchProfileData = async () => {
    try{
      console.log(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile`);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile`, {
        withCredentials: true,
      });
      console.log(response.data);

    }catch(error){
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProfileData();
  });
  return (
    <>
    <div>
        This is dashboard Page
    </div>
    </>
  )
}

export default DashboardPage
