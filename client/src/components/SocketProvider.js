"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { usePathname } from "next/navigation";
import { toast } from "react-toastify";

let socketInstance = null; // Global socket instance

const SocketProvider = () => {
  const [socket, setSocket] = useState(null);
  const pathname = usePathname();

  const initializeSocket = () => {
    const userId = localStorage.getItem("UserId");
    
    if (userId) {
      if (socketInstance) {
        socketInstance.disconnect();
      }

      socketInstance = io(process.env.NEXT_PUBLIC_BACKEND_URL);

      socketInstance.on("connect", () => {
        socketInstance.emit("register", userId);
      });

      socketInstance.on("fund_transfer", (data) => {
        toast.success(data.message);
      });

      setSocket(socketInstance);
    }
  };

  useEffect(() => {
    if (pathname === "/login" || pathname === "/register") {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
      }
      return;
    }

    initializeSocket();

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [pathname]);

  return null;
};

export default SocketProvider;
export { socketInstance };