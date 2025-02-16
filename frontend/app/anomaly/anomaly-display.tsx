"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AnomalyDisplayProps {
  conversation_id: string;
  user_id: string;
}

export function AnomalyDisplay({ conversation_id, user_id }: AnomalyDisplayProps) {
  const [sortBy, setSortBy] = useState("all");
  const [anomalyData, setAnomalyData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch anomaly data from localStorage on component mount
  useEffect(() => {
    const fetchAnomalyData = () => {
      try {
        const storedData = localStorage.getItem(`anomalyData_${conversation_id}`);
        if (!storedData) {
          throw new Error("No anomaly data found for this conversation.");
        }
        const data = JSON.parse(storedData);
        setAnomalyData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    };

    fetchAnomalyData();
  }, [conversation_id]);

  // Use the passed anomalyData or fallback to a default structure
  const data = anomalyData || {
    user_id,
    conversation_id,
    anamoly: {
      analysis_summary: {
        total_anomalies: 0,
        cross_document_issues: 0,
        severity_distribution: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
        },
      },
      anomalies: [],
    },
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "text-red-500";
      case "high":
        return "text-orange-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const filteredAnomalies = data.anamoly.anomalies.filter((anomaly: any) => {
    if (sortBy === "all") return true;
    return anomaly.severity.toLowerCase() === sortBy.toLowerCase();
  });

  const severityOrder = ["critical", "high", "medium", "low"];

  const sortedAnomalies = [...filteredAnomalies].sort((a: any, b: any) => {
    return severityOrder.indexOf(a.severity.toLowerCase()) - severityOrder.indexOf(b.severity.toLowerCase());
  });

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Anomaly Detection Results</CardTitle>
        <CardDescription>
          Analysis for user: {data.user_id} | Conversation: {data.conversation_id}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Sorting Dropdown */}
        <div className="flex justify-end mb-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 bg-gray-800 text-white border-gray-700">
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all" className="text-white hover:bg-gray-700">
                All Severities
              </SelectItem>
              <SelectItem value="critical" className="text-red-500 hover:bg-gray-700">
                Critical
              </SelectItem>
              <SelectItem value="high" className="text-orange-500 hover:bg-gray-700">
                High
              </SelectItem>
              <SelectItem value="medium" className="text-yellow-500 hover:bg-gray-700">
                Medium
              </SelectItem>
              <SelectItem value="low" className="text-green-500 hover:bg-gray-700">
                Low
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Section */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Total Anomalies</p>
            <p className="text-2xl font-bold text-white">{data.anamoly.analysis_summary.total_anomalies}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Cross Document Issues</p>
            <p className="text-2xl font-bold text-white">{data.anamoly.analysis_summary.cross_document_issues}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg col-span-2">
  <p className="text-sm text-gray-400 mb-2">Severity Distribution</p>
  <div className="grid grid-cols-4 gap-2">
    {Object.entries(data.anamoly.analysis_summary.severity_distribution).map(([severity, count]) => (
      <div key={severity} className="text-center">
        <p className={`text-lg font-bold ${getSeverityColor(severity)}`}>
          {count as number} {/* Explicitly cast count to number */}
        </p>
        <p className="text-xs text-gray-400 capitalize">{severity}</p>
      </div>
    ))}
  </div>
</div>
        </div>

        {/* Anomalies List */}
        <div className="space-y-4">
          {sortedAnomalies.map((anomaly: any) => (
            <div key={anomaly.id} className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-white font-medium">{anomaly.id}</h3>
                <span className={`px-2 py-1 rounded text-sm ${getSeverityColor(anomaly.severity)}`}>
                  {anomaly.severity}
                </span>
              </div>
              <p className="text-gray-300 mb-2">{anomaly.description}</p>
              <div className="text-sm text-gray-400">
                <p>Type: {anomaly.type}</p>
                <p>Confidence: {(anomaly.confidence_score * 100).toFixed(0)}%</p>
                {anomaly.cross_document && <p className="text-yellow-400">Cross-document issue</p>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}