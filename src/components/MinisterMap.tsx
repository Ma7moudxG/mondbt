// components/MinisterMap.tsx
"use client";
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import DataService from "@/services/dataService"; // Adjust path as necessary

// Assuming saudi-regions.json is in src/data/
const saudiGeoJSON = require("@/saudi-regions.json"); // FIX: Correct import path

interface MinisterMapProps {
  onRegionSelect: (regionId: number) => void;
  selectedRegionId?: number | null;
}

const MinisterMap = ({ onRegionSelect, selectedRegionId }: MinisterMapProps) => {
  const handleRegionClick = (geo: any) => {
    const regionName = geo.properties.NAME_1;
    console.log("regionName", regionName);
    const region = DataService.getRegionByName(regionName);
    
    if (region) {
      console.log("MinisterMap: Selected Region:", region);
      onRegionSelect(region.region_id);
    }
  };

  return (
    <div className="h-[600px] w-full relative">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 2500,
          center: [45, 25]
        }}
      >
        <ZoomableGroup zoom={1} center={[45, 25]}>
          <Geographies geography={saudiGeoJSON}>
            {({ geographies }) => geographies.map((geo) => {
              const centroid = geoCentroid(geo);
              const regionName = geo.properties.NAME_1;
              const region = DataService.getRegionByName(regionName);
              const isSelected = region?.region_id === selectedRegionId;

              return (
                <g key={geo.rsmKey}>
                  <Geography
                    geography={geo}
                    onClick={() => handleRegionClick(geo)}
                    style={{
                      default: {
                        fill: isSelected ? "#00A09B" : "#DAF5F0",
                        outline: "none",
                        stroke: "#00A09B",
                        strokeWidth: 0.35,
                      },
                      hover: {
                        fill: "#00A09B",
                        outline: "none",
                        cursor: "pointer"
                      },
                      pressed: {
                        fill: "#E91E63",
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
                      style={{ pointerEvents: 'none' }}
                    >
                      {geo.properties.NAME_1}
                    </text>
                  </Marker>
                </g>
              );
            })}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default MinisterMap;