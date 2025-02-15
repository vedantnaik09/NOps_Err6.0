"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState } from "react";

interface MapModalProps {
  coordinates: [number, number];
  onClose: () => void;
}

const MapModal: React.FC<MapModalProps> = ({ coordinates, onClose }) => {
  const [position, setPosition] = useState(coordinates);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-11/12 max-w-4xl">
        <h2 className="text-xl font-bold mb-4">Complaint Location</h2>
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: "400px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={position} />
        </MapContainer>
        <div className="mt-4">
          <p>Latitude: {position[1]}</p>
          <p>Longitude: {position[0]}</p>
        </div>
        <button
          onClick={onClose}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default MapModal;