import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (bloodType?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io();
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
