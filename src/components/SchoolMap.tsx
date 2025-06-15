"use client";

import React, { useLayoutEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// School interface
interface School {
  school_id: string;
  name_en: string;
  address_en: string;
  ministerial_number: string;
  type_en: string;
  latitude: number;
  longitude: number;
}

// Fix for custom Leaflet icon
const createCustomIcon = () =>
  L.divIcon({
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
        <path d="M16 2C9.37 2 4 7.37 4 14c0 10.5 12 16 12 16s12-5.5 12-16c0-6.63-5.37-12-12-12z" 
              fill="#3388ff" stroke="#fff" stroke-width="1.5"/>
        <circle cx="16" cy="14" r="5" fill="#fff"/>
      </svg>
    `,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

interface SchoolMapProps {
  schools: School[];
}

const FitBoundsHandler: React.FC<{ schools: School[] }> = ({ schools }) => {
  const map = useMap();

  useLayoutEffect(() => {
    if (!schools.length) return;
    const bounds = L.latLngBounds(
      schools.map((s) => [s.latitude, s.longitude] as [number, number])
    );
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [schools, map]);

  return null;
};

const SchoolMap: React.FC<SchoolMapProps> = ({ schools }) => {
  const defaultCenter: [number, number] = [24.7136, 46.6753]; // Riyadh

  const [unmountMap, setUnmountMap] = useState(false);

  // Unmount on re-renders to avoid leaflet container conflict
  useLayoutEffect(() => {
    setUnmountMap(false);
    return () => {
      setUnmountMap(true);
    };
  }, []);

  const tileLayerConfig = {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    options: {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
      reuseTiles: true,
      minZoom: 3,
      maxNativeZoom: 17,
      updateInterval: 150,
      updateWhenIdle: true,
    },
  };

  if (unmountMap) return <div>Loading map...</div>;

  return (
    <div
      className="map-container"
      style={{
        height: "650px",
        width: "100%",
        borderRadius: "1rem",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <MapContainer
        center={defaultCenter}
        zoom={10}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution={tileLayerConfig.options.attribution}
          url={tileLayerConfig.url}
          maxZoom={tileLayerConfig.options.maxZoom}
          minZoom={tileLayerConfig.options.minZoom}
          maxNativeZoom={tileLayerConfig.options.maxNativeZoom}
          reuseTiles={tileLayerConfig.options.reuseTiles}
          updateInterval={tileLayerConfig.options.updateInterval}
          updateWhenIdle={tileLayerConfig.options.updateWhenIdle}
        />

        <FitBoundsHandler schools={schools} />

        {schools.map((school) => (
          <Marker
            key={school.school_id}
            position={[school.latitude, school.longitude]}
            icon={createCustomIcon()}
          >
            <Popup>
              <div className="popup-content">
                <h3 className="school-name">{school.name_en}</h3>
                <p className="school-address">{school.address_en}</p>
                <div className="school-details">
                  <span className="detail-label">Ministerial No:</span>
                  <span className="detail-value">{school.ministerial_number}</span>
                </div>
                <div className="school-details">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">{school.type_en}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <style jsx global>{`
        .map-container {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid #e0e0e0;
        }

        .leaflet-popup-content {
          margin: 12px;
          min-width: 200px;
        }

        .popup-content {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
        }

        .school-name {
          margin: 0 0 8px 0;
          font-size: 16px;
          color: #2c3e50;
          font-weight: 600;
        }

        .school-address {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #555;
          line-height: 1.4;
        }

        .school-details {
          display: flex;
          margin-bottom: 5px;
        }

        .detail-label {
          font-weight: 500;
          margin-right: 8px;
          color: #333;
          min-width: 100px;
        }

        .detail-value {
          color: #555;
        }
      `}</style>
    </div>
  );
};

export default SchoolMap;
