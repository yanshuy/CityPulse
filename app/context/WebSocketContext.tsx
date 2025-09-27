// contexts/WebSocketContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { toast } from "sonner";

interface WebSocketMessage {
  id: string;
  message: string;
  timestamp: number;
}

interface WebSocketContextType {
  isConnected: boolean;
  sendMessage: (message: string) => void;
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
  url: string; // Your WebSocket server URL
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  url,
}) => {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    setConnectionStatus("connecting");
    console.log("Connecting to WebSocket server...");

    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setConnectionStatus("connected");
        reconnectAttempts.current = 0;

        // Optional: Send a ping or authentication message
        // ws.current?.send(JSON.stringify({ type: 'auth', token: 'your-auth-token' }));
      };

      ws.current.onmessage = (event: MessageEvent) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          handleIncomingMessage(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.current.onclose = (event: CloseEvent) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus("disconnected");

        // Attempt to reconnect unless it was a manual close
        if (
          event.code !== 1000 &&
          reconnectAttempts.current < maxReconnectAttempts
        ) {
          scheduleReconnect();
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.error("Failed to connect after multiple attempts");
        }
      };

      ws.current.onerror = (error: Event) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("error");
        
        // Force close to trigger reconnect
        ws.current?.close();
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setConnectionStatus("error");
    }
  };

  const scheduleReconnect = () => {
    const delay = Math.min(
      1000 * Math.pow(2, reconnectAttempts.current),
      30000
    ); // Exponential backoff, max 30s

    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttempts.current++;
      console.log(
        `Attempting to reconnect... (${reconnectAttempts.current}/${maxReconnectAttempts})`
      );
      connect();
    }, delay);
  };

  const handleIncomingMessage = (data: WebSocketMessage) => {
    if (data.message === "Connected to Reddit monitoring service") {
      // Simple toast for connection message
      toast(data.message, {
        className: "!bg-black !border-[var(--gumo-yellow)] gumo-card",
        style: {
          backgroundColor: 'black',
          color: 'var(--gumo-text)',
        },
        duration: 5000,
      });
    } else {
      try {
        // Parse the JSON message
        const parsedMessage = JSON.parse(data.message);
        if (parsedMessage.type === "new_sms_message") {
          // Dispatch a custom event so any page/component can update its live alerts list
          if (parsedMessage.data?.message) {
            try {
              window.dispatchEvent(
                new CustomEvent('citypulse-new-sms-alert', {
                  detail: { message: parsedMessage.data.message }
                })
              );
            } catch (e) {
              console.error('Failed to dispatch sms alert event', e);
            }
          }

          // Show a simple toast WITHOUT action buttons (Yes/No/Dismiss removed per requirement)
          toast(parsedMessage.data?.message || 'New message received', {
            className: "!bg-black !border-[var(--gumo-yellow)] gumo-card !text-white",
            style: {
              backgroundColor: 'black',
              color: 'white',
              border: '1px solid var(--gumo-yellow)'
            },
            duration: 7000
          });
        } else if (parsedMessage.type === "new_reddit_post") {
          // Custom toast with buttons for Reddit posts
          toast.custom((t) => (
            <div className="!bg-black !border-[var(--gumo-yellow)] gumo-card p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-white font-medium">{parsedMessage.data.title}</h3>
                <a 
                  href={parsedMessage.data.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[var(--gumo-yellow)] text-sm hover:underline truncate"
                >
                  {parsedMessage.data.url}
                </a>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    handleResponse(data.id, "YES");
                    toast.dismiss(t);
                    window.location.href = '/profile';
                  }}
                  className="px-3 py-1.5 !bg-[var(--gumo-yellow)] text-black text-sm rounded hover:opacity-90 transition-opacity"
                >
                  Yes
                </button>
                <button
                  onClick={() => {
                    handleResponse(data.id, "NO");
                    toast.dismiss(t);
                  }}
                  className="px-3 py-1.5 !bg-[var(--gumo-yellow)] text-black text-sm rounded hover:opacity-90 transition-opacity"
                >
                  No
                </button>
                <button
                  onClick={() => toast.dismiss(t)}
                  className="px-3 py-1.5 !bg-[var(--gumo-yellow)] text-black text-sm rounded hover:opacity-90 transition-opacity"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ), {
            duration: 10000, // 10 seconds for messages with buttons
          });
        } else {
          // Default toast for other JSON messages
          toast(data.message, {
            className: "!bg-black !border-[var(--gumo-yellow)] gumo-card",
            style: {
              backgroundColor: 'black',
              color: 'var(--gumo-text)',
            },
            duration: 5000,
          });
        }
      } catch (error) {
        // Fallback for non-JSON messages
        toast(data.message, {
          className: "!bg-black !border-[var(--gumo-yellow)] gumo-card",
          style: {
            backgroundColor: 'black',
            color: 'var(--gumo-text)',
          },
          duration: 5000,
        });
      }
    }
  };

  const handleResponse = (messageId: string, response: "YES" | "NO") => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const responseMessage = {
        type: "response",
        messageId,
        response,
        timestamp: Date.now(),
      };

      ws.current.send(JSON.stringify(responseMessage));
      console.log(`Sent response: ${response} for message ${messageId}`);

      // Show confirmation toast
      toast.success(`Response sent: ${response}`, {
        duration: 2000,
      });
    } else {
      toast.error("Cannot send response - WebSocket not connected");
    }
  };

  const sendMessage = (message: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "message",
          content: message,
          timestamp: Date.now(),
        })
      );
    } else {
      toast.error("Cannot send message - WebSocket not connected");
    }
  };

  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws.current) {
        ws.current.close(1000, "Component unmounting");
      }
    };
  }, [url]);

  // Handle page visibility changes (reconnect when page becomes visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !isConnected) {
        connect();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isConnected]);

  const value: WebSocketContextType = {
    isConnected,
    sendMessage,
    connectionStatus,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
