// components/MinisterMap.tsx
"use client";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import DataService from "@/services/dataService";
import React, { useState, useEffect, useRef } from "react"; // Import useRef
import { useTranslation } from "react-i18next";

const saudiGeoJSON = require("@/saudi-regions.json");

interface MinisterMapProps {
  onRegionSelect: (regionId: number | null) => void; // Allow null for deselecting
  selectedRegionId?: number | null;
}

const MinisterMap = ({
  onRegionSelect,
  selectedRegionId,
}: MinisterMapProps) => {
  const { i18n } = useTranslation();
  const [currentZoom, setCurrentZoom] = useState(1);
  const mapRef = useRef<HTMLDivElement>(null); // Create a ref for the map container

  // Effect for setting up the click outside listener
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    // Check if the target or any of its parents has the data attribute
    const isIgnored = target.closest('[data-ignore-click-outside="true"]');

    if (
      mapRef.current &&
      !mapRef.current.contains(target) &&
      !isIgnored && // Ignore clicks on elements with this attribute
      selectedRegionId !== null
    ) {
      onRegionSelect(null); // Deselect the region
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [selectedRegionId, onRegionSelect]);

  // Effect for updating zoom based on screen width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        setCurrentZoom(2);
      } else if (width >= 768) {
        setCurrentZoom(3);
      } else {
        setCurrentZoom(3);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleRegionClick = (geo: any) => {
    const regionNameEn = geo.properties.NAME_1;
    const region = DataService.getRegionByName(regionNameEn);

    if (region) {
      onRegionSelect(region.region_id);
    }
  };

  return (
    // Attach the ref to the map's container div
    <div className="w-full h-full relative" ref={mapRef}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1500,
          center: [45, 25],
        }}
        width={800}
        height={800}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup zoom={currentZoom} center={[45, 25]}>
          <Geographies geography={saudiGeoJSON}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const centroid = geoCentroid(geo);
                const regionNameEn = geo.properties.NAME_1;
                const region = DataService.getRegionByName(regionNameEn);
                const isSelected = region?.region_id === selectedRegionId;

                const defaultFillColor = "#DAF5F0";
                const selectedFillColor = "#00A09B";
                const hoverFillColor = "#8447AB";

                const displayName =
                  i18n.language === "ar" && region?.name_ar
                    ? region.name_ar
                    : regionNameEn;

                return (
                  <g key={geo.rsmKey}>
                    <Geography
                      geography={geo}
                      onClick={() => handleRegionClick(geo)}
                      style={{
                        default: {
                          fill: isSelected ? selectedFillColor : defaultFillColor,
                          outline: "none",
                          stroke: "#00A09B",
                          strokeWidth: 0.35,
                          cursor: "pointer",
                        },
                        hover: {
                          fill: isSelected ? selectedFillColor : hoverFillColor,
                          stroke: "#00A09B",
                          strokeWidth: 0.35,
                          cursor: "pointer",
                        },
                        pressed: {
                          fill: selectedFillColor,
                          outline: "none",
                          stroke: "#00A09B",
                          strokeWidth: 0.35,
                        },
                      }}
                    />
                    {centroid && (
                      <Marker coordinates={centroid}>
                        <text
                          fontSize="16"
                          fontWeight="bold"
                          textAnchor="middle"
                          fill="black"
                          style={{ pointerEvents: "none" }}
                        >
                          {displayName}
                        </text>
                      </Marker>
                    )}
                  </g>
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default MinisterMap;