"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Clock,
  CloudRain,
  AlertTriangle,
  Navigation,
  Coffee,
  Train,
  Car,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
}

interface Goal {
  destination: string;
  targetTime: string;
  eta: string;
  method: string;
  status: "on-time" | "delayed" | "alert";
}

interface Alert {
  id: string;
  type: "traffic" | "transit" | "weather";
  message: string;
  severity: "high" | "medium" | "low";
  icon: React.ElementType;
}

interface Suggestion {
  title: string;
  description: string;
  type: "nearby" | "alternative" | "activity";
}

const Page = () => {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentLocation] = useState("Downtown Mumbai");
  const [weather] = useState<WeatherData>({
    temp: 28,
    condition: "Partly Cloudy",
    icon: "⛅",
  });

  const [activeGoal] = useState<Goal>({
    destination: "Bandra Office",
    targetTime: "9:00 AM",
    eta: "8:47 AM",
    method: "Metro",
    status: "delayed",
  });

  const [alerts] = useState<Alert[]>([
    {
      id: "1",
      type: "traffic",
      message: "Heavy traffic on Western Express Highway",
      severity: "high",
      icon: Car,
    },
    {
      id: "2",
      type: "weather",
      message: "Light rain expected in 15 minutes",
      severity: "medium",
      icon: CloudRain,
    },
    {
      id: "3",
      type: "transit",
      message: "Metro line 1 facing 10 min delay",
      severity: "low",
      icon: Train,
    },
    {
      id: "4",
      type: "traffic",
      message: "Accident near Andheri flyover - expect diversions",
      severity: "high",
      icon: Car,
    },
  ]);

  const [suggestions] = useState<Suggestion[]>([
    {
      title: "Coffee & Co near Metro",
      description:
        "Grab coffee before your commute - only 2 min walk from Andheri station",
      type: "nearby",
    },
    {
      title: "Take Bus Route 340",
      description:
        "Alternative route available due to metro delays - 5 min longer",
      type: "alternative",
    },
  ]);

  const [showAllAlerts, setShowAllAlerts] = useState(false);

  const AlertsModal = () => {
    if (!showAllAlerts) return null;

    return (
      <div className="fixed inset-0 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
        <div className="bg-black  rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-[color:var(--gumo-yellow)]/20">
            <h2 className="text-lg font-semibold text-white">All Alerts</h2>
            <button
              onClick={() => setShowAllAlerts(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            <div className="space-y-3">
              {alerts.map((alert) => {
                const IconComponent = alert.icon;
                return (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-3  rounded-lg border border-[color:var(--gumo-yellow)]/10"
                  >
                    <IconComponent
                      className={`h-4 w-4 mt-0.5 ${getAlertColor(alert.severity)}`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-white capitalize">
                          {alert.type}
                        </span>
                        {/* <span className={`text-xs px-2 py-1 rounded-full ${
                          alert.severity === "high"
                            ? "bg-red-900/30 text-red-400"
                            : alert.severity === "medium"
                            ? "bg-yellow-900/30 text-yellow-400"
                            : "bg-blue-900/30 text-blue-400"
                        }`}>
                          {alert.severity}
                        </span> */}
                      </div>
                      <p className="text-sm text-white">{alert.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-[color:var(--gumo-yellow)]/20">
            <button
              onClick={() => setShowAllAlerts(false)}
              className="w-full bg-[color:var(--gumo-yellow)] text-black py-2 px-4 rounded-lg hover:bg-[color:var(--gumo-yellow)]/90 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-time":
        return "status-on-time";
      case "delayed":
        return "status-delayed";
      case "alert":
        return "status-alert";
      default:
        return "text-gumo-muted";
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-alert-danger";
      case "medium":
        return "text-alert-warning";
      case "low":
        return "text-alert-info";
      default:
        return "text-gumo-muted";
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-gumo-bg text-gumo-text px-4 py-6 max-w-md mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[color:var(--gumo-yellow)]" />
          <span className="text-sm text-gumo-muted">{currentLocation}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm">
            <span>{weather.icon}</span>
            <span className="text-gumo-text">{weather.temp}°C</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gumo-muted">
            <Clock className="h-3 w-3 text-[color:var(--gumo-yellow)]" />
            <span>
              {currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Active Goal Card */}
      <Card className="gumo-card p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gumo-text">Current Goal</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-gumo-yellow hover:bg-gumo-navy"
            onClick={() => router.push('/goals')}
          >
            Edit
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-[color:var(--gumo-yellow)]" />
            <span className="text-gumo-text font-medium">
              {activeGoal.destination} by {activeGoal.targetTime}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span
              className={`font-medium ${getStatusColor(activeGoal.status)}`}
            >
              ETA: {activeGoal.eta}
            </span>
            <span className="text-gumo-muted">via {activeGoal.method}</span>
          </div>

          {activeGoal.status === "delayed" && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-gumo-navy rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600 text-alert-warning" />
              <span className="text-sm text-alert-warning">
                Running 13 minutes late
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Live Alerts */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-medium text-gumo-text">Live Alerts</h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-gumo-purple text-xs"
            onClick={() => setShowAllAlerts(true)}
          >
            View All
          </Button>
        </div>

        <div className="space-y-2">
          {alerts.slice(0, 2).map((alert) => {
            const IconComponent = alert.icon;
            return (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 bg-gumo-surface rounded-lg border border-gumo-purple/20"
              >
                <IconComponent
                  className={`h-4 w-4 mt-0.5 text-[color:var(--gumo-yellow)] ${getAlertColor(
                    alert.severity
                  )}`}
                />
                <div className="flex-1">
                  <p className="text-sm text-gumo-text">{alert.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for All Alerts */}
      {showAllAlerts && (
        <div className="fixed  bg-black/75 flex items-center justify-center z-50">
          <div className="bg-gumo-bg rounded-xl shadow-lg w-11/12 max-w-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gumo-text">
                All Alerts
              </h3>
              {/* <Button
                variant="ghost"
                size="sm"
                className="text-gumo-muted"
                onClick={() => setShowAllAlerts(false)}
              >
                <X className="h-5 w-5" />
              </Button> */}
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {alerts.map((alert) => {
                const IconComponent = alert.icon;
                return (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-3 bg-gumo-surface rounded-lg border border-gumo-purple/20"
                  >
                    <IconComponent
                      className={`h-4 w-4 mt-0.5 text-[color:var(--gumo-yellow)] ${getAlertColor(
                        alert.severity
                      )}`}
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gumo-text">{alert.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Personalized Suggestions */}
      <div className="mb-6">
        <h3 className="text-base font-medium text-gumo-text mb-3">
          AI Suggestions
        </h3>

        <Card className="gumo-card p-4 border-[color:var(--gumo-yellow)]/30 animate-glow">
          <div className="flex items-start gap-3">
            <Coffee className="h-5 w-5 text-[color:var(--gumo-yellow)] mt-1" />
            <div className="flex-1">
              <h4 className="font-medium text-gumo-text mb-1">Top Pick</h4>
              <p className="text-sm text-gumo-text mb-2">
                {suggestions[0]?.title}
              </p>
              <p className="text-xs text-gumo-muted">
                {suggestions[0]?.description}
              </p>
            </div>
          </div>

          <Button className="w-full mt-3 text-black bg-[color:var(--gumo-yellow)]  hover:bg-[color:var(--gumo-yellow)]/90">
            Get Directions
          </Button>
        </Card>

        {/* Additional Suggestions */}
        <div className="mt-3 space-y-2">
          {suggestions.slice(1).map((suggestion, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-gumo-surface rounded-lg"
            >
              <Train className="h-4 w-4 text-[color:var(--gumo-yellow)] mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gumo-text font-medium">
                  {suggestion.title}
                </p>
                <p className="text-xs text-gumo-muted mt-1">
                  {suggestion.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Button
          variant="outline"
          className="gumo-pill text-gumo-text border-[color:var(--gumo-yellow)]/40 hover:bg-gumo-navy"
        >
          <MapPin className="h-4 w-4 mr-2 text-[color:var(--gumo-yellow)]" />
          New Destination
        </Button>
        <Button
          variant="outline"
          className="gumo-pill text-gumo-text border-[color:var(--gumo-yellow)]/40 hover:bg-gumo-navy"
        >
          <Clock className="h-4 w-4 mr-2 text-[color:var(--gumo-yellow)]" />
          Schedule Trip
        </Button>
      </div>

      {/* Alerts Modal */}
      <AlertsModal />
    </div>
  );
};

export default Page;
