// MinisterMap.tsx
"use client";
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps";
import { geoCentroid } from "d3-geo";

const saudiGeoJSON = require("/saudi-regions.json");

interface MinisterMapProps {
  onRegionSelect: (code: string, name: string) => void;
  selectedRegionCode?: string | null;
}

const MinisterMap = ({ onRegionSelect, selectedRegionCode }: MinisterMapProps) => {
  return (
    <div className="h-full w-full relative">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 2500,
          center: [45, 25]
        }}
      >
        <ZoomableGroup zoom={1} center={[45, 25]}>
          <Geographies geography={saudiGeoJSON}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const regionCode = geo.properties.GID_1; // Use unique identifier
                const regionName = geo.properties.NAME_1;
                const centroid = geoCentroid(geo);

                return (
                  <g key={geo.rsmKey}>
                    <Geography
                      geography={geo}
                      onClick={() => onRegionSelect(regionCode, regionName)}
                      style={{
                        default: {
                          fill: selectedRegionCode === regionCode ? "#00A09B" : "#DAF5F0",
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
                        style={{
                          pointerEvents: 'none',
                          fontWeight: '500',
                        }}
                      >
                        {regionName}
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