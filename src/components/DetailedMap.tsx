"use client"
import { useState, useMemo, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker
} from "react-simple-maps";
import { geoCentroid } from 'd3-geo';
import axios from 'axios';

interface RegionData {
  code: string;
  name: string;
  data?: any;
  error?: string;
}

interface Position {
  coordinates: [number, number];
  zoom: number;
}

interface GeographyProperties {
  GID_1: string;
  NAME_1: string;
  ISO_1: string;
  NL_NAME_1: string;
  TYPE_1: string;
  ENGTYPE_1: string;
}

interface GeographyType extends GeoJSON.Feature<GeoJSON.Geometry> {
  properties: GeographyProperties;
}

const saudiGeoJSON = require('/saudi-regions.json') as GeoJSON.FeatureCollection<GeoJSON.Geometry, GeographyProperties>;

const DetailedMap = () => {
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);
  const [position, setPosition] = useState<Position>({
    coordinates: [44.0000, 24.0000],
    zoom: 15,
  });

  // Calculate labels
  const labels = useMemo(() => {
    return saudiGeoJSON.features.map((feature) => {
      try {
        const centroid = geoCentroid(feature);
        return {
          coordinates: centroid,
          name: feature.properties.NAME_1
        };
      } catch (error) {
        console.error('Error calculating centroid for:', feature.properties.NAME_1);
        return null;
      }
    }).filter(Boolean);
  }, []);

  // API call handler
  const fetchRegionData = async (regionCode: string) => {
    try {
      const response = await axios.get(`/api/regions/${encodeURIComponent(regionCode)}`);
      return response.data;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  };

  // Region click handler
  const handleRegionClick = async (geo: GeographyType) => {
    const regionCode = geo.properties.ISO_1;
    const regionName = geo.properties.NAME_1;

    try {
      const data = await fetchRegionData(regionCode);
      setSelectedRegion({
        code: regionCode,
        name: regionName,
        data
      });
    } catch (error) {
      setSelectedRegion({
        code: regionCode,
        name: regionName,
        error: 'Failed to load data'
      });
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    setPosition(pos => ({
      ...pos,
      zoom: Math.min(pos.zoom * 1.5, 15),
    }));
  };

  const handleZoomOut = () => {
    setPosition(pos => ({
      ...pos,
      zoom: Math.max(pos.zoom / 1.5, 0.5),
    }));
  };

  return (
    <div className="map-container">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 400,
          center: [44, 24]
        }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={setPosition}
        >
          <Geographies geography={saudiGeoJSON}>
            {({ geographies }) => (
              <>
                {geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => handleRegionClick(geo as GeographyType)}
                    style={{
                      default: {
                        fill: selectedRegion?.code === (geo as GeographyType).properties.ISO_1
                          ? '#DAF5F0'
                          : '#DAF5F0',
                        outline: 'none',
                        stroke: '#00A09B',
                        strokeWidth: 0.35,
                      },
                      hover: {
                        fill: '#00A09B',
                        outline: 'none',
                        cursor: "pointer"
                      },
                      pressed: {
                        fill: '#E91E63',
                        outline: 'none',
                      },
                    }}
                  />
                ))}
                
                {/* Region Labels */}
                {labels.map((label, idx) => (
                  <Marker key={idx} coordinates={label?.coordinates}>
                    <g transform={`scale(${1 / position.zoom})`}>
                      <text
                        fontSize="26"
                        fontWeight="bold"
                        textAnchor="middle"
                        fill="black"
                        style={{
                          pointerEvents: 'none',
                          fontWeight: '500',
                          
                        }}
                      >
                        {label?.name}
                      </text>
                    </g>
                  </Marker>
                ))}
              </>
            )}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Zoom Controls */}
      {/* <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-md">
        <button 
          onClick={handleZoomIn}
          className="block mb-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="block px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          -
        </button>
      </div> */}

      {/* Region Info Panel */}
      {selectedRegion && (
        <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">
            {selectedRegion.name} ({selectedRegion.code})
          </h3>
          {selectedRegion.error ? (
            <p className="text-red-500">{selectedRegion.error}</p>
          ) : (
            <div>
              {/* Add your data display here */}
              <pre>{JSON.stringify(selectedRegion.data, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
      
    </div>
  );
};

export default DetailedMap;