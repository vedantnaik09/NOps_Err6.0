"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Trophy, Star } from "lucide-react"

export default function RewardsDashboard() {
  const [complaints, setComplaints] = useState<any[]>([])
  const [userData, setUserData] = useState<any>(null)  // Add state for user data
  const [stats, setStats] = useState<any>(null) // Add state for stats

  // Assuming the token is stored in localStorage or context
  const token = localStorage.getItem("token")

  // Fetch user profile data from the backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch user data")
        }

        const fetchedUserData = await response.json()
        console.log(fetchedUserData)

        // Set stats and user data from the fetched data
        setComplaints(fetchedUserData.complaints || [])
        setStats(fetchedUserData.stats || {})
        setUserData(fetchedUserData.user || {})  // Store the user data

      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    if (token) {
      fetchUserData()
    }
  }, [token])

  // Calculate total reward points from complaints (if available)
  const totalRewardPoints = useMemo(() => {
    return complaints.reduce((sum, complaint) => sum + (complaint.reward || 0), 0)
  }, [complaints])

  return (
    <div className="min-h-[90vh] flex items-center">
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-white">
            Your Rewards{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Dashboard
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl">
            Track your rewards and see how your feedback contributes to improving our services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Total Rewards Card */}
          <Card className="bg-white/10 backdrop-blur-sm border border-purple-100/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                Total Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-4xl font-bold">{userData?.points} points</span>
              </div>
              {/* <Progress value={userData?.points % 100} className="mt-4" /> */}
            </CardContent>
          </Card>

          {/* User Info Card */}
          <Card className="bg-white/10 backdrop-blur-sm border border-purple-100/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">User Information</CardTitle>
            </CardHeader>
            <CardContent>
              {userData && (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Name</span>
                    <span className="text-white">{userData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Email</span>
                    <span className="text-white">{userData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Phone Number</span>
                    <span className="text-white">{userData.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Address</span>
                    <span className="text-white">{userData.address}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Stats Card */}
          <Card className="bg-white/10 backdrop-blur-sm border border-purple-100/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">User Stats</CardTitle>
            </CardHeader>
            <CardContent>
              {stats && (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Complaints</span>
                    <span className="text-white">{stats.totalComplaints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Pending Complaints</span>
                    <span className="text-white">{stats.pendingComplaints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Resolved Complaints</span>
                    <span className="text-white">{stats.resolvedComplaints}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>


      </div>
    </div>
  )
}
