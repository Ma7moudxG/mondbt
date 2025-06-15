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

  const handleRegionClick = (geo: any) => {
    const regionNameEn = geo.properties.NAME_1;
    const region = DataService.getRegionByName(regionNameEn);

    if (region) {
      onRegionSelect(region.region_id);
    }
  };

  return (
    <div className="h-[600px] w-full relative">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 2500,
          center: [45, 25],
        }}
      >
        <ZoomableGroup zoom={1} center={[45, 25]}>
          <Geographies geography={saudiGeoJSON}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const centroid = geoCentroid(geo);
                const regionNameEn = geo.properties.NAME_1;
                const region = DataService.getRegionByName(regionNameEn);
                const isSelected = region?.region_id === selectedRegionId;
                const isArriyad = regionNameEn === "Arriyad";

                // Define the default fill color for non-selected regions
                const defaultFillColor = "#DAF5F0";
                // Define the fill color for Arriyad when selected
                const arriyadSelectedFillColor = "#00A09B";

                const displayName =
                  i18n.language === "ar" && region?.name_ar
                    ? region.name_ar
                    : regionNameEn;

                return (
                  <g key={geo.rsmKey}>
                    <Geography
                      geography={geo}
                      // Only allow click on Arriyad
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
                          cursor: isArriyad ? "pointer" : "default", // Set cursor to pointer only for Arriyad
                        },
                        hover: isArriyad
                          ? {
                              // Interactive hover styles for Arriyad
                              fill: arriyadSelectedFillColor, // Can be slightly different for hover if desired
                              stroke: "#00A09B",
                              strokeWidth: 0.35,
                              cursor: "pointer",
                            }
                          : {
                              // No visual change on hover for other regions
                              fill: isSelected
                                ? arriyadSelectedFillColor
                                : defaultFillColor, // Keep default fill
                              stroke: "#00A09B",
                              strokeWidth: 0.35,
                              cursor: "default", // Ensure default cursor
                            },
                        pressed: isArriyad
                          ? {
                              // Interactive pressed styles for Arriyad
                              fill: "#E91E63", // Example pressed color
                              outline: "none",
                            }
                          : {
                              // No visual change on pressed for other regions
                              fill: isSelected
                                ? arriyadSelectedFillColor
                                : defaultFillColor, // Keep default fill
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
