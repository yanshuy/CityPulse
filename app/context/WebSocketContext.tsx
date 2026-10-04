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
  const isConnectingRef = useRef(false); // prevent parallel connects (StrictMode / rapid retries)
  const wasEverConnectedRef = useRef(false); // to decide if we should fetch backlog
  const lastMessageTimestampRef = useRef<number | null>(null); // track most recent message timestamp
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    if (ws.current?.readyState === WebSocket.OPEN) return;
    if (isConnectingRef.current) return; // already trying
    isConnectingRef.current = true;

    setConnectionStatus("connecting");
    console.log("Connecting to WebSocket server...");

    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setConnectionStatus("connected");
        reconnectAttempts.current = 0;
        isConnectingRef.current = false;
        // If we've connected before (i.e., a reconnect) attempt backlog fetch
        if (wasEverConnectedRef.current) {
          fetchBacklog();
        } else {
          wasEverConnectedRef.current = true;
        }

        // Optional: Send a ping or authentication message
        // ws.current?.send(JSON.stringify({ type: 'auth', token: 'your-auth-token' }));
      };

      ws.current.onmessage = (event: MessageEvent) => {
        try {
          // Some servers may already send the root JSON (type,timestamp,data) while
          // earlier implementation expected an object with a 'message' string containing JSON.
          // We'll normalize both possibilities here.
          let parsed: any;
          try {
            parsed = JSON.parse(event.data);
          } catch {
            // Not JSON at root; wrap it into WebSocketMessage.message for legacy path
            const legacy: WebSocketMessage = { id: crypto.randomUUID(), message: event.data, timestamp: Date.now() };
            handleIncomingMessage(legacy);
            return;
          }

          if (parsed && typeof parsed === 'object' && parsed.type && parsed.data) {
            // Direct shape from server; wrap into WebSocketMessage with message=stringified
            const wrapped: WebSocketMessage = {
              id: parsed.id || crypto.randomUUID(),
              message: JSON.stringify(parsed),
              timestamp: Date.now()
            };
            handleIncomingMessage(wrapped);
          } else if (parsed && typeof parsed.message === 'string') {
            // Legacy envelope with .message containing inner JSON
            handleIncomingMessage(parsed as WebSocketMessage);
          } else {
            // Fallback: treat original event data as raw text
            const fallback: WebSocketMessage = { id: crypto.randomUUID(), message: event.data, timestamp: Date.now() };
            handleIncomingMessage(fallback);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.current.onclose = (event: CloseEvent) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus("disconnected");
        isConnectingRef.current = false;

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
        isConnectingRef.current = false;
        
        // Force close to trigger reconnect
        ws.current?.close();
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setConnectionStatus("error");
      isConnectingRef.current = false;
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
    // Normalize root JSON inside data.message (if JSON). Show required fields plus formatted time.
    let parsed: any = null;
    try { parsed = JSON.parse(data.message); } catch { /* ignore */ }

    const formatTime = (iso?: string) => {
      if (!iso) return '';
      const d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (parsed && parsed.type === 'new_sms_message') {
      const body = parsed.data?.message || '(no message)';
      const timeStr = formatTime(parsed.data?.timestamp || parsed.timestamp);
      const display = timeStr ? `${body}  •  ${timeStr}` : body;
      toast(display, {
        className: "!bg-black !border-[var(--gumo-yellow)] gumo-card !text-white",
        style: { backgroundColor: 'black', color: 'white', border: '1px solid var(--gumo-yellow)' },
        duration: 7000
      });
      // Track timestamp for backlog
      const tsSource = parsed.timestamp || parsed.data?.timestamp;
      if (tsSource) {
        const ts = Date.parse(tsSource);
        if (!isNaN(ts)) lastMessageTimestampRef.current = ts;
      }
      return;
    }

    if (parsed && parsed.type === 'new_reddit_post') {
      const title = parsed.data?.title || 'Reddit Post';
      const timeStr = formatTime(parsed.timestamp || parsed.data?.timestamp);
      const display = timeStr ? `${title}  •  ${timeStr}` : title;
      toast(display, {
        className: "!bg-black !border-[var(--gumo-yellow)] gumo-card !text-white",
        style: { backgroundColor: 'black', color: 'white', border: '1px solid var(--gumo-yellow)' },
        duration: 7000
      });
      const tsSource = parsed.timestamp || parsed.data?.timestamp;
      if (tsSource) {
        const ts = Date.parse(tsSource);
        if (!isNaN(ts)) lastMessageTimestampRef.current = ts;
      }
      return;
    }

    // Fallbacks
    if (parsed) {
      toast(JSON.stringify(parsed), {
        className: "!bg-black !border-[var(--gumo-yellow)] gumo-card",
        style: { backgroundColor: 'black', color: 'var(--gumo-text)' },
        duration: 5000
      });
    } else {
      toast(data.message, {
        className: "!bg-black !border-[var(--gumo-yellow)] gumo-card",
        style: { backgroundColor: 'black', color: 'var(--gumo-text)' },
        duration: 5000
      });
    }
  };

  // Attempt to fetch missed messages after a reconnect using a heuristic backlog endpoint.
  const fetchBacklog = async () => {
    if (!lastMessageTimestampRef.current) return;
    // Derive a base HTTP URL from the websocket URL.
    try {
      const httpBase = url
        .replace(/^wss:/, 'https:')
        .replace(/^ws:/, 'http:')
        .replace(/\/ws$/,'');
      // Example assumed endpoint; adjust to real backend path.
      const backlogUrl = `${httpBase}/ws/backlog?since=${encodeURIComponent(lastMessageTimestampRef.current)}`;
      const res = await fetch(backlogUrl);
      if (!res.ok) {
        console.warn('Backlog fetch failed', res.status);
        return;
      }
      const items = await res.json();
      if (Array.isArray(items)) {
        for (const item of items) {
          try {
            // Normalize to same structure expected by handleIncomingMessage
            const wrapped: WebSocketMessage = {
              id: item.id || crypto.randomUUID(),
              message: JSON.stringify(item),
              timestamp: Date.now()
            };
            handleIncomingMessage(wrapped);
          } catch (e) {
            console.error('Failed to process backlog item', e);
          }
        }
      }
    } catch (e) {
      console.warn('Error fetching backlog', e);
    }
  };

  // Previously had interactive response handling; removed per simplified spec.

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
