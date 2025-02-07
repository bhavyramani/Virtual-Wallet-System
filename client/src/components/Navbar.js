"use client";
import React, { useState, useEffect } from "react";
import {
  HomeIcon,
  CogIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-toastify";
import { redirect } from "next/navigation";
import { socketInstance } from "./SocketProvider";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: <HomeIcon className="w-5 h-5" />,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: <CogIcon className="w-5 h-5" />,
  },
  {
    name: "Transfer",
    href: "/transfer",
    icon: <CurrencyDollarIcon className="w-5 h-5" />,
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Navbar = ({ user }) => {
  const [activeLink, setActiveLink] = useState("Dashboard");

  const handleNavClick = (itemName) => {
    setActiveLink(itemName);
  };

  const handleSignOut = async () => {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`,
      {},
      { withCredentials: true }
    );

    if (response.status === 200) {
      toast.success("Sign out successful.");
      socketInstance.emit("logout", localStorage.getItem("UserId")); 
      localStorage.removeItem("UserId");
      socketInstance.disconnect();
      redirect("/login");
    } else {
      toast.error("Sign out failed.");
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="bg-gray-800 w-64 h-screen flex flex-col">
        <div className="flex items-center justify-center p-4">
          <img
            alt="Your Company"
            src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=500"
            className="h-8 w-auto"
          />
        </div>

        <div className="flex flex-col space-y-4 px-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              aria-current={item.current ? "page" : undefined}
              className={classNames(
                item.name === activeLink
                  ? "bg-gray-900 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white",
                "flex items-center rounded-md px-3 py-2 text-sm font-medium"
              )}
              onClick={() => handleNavClick(item.name)} // Update active link
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </div>

        <div className="mt-auto p-4">
          <button
            className="w-full text-gray-50 hover:text-gray-700 text-sm font-medium"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="flex-1 p-6"></div>
    </div>
  );
};

export default Navbar;
