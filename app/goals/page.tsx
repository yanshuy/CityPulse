"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X, MapPin, Clock, Car } from "lucide-react";

interface Goal {
  id: string;
  destination: string;
  Time: string;
  Transport: string[];
}

const transportOptions = [
  "Train",
  "Metro",
  "Bus",
  "Auto",
  "Taxi",
  "Car",
  "Bike",
  "Walk",
];

const Page = () => {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [currentGoal, setCurrentGoal] = useState<Partial<Goal>>({
    destination: "",
    Time: "",
    Transport: [],
  });

  const addTransport = (transport: string) => {
    if (!currentGoal.Transport?.includes(transport)) {
      setCurrentGoal((prev) => ({
        ...prev,
        Transport: [...(prev.Transport || []), transport],
      }));
    }
  };

  const removeTransport = (transport: string) => {
    setCurrentGoal((prev) => ({
      ...prev,
      Transport: prev.Transport?.filter((t) => t !== transport) || [],
    }));
  };

  const addGoal = () => {
    if (
      currentGoal.destination &&
      currentGoal.Time &&
      currentGoal.Transport?.length
    ) {
      const newGoal: Goal = {
        id: Date.now().toString(),
        destination: currentGoal.destination,
        Time: currentGoal.Time,
        Transport: currentGoal.Transport,
      };
      setGoals((prev) => [...prev, newGoal]);
      setCurrentGoal({ destination: "", Time: "", Transport: [] });
    }
  };

  const removeGoal = (id: string) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  };

  const handleSave = () => {
    // Save goals logic here - could be saved to localStorage or API
    router.back(); // Go back after saving
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--gumo-bg)" }}>
      <div className="container mx-auto p-4 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
            style={{ color: "var(--gumo-text)" }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--gumo-text)" }}
          >
            Goal Maker
          </h1>
          <Button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg font-medium"
            style={{
              backgroundColor: "var(--gumo-yellow)",
              color: "var(--gumo-bg)",
            }}
          >
            Save
          </Button>
        </div>

        {/* Add New Goal Form */}
        <Card
          className="mb-6"
          style={{
            backgroundColor: "var(--gumo-surface)",
            borderColor: "var(--gumo-navy)",
          }}
        >
          <CardHeader>
            <CardTitle
              className="flex items-center gap-2"
              style={{ color: "var(--gumo-text)" }}
            >
              <Plus className="h-5 w-5" />
              Add New Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label
                htmlFor="destination"
                style={{ color: "var(--gumo-muted)" }}
              >
                Destination
              </Label>
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-3 h-4 w-4"
                  style={{ color: "var(--gumo-muted)" }}
                />
                <Input
                  id="destination"
                  value={currentGoal.destination || ""}
                  onChange={(e) =>
                    setCurrentGoal((prev) => ({
                      ...prev,
                      destination: e.target.value,
                    }))
                  }
                  placeholder="Enter destination"
                  className="pl-10"
                  style={{
                    backgroundColor: "var(--gumo-bg)",
                    borderColor: "var(--gumo-navy)",
                    color: "var(--gumo-text)",
                  }}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="time" style={{ color: "var(--gumo-muted)" }}>
                Time
              </Label>
              <div className="relative">
                <Clock
                  className="absolute left-3 top-3 h-4 w-4"
                  style={{ color: "var(--gumo-muted)" }}
                />
                <Input
                  id="time"
                  type="time"
                  value={currentGoal.Time || ""}
                  onChange={(e) =>
                    setCurrentGoal((prev) => ({
                      ...prev,
                      Time: e.target.value,
                    }))
                  }
                  className="pl-10"
                  style={{
                    backgroundColor: "var(--gumo-bg)",
                    borderColor: "var(--gumo-navy)",
                    color: "var(--gumo-text)",
                  }}
                />
              </div>
            </div>

            <div>
              <Label style={{ color: "var(--gumo-muted)" }}>
                Transport Options
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {transportOptions.map((transport) => (
                  <Button
                    key={transport}
                    variant="outline"
                    size="sm"
                    onClick={() => addTransport(transport)}
                    className={`${
                      currentGoal.Transport?.includes(transport)
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={currentGoal.Transport?.includes(transport)}
                    style={{
                      borderColor: "var(--gumo-navy)",
                      color: "var(--gumo-text)",
                      backgroundColor: "transparent",
                    }}
                  >
                    <Car className="h-3 w-3 mr-1" />
                    {transport}
                  </Button>
                ))}
              </div>

              {currentGoal.Transport && currentGoal.Transport.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {currentGoal.Transport.map((transport) => (
                    <Badge
                      key={transport}
                      variant="secondary"
                      className="flex items-center gap-1"
                      style={{
                        backgroundColor: "var(--gumo-yellow)",
                        color: "var(--gumo-bg)",
                      }}
                    >
                      {transport}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTransport(transport)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={addGoal}
              disabled={
                !currentGoal.destination ||
                !currentGoal.Time ||
                !currentGoal.Transport?.length
              }
              className="w-full"
              style={{
                backgroundColor: "var(--gumo-yellow)",
                color: "var(--gumo-text)",
              }}
            >
              Add Goal
            </Button>
          </CardContent>
        </Card>

        {/* Goals List */}
        {goals.length > 0 && (
          <div className="space-y-3">
            <h2
              className="text-lg font-medium"
              style={{ color: "var(--gumo-text)" }}
            >
              Your Goals ({goals.length})
            </h2>
            {goals.map((goal) => (
              <Card
                key={goal.id}
                style={{
                  backgroundColor: "var(--gumo-surface)",
                  borderColor: "var(--gumo-navy)",
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin
                          className="h-4 w-4"
                          style={{ color: "var(--gumo-yellow)" }}
                        />
                        <span
                          className="font-medium"
                          style={{ color: "var(--gumo-text)" }}
                        >
                          {goal.destination}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Clock
                          className="h-4 w-4"
                          style={{ color: "var(--gumo-muted)" }}
                        />
                        <span style={{ color: "var(--gumo-muted)" }}>
                          {goal.Time}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {goal.Transport.map((transport) => (
                          <Badge
                            key={transport}
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: "var(--gumo-navy)",
                              color: "var(--gumo-muted)",
                              backgroundColor: "var(--gumo-navy)",
                            }}
                          >
                            {transport}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGoal(goal.id)}
                      className="p-1 ml-2"
                      style={{ color: "var(--gumo-muted)" }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {goals.length === 0 && (
          <div className="text-center py-8">
            <p style={{ color: "var(--gumo-muted)" }}>
              No goals added yet. Create your first goal above!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
