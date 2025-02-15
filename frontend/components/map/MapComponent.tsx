"use client";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

interface MapComponentProps {
  onLocationSelect: (lat: number, lng: number, state: string, city: string, pincode: string) => void;
}

export default function MapComponent({ onLocationSelect }: MapComponentProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

  // Fix for default marker icon issue in Leaflet with React
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"
    });
  }, []);

  return (
    <MapContainer
      center={[20.5937, 78.9629]} // Default to India's coordinates
      zoom={5}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapClickHandler
        onLocationSelect={(lat, lng) => {
          setPosition({ lat, lng });
          fetchLocationDetails(lat, lng, onLocationSelect);
        }}
      />
      {position && <Marker position={[position.lat, position.lng]} />}
    </MapContainer>
  );
}

// Component to handle map click events
function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
}

// Function to fetch state, city, and pincode using reverse geocoding
async function fetchLocationDetails(
  lat: number,
  lng: number,
  onLocationSelect: (lat: number, lng: number, state: string, city: string, pincode: string) => void
) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();
    console.log(data)
    const state = data.address.state_district || "";
    const city = data.address.city || data.address.town || "";
    const pincode = data.address.postcode || "";
    onLocationSelect(lat, lng, state, city, pincode);
  } catch (error) {
    console.error("Error fetching location details:", error);
  }
}