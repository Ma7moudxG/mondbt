"use client"
import { useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps"
import { Feature } from 'geojson';

// Define TypeScript interfaces
interface RegionData {
  code: string;
  name: string;
  data?: any; // Replace 'any' with your specific data type
}

interface Position {
  coordinates: [number, number];
  zoom: number;
}

interface GeographyProperties {
  region_code: string;
  region_name: string;
  // Add other properties from your GeoJSON if needed
}

interface GeographyType extends Feature {
  properties: GeographyProperties;
}

// If using TopoJSON, you might need to adjust the type
const saudiGeoJSON = require('/saudi-regions.json') as unknown as {
  features: GeographyType[];
};

const MinisterMap = () => {
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);
  const [position, setPosition] = useState<Position>({
    coordinates: [44.0000, 24.0000], // Default center coordinates for Saudi Arabia
    zoom: 9,
  });

  const handleMoveEnd = (newPosition: Position) => {
    setPosition(newPosition);
  };

  const handleRegionClick = (geo: GeographyType) => {
    const { region_code, region_name } = geo.properties;
    setSelectedRegion({
      code: region_code,
      name: region_name,
    });
    
    // Implement your data fetching logic here
    console.log('Selected region:', region_code, region_name);
  };

  // Zoom controls handlers
  const handleZoomIn = () => {
    setPosition(pos => ({
      ...pos,
      zoom: Math.min(pos.zoom * 1.2, 8), // Limit maximum zoom
    }));
  };

  const handleZoomOut = () => {
    setPosition(pos => ({
      ...pos,
      zoom: Math.max(pos.zoom / 1.2, 1), // Limit minimum zoom
    }));
  };

  return (
    <div className="map-container">
      <ComposableMap projection="geoMercator">
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
        >
          <Geographies geography={saudiGeoJSON}>
            {({ geographies }) =>
              (geographies as GeographyType[]).map((geo) => (
                <Geography
                  key={geo.properties.region_code}
                  geography={geo}
                  onClick={() => handleRegionClick(geo)}
                  style={{
                    default: {
                      fill: selectedRegion?.code === geo.properties.region_code
                        ? '#DAF5F0'
                        : '#7DCDBE',
                      outline: 'none',
                      stroke: '#00A09B',
                      strokeWidth: 0.25,
                    },
                    hover: {
                      fill: '#00A09B',
                      outline: 'none',
                    },
                    pressed: {
                      fill: '#E91E63',
                      outline: 'none',
                    },
                  }}
                />
              ))
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Zoom Controls */}
      <div className="zoom-controls">
        <button onClick={handleZoomIn}>+</button>
        <button onClick={handleZoomOut}>-</button>
      </div>

      {/* Region Info Display */}
      {selectedRegion && (
        <div className="region-info">
          <h3>{selectedRegion.name}</h3>
          {/* Add your data display components here */}
        </div>
      )}
    </div>
  );
};

export default MinisterMap;