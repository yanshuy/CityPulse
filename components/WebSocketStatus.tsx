// components/WebSocketStatus.tsx
"use client";

import React from "react";
import { useWebSocket } from "@/contexts/WebSocketContext";

export const WebSocketStatus: React.FC = () => {
  const { isConnected, connectionStatus } = useWebSocket();

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-500";
      case "connecting":
        return "bg-yellow-500";
      case "disconnected":
        return "bg-red-500";
      case "error":
        return "bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      case "disconnected":
        return "Disconnected";
      case "error":
        return "Connection Error";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center space-x-2 bg-white shadow-md rounded-lg px-3 py-2 border">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
        <span className="text-sm font-medium text-gray-700">
          {getStatusText()}
        </span>
        {connectionStatus === "connecting" && (
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-900"></div>
        )}
      </div>
    </div>
  );
};

// Example usage in a component
// components/ExampleComponent.tsx
("use client");

import React, { useState } from "react";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { toast } from "sonner";

export const ExampleComponent: React.FC = () => {
  const { sendMessage, isConnected } = useWebSocket();
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (!isConnected) {
      toast.error("WebSocket not connected");
      return;
    }

    sendMessage(message);
    setMessage("");
    toast.success("Message sent!");
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Send WebSocket Message</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message..."
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>

        <button
          onClick={handleSendMessage}
          disabled={!isConnected || !message.trim()}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Send Message
        </button>

        <div className="text-sm text-gray-600">
          Status: {isConnected ? "Connected" : "Disconnected"}
        </div>
      </div>
    </div>
  );
};
