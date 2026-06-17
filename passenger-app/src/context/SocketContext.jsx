import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';
import { getAccessToken } from '../storage/storage';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [busLocations, setBusLocations] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
    } else {
      disconnectSocket();
    }
    return () => disconnectSocket();
  }, [isAuthenticated]);

  async function connectSocket() {
    const token = await getAccessToken();
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('bus:location:update', (data) => {
      setBusLocations(prev => ({
        ...prev,
        [data.busId]: {
          latitude: data.latitude,
          longitude: data.longitude,
          speed: data.speed,
          heading: data.heading,
          timestamp: data.timestamp,
          tripId: data.tripId
        }
      }));
    });

    socket.on('trip:ended', ({ tripId }) => {
      setBusLocations(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(busId => {
          if (next[busId].tripId === tripId) delete next[busId];
        });
        return next;
      });
    });

    socketRef.current = socket;
  }

  function disconnectSocket() {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
    }
  }

  function trackBus(busId, tripId) {
    if (socketRef.current) {
      socketRef.current.emit('passenger:track:bus', { busId, tripId });
    }
  }

  function untrackBus(busId) {
    if (socketRef.current) {
      socketRef.current.emit('passenger:untrack:bus', { busId });
    }
  }

  return (
    <SocketContext.Provider value={{
      connected, busLocations,
      trackBus, untrackBus
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}