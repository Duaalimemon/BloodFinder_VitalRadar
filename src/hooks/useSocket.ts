import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (bloodType?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
   // Hugging Face wala backend link yahan aayega
const newSocket = io("https://duaa23-vitalradar.hf.space", {
  transports: ["websocket", "polling"], // Taake connection stable rahay
  withCredentials: true
});
    setSocket(newSocket);

    if (bloodType) {
      newSocket.emit('join-blood-group', bloodType);
    }

    return () => {
      newSocket.disconnect();
    };
  }, [bloodType]);

  return socket;
};
