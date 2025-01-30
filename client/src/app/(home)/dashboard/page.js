'use client'
import axios from 'axios';
import React, { useEffect } from 'react'


const DashboardPage = () => {
  
  const fetchProfileData = async () => {
    try{
      const UserId = localStorage.getItem('UserId')
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/${UserId}`, {
        withCredentials: true,
      });
      console.log(response.data);

    }catch(error){
      console.error(error);
    }
  };
  
  useEffect(() => {
    document.title = 'Dashboard';
    fetchProfileData();
  });
  return (
    <>
    <div>
        <p>This is dashboard Page</p>
        
    </div>
    </>
  )
}

export default DashboardPage
