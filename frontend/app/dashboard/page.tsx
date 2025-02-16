"use client";
import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface DashboardStats {
  total_conversations: number;
  total_pdfs: number;
  recent_conversations: number;
  total_messages: number;
  avg_messages_per_conversation: number;
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/users/dashboard-stats");
        const data: DashboardStats = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };
    fetchStats();
  }, []);

  if (!stats) {
    return <p className="text-gray-300 text-center">Loading...</p>;
  }

  const chartData = [
    { name: "Total Conversations", value: stats.total_conversations ?? 0 },
    { name: "Total PDFs", value: stats.total_pdfs ?? 0 },
    { name: "Recent Conversations", value: stats.recent_conversations ?? 0 },
    { name: "Total Messages", value: stats.total_messages ?? 0 },
    { name: "Avg Msg/Conversation", value: stats.avg_messages_per_conversation ?? 0 },
  ];

  return (
    <div className="p-8 bg-black min-h-screen text-gray-300">
      <h1 className="text-3xl font-bold mb-8 mt-16  text-white">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Conversations" value={stats.total_conversations} />
        <StatCard title="Total PDFs Processed" value={stats.total_pdfs} />
        <StatCard title="Recent Conversations (7 days)" value={stats.recent_conversations} />
        <StatCard title="Total Messages" value={stats.total_messages} />
        <StatCard title="Avg Messages/Conversation" value={stats.avg_messages_per_conversation} />
      </div>

      <div className="bg-gray-900 p-6 rounded-lg shadow border border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-white">Statistics Overview</h2>
        <BarChart width={800} height={400} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#555" />
          <XAxis dataKey="name" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip wrapperStyle={{ backgroundColor: "#222", color: "#fff" }} />
          <Legend />
          <Bar dataKey="value" fill="#6366f1" />
        </BarChart>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => (
  <div className="bg-gray-900 p-6 rounded-lg shadow border border-gray-700">
    <h2 className="text-lg font-semibold text-gray-300">{title}</h2>
    <p className="text-3xl text-white">{value ?? 0}</p>
  </div>
);

export default DashboardPage;
