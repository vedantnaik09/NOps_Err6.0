"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MapPin, Eye } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import dynamic from 'next/dynamic'

// Dynamically import Map from react-leaflet
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

const Map = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })

export interface Complaint {
    _id: string;
    title: string;
    description: string;
    status: string;
    images: string[];
    location: {
        state: string;
        city: string;
        pincode: string;
        coordinates: number[];
    };
    userId: {
        name: string;
        email: string;
    };
    createdAt: string;
}

export default function AdvancedComplaintView() {
    const [complaints, setComplaints] = useState<Complaint[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("Authorization token is missing");
                }

                const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/complaints`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch complaints");
                }

                const data = await response.json();
                setComplaints(data);
            } catch (err) {
                setError("An error occurred while fetching complaints");
            } finally {
                setIsLoading(false);
            }
        };

        fetchComplaints()
    }, [])

    const sortedComplaints = useMemo(() => {
        return [...complaints].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }, [complaints])

    const getSeverityColor = (status: string) => {
        if (status === "PENDING") return "bg-yellow-500 text-white"
        if (status === "RESOLVED") return "bg-green-500 text-white"
        return "bg-red-500 text-white"
    }

    const updateComplaintStatus = async (complaintId: string, currentStatus: string) => {
        const token = localStorage.getItem("token")
        if (!token) {
            return alert("Authorization token is missing")
        }

        let nextStatus = '';
        if (currentStatus === "PENDING") {
            nextStatus = "IN_PROGRESS";
        } else if (currentStatus === "IN_PROGRESS") {
            nextStatus = "RESOLVED";
        } else {
            return alert("Complaint already resolved");
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/complaints/${complaintId}/status`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: nextStatus,
                    comment: "Status updated",
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to update status")
            }

            const updatedComplaint = await response.json()
            setComplaints((prevComplaints) =>
                prevComplaints.map((complaint) =>
                    complaint._id === complaintId ? { ...complaint, status: nextStatus } : complaint
                )
            )
        } catch (err) {
            alert("Error updating status")
        }
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 p-8 flex items-center justify-center">
                <p className="text-red-500 text-xl">{error}</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 p-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-12 mb-8 text-center">
                Customer{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                    Complaint Management
                </span>
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {isLoading
                        ? Array.from({ length: 6 }).map((_, index) => (
                            <Card key={index} className="bg-white/10 backdrop-blur-sm border border-purple-100/20">
                                <CardContent className="p-6">
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-1/2 mb-4" />
                                    <Skeleton className="h-20 w-full mb-4" />
                                    <div className="flex justify-between items-center">
                                        <Skeleton className="h-8 w-24" />
                                        <Skeleton className="h-8 w-32" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                        : sortedComplaints.map((complaint) => (
                            <motion.div
                                key={complaint._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="bg-white/10 backdrop-blur-sm border border-purple-100/20 hover:border-purple-300/30 transition-all duration-300">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-lg">{complaint.userId.name}</h3>
                                            <Badge className={getSeverityColor(complaint.status)}>
                                                {complaint.status}
                                            </Badge>
                                        </div>
                                        <p className="text-base text-gray-300 mb-4 line-clamp-2">{complaint.description}</p>
                                        <div className="flex justify-between items-center">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" className="border-2">
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Complaint
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="bg-gray-800 text-gray-100 border border-purple-100/20 w-11/12 max-w-5xl max-h-[90vh] overflow-hidden">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-2xl font-bold mb-4">Complaint Details</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="overflow-y-auto pr-4 max-h-[calc(90vh-8rem)]">
                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                            <div className="space-y-4">
                                                                <div className="bg-gray-700/50 rounded-lg p-4">
                                                                    <h3 className="font-semibold text-gray-300">Customer Information</h3>
                                                                    <div className="mt-2 space-y-2">
                                                                        <p><span className="text-gray-400">Name:</span> {complaint.userId.name}</p>
                                                                        <p><span className="text-gray-400">Email:</span> {complaint.userId.email}</p>
                                                                        <p><span className="text-gray-400">Complaint ID:</span> {complaint._id}</p>
                                                                    </div>
                                                                </div>

                                                                <div className="bg-gray-700/50 rounded-lg p-4">
                                                                    <h3 className="font-semibold text-gray-300">Complaint Details</h3>
                                                                    <div className="mt-2 space-y-2">
                                                                        <p><span className="text-gray-400">Title:</span> {complaint.title}</p>
                                                                        <p><span className="text-gray-400">Description:</span></p>
                                                                        <p className="text-sm whitespace-pre-wrap">{complaint.description}</p>
                                                                    </div>
                                                                </div>

                                                                <div className="bg-gray-700/50 rounded-lg p-4">
                                                                    <h3 className="font-semibold text-gray-300">Location Information</h3>
                                                                    <div className="mt-2 space-y-2">
                                                                        <p>
                                                                            <span className="text-gray-400">Address:</span> {complaint.location.city}, {complaint.location.state} - {complaint.location.pincode}
                                                                        </p>
                                                                        <p><span className="text-gray-400">Date Filed:</span> {new Date(complaint.createdAt).toLocaleString()}</p>
                                                                    </div>
                                                                </div>

                                                                <div className="bg-gray-700/50 rounded-lg p-4">
                                                                    <h3 className="font-semibold text-gray-300">Evidence Images</h3>
                                                                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                        {complaint.images.map((image, idx) => (
                                                                            <img
                                                                                key={idx}
                                                                                src={`${process.env.NEXT_PUBLIC_BASE_URL}${image}`}
                                                                                alt={`Complaint Image ${idx + 1}`}
                                                                                className="w-full h-48 object-fit rounded-md"
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-4">
                                                                <div className="bg-gray-700 rounded-lg p-4 h-[400px] flex items-center justify-center sticky top-0">
                                                                <MapContainer
            center={[complaint.location.coordinates[1], complaint.location.coordinates[0]]} // Reversed coordinates
            zoom={13}
            className="h-full w-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[complaint.location.coordinates[1], complaint.location.coordinates[0]]}>
              {" "}
              {/* Reversed coordinates */}
              <Popup>
                {complaint.location.city}, {complaint.location.state}
              </Popup>
            </Marker>
          </MapContainer>
                                                                </div>

                                                                <div className="bg-gray-700/50 rounded-lg p-4">
                                                                    <h3 className="font-semibold text-gray-300 mb-3">Status Management</h3>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className={`${complaint.status === 'PENDING' ? 'bg-yellow-500/20' : ''}`}
                                                                            onClick={() => updateComplaintStatus(complaint._id, 'PENDING')}
                                                                            disabled={complaint.status === 'RESOLVED'}
                                                                        >
                                                                            Set Pending
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className={`${complaint.status === 'IN_PROGRESS' ? 'bg-blue-500/20' : ''}`}
                                                                            onClick={() => updateComplaintStatus(complaint._id, 'IN_PROGRESS')}
                                                                            disabled={complaint.status === 'RESOLVED'}
                                                                        >
                                                                            Set In Progress
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className={`${complaint.status === 'RESOLVED' ? 'bg-green-500/20' : ''}`}
                                                                            onClick={() => updateComplaintStatus(complaint._id, 'RESOLVED')}
                                                                            disabled={complaint.status === 'RESOLVED'}
                                                                        >
                                                                            Set Resolved
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-2"
                                                onClick={() => updateComplaintStatus(complaint._id, complaint.status)}
                                                disabled={complaint.status === 'RESOLVED'}
                                            >
                                                {complaint.status === "PENDING" && "Change Status to IN_PROGRESS"}
                                                {complaint.status === "IN_PROGRESS" && "Change Status to RESOLVED"}
                                                {complaint.status === "RESOLVED" && "Complaint Resolved"}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                </AnimatePresence>
            </div>
        </div>
    )
}
