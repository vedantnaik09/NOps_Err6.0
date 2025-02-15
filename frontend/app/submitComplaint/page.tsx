"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/map/MapComponent"), { ssr: false });

export default function SubmitComplaintPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [state, setState] = useState<string>("");
  const [city, setCity] = useState<string>("Mumbai");
  const [pincode, setPincode] = useState<string>("400101");
  const { push } = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const handleLocationSelect = (lat: number, lng: number, state: string, city: string, pincode: string) => {
    setLocation({ lat, lng });
    setState(state);
    setCity(city);
    setPincode(pincode);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!location) {
      setError("Please select a location on the map.");
      setIsLoading(false);
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData();
    
    formData.append("title", (form.elements.namedItem("title") as HTMLInputElement).value);
    formData.append("description", form.description.value);
    formData.append("type", form.type.value);
    
    const locationData = {
      type: "Point",
      coordinates: [location.lng, location.lat],
      state,
      city,
      pincode,
    };
    formData.append("location[type]", "Point");
    formData.append("location[coordinates][0]", String(location.lng));
    formData.append("location[coordinates][1]", String(location.lat));
    formData.append("location[state]", state);
    formData.append("location[city]", "Mumbai");
    formData.append("location[pincode]", "400101");
    
    const imageFiles = form.images.files;
    if (imageFiles) {
      for (let i = 0; i < imageFiles.length; i++) {
        formData.append("images", imageFiles[i]);
      }
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${BASE_URL}/api/complaints`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        push("/rewards");
      } else {
        setError(data.message || "Failed to submit complaint.");
      }
    } catch (error) {
      setError("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 mt-20 p-10">
      <h1 className="text-2xl font-bold">Submit a Complaint</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" placeholder="Enter complaint title" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" name="description" placeholder="Enter complaint description" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select name="type" required>
            <SelectTrigger>
              <SelectValue placeholder="Select complaint type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GARBAGE">Garbage</SelectItem>
              <SelectItem value="POTHOLE">Pothole</SelectItem>
              <SelectItem value="TRAFFIC_LIGHT">Traffic Light</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Location</Label>
          <MapComponent onLocationSelect={handleLocationSelect} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="images">Upload Images</Label>
          <Input id="images" name="images" type="file" multiple accept="image/*" />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Submit Complaint
        </Button>
      </form>
    </div>
  );
}
