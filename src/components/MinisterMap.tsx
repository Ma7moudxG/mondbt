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
import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react"; // Import useState and useEffect

const saudiGeoJSON = require("@/saudi-regions.json");

interface MinisterMapProps {
  onRegionSelect: (regionId: number) => void;
  selectedRegionId?: number | null;
}

const MinisterMap = ({
  onRegionSelect,
  selectedRegionId,
}: MinisterMapProps) => {
  const { i18n } = useTranslation();

  // State to store the current zoom level
  const [currentZoom, setCurrentZoom] = useState(1);

  // Effect to update zoom based on screen width
  useEffect(() => {
    const handleResize = () => {
      // Define your breakpoints and corresponding zoom levels
      // Tailwind's default breakpoints:
      // sm: 640px
      // md: 768px
      // lg: 1024px
      // xl: 1280px
      // 2xl: 1536px

      const width = window.innerWidth;
      if (width >= 1280) { // xl and larger
        setCurrentZoom(2);
      } else if (width >= 768) { // md and lg
        setCurrentZoom(3);
      } else { // sm and smaller
        setCurrentZoom(3);
      }
    };

    // Set initial zoom on mount
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  const handleRegionClick = (geo: any) => {
  const regionNameEn = geo.properties.NAME_1;
  const region = DataService.getRegionByName(regionNameEn);

  if (region) {
    // This will pass the new region ID to the parent component
    // The parent component should manage the `selectedRegionId` state
    onRegionSelect(region.region_id);
  }
};

  return (
    // Make the container fill its parent, and map will fill this container
    <div className="w-full h-full relative">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1500, // This scale is relative to the base zoom. Adjust if needed.
          center: [45, 25],
        }}
        // Add width and height props to ComposableMap to ensure it fills the div
        width={800} // These values are placeholders and will be scaled by CSS
        height={800} // Ensure aspect ratio is maintained or adjust for your needs
        style={{ width: "100%", height: "100%" }} // Make map fill its parent div
      >
        <ZoomableGroup zoom={currentZoom} center={[45, 25]}> {/* Use currentZoom here */}
          <Geographies geography={saudiGeoJSON}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const centroid = geoCentroid(geo);
                const regionNameEn = geo.properties.NAME_1;
                const region = DataService.getRegionByName(regionNameEn);
                const isSelected = region?.region_id === selectedRegionId;
                const isArriyad = regionNameEn === "Arriyad";

                const defaultFillColor = "#DAF5F0";
                const arriyadSelectedFillColor = "#00A09B";

                const displayName =
                  i18n.language === "ar" && region?.name_ar
                    ? region.name_ar
                    : regionNameEn;

                return (
                  <g key={geo.rsmKey}>
                    <Geography
                      geography={geo}
                      onClick={
                        isArriyad ? () => handleRegionClick(geo) : undefined
                      }
                      style={{
                        default: {
                          fill: isSelected
                            ? arriyadSelectedFillColor
                            : defaultFillColor,
                          outline: "none",
                          stroke: "#00A09B",
                          strokeWidth: 0.35,
                          cursor: isArriyad ? "pointer" : "default",
                        },
                        hover: isArriyad
                          ? {
                              fill: arriyadSelectedFillColor,
                              stroke: "#00A09B",
                              strokeWidth: 0.35,
                              cursor: "pointer",
                            }
                          : {
                              fill: isSelected
                                ? arriyadSelectedFillColor
                                : defaultFillColor,
                              stroke: "#00A09B",
                              strokeWidth: 0.35,
                              cursor: "default",
                            },
                        pressed: isArriyad
                          ? {
                              fill: "#E91E63",
                              outline: "none",
                            }
                          : {
                              fill: isSelected
                                ? arriyadSelectedFillColor
                                : defaultFillColor,
                              outline: "none",
                            },
                      }}
                    />
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