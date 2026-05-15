import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000');
      newSocket.emit('joinWorkspace', 'global'); // Initial

      newSocket.on('taskUpdated', (data) => {
        console.log('Task updated:', data);
        // Dispatch to update local state
      });

      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, [user]);

  const value = { socket };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export default SocketContextProvider;

