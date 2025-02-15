"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import dynamic from "next/dynamic";

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

interface Location {
  state: string;
  city: string;
  pincode: string;
  coordinates?: [number, number]; // Latitude and longitude
}

interface Complaint {
  _id: string;
  title: string;
  description: string;
  type: string;
  location: Location;
  images: string[];
  status: string;
  userId: string;
  createdAt: string;
}

interface ComplaintDetailsProps {
  complaint: Complaint;
}

const ComplaintDetails = ({ complaint }: ComplaintDetailsProps) => {
  return (
    <div className="space-y-6">
      <div className="flex space-evenly justify-center">
        {complaint.images.map((image, index) => (
          <img key={index} src={`${process.env.NEXT_PUBLIC_BASE_URL}${image}`} alt={`Complaint image ${index + 1}`} className="h-[100px] object-cover rounded border border-white p-2" />
        ))}
      </div>

      {complaint.location.coordinates && (
        <div className="h-64 w-full rounded overflow-hidden">
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
      )}

      <div className="space-y-2">
        <h3 className="font-semibold">Location Details</h3>
        <p>
          {complaint.location.city}, {complaint.location.state} - {complaint.location.pincode}
        </p>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false); // Track client-side rendering
  const router = useRouter();

  useEffect(() => {
    setIsClient(true); // Mark the component as rendered on the client
  }, []);

  useEffect(() => {
    const fetchComplaints = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/complaints/user`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch complaints");
        }
        const data = await response.json();
        console.log(data);
        setComplaints(data);
      } catch (error: any) {
        setError(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [router]);

  if (!isClient) {
    return null; // Prevent rendering the component before hydration
  }

  return (
    <div className="space-y-6 mt-20">
      {loading && <p>Loading complaints...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && complaints.length === 0 && <p>No complaints found</p>}
      {!loading && complaints.length > 0 && (
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complaints.map((complaint) => (
              <TableRow key={complaint._id}>
                <TableCell>{complaint.title}</TableCell>
                <TableCell>{complaint.description}</TableCell>
                <TableCell>{complaint.type}</TableCell>
                <TableCell>
                  {complaint.location.city}, {complaint.location.state}
                </TableCell>
                <TableCell>{complaint.status}</TableCell>
                <TableCell>{new Date(complaint.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>{complaint.title}</DialogTitle>
                      </DialogHeader>
                      <ComplaintDetails complaint={complaint} />
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
