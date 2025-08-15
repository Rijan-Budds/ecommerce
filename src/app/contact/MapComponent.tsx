"use client";
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export default function MapComponent() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Fix for default markers in react-leaflet
    delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  if (!isClient) {
    return (
      <div className="h-80 w-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading map...</div>
      </div>
    );
  }
  return (
    <MapContainer
      center={[27.6734, 85.4348]}
      zoom={15}
      scrollWheelZoom={false}
      className="h-80 w-full z-10"
      style={{ minHeight: '320px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[27.6734, 85.4348]}>
        <Popup minWidth={250}>
          <div className="p-2">
            <h3 className="font-semibold text-gray-900 mb-2">Tech Store</h3>
            <p className="text-sm text-gray-600 mb-3">Suryamadhi, Bhaktapur, Nepal</p>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3533.4194566026704!2d85.43477772612894!3d27.673427826202076!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1aad4d84edbf%3A0xef9bc5713f04cee!2sSuryamadhi%2C%20Bhaktapur%2044800!5e0!3m2!1sen!2snp!4v1755233170220!5m2!1sen!2snp"
              width="250"
              height="200"
              style={{ border: 0, borderRadius: '8px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
