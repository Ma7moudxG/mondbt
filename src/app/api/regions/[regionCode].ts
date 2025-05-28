import { NextApiRequest, NextApiResponse } from 'next';

const mockData = {
  "SA-01": {
    name: "Riyadh Province",
    population: "8.4 million",
    area: "404,240 km²",
    capital: "Riyadh"
  },
  "SA-02": {
    name: "Makkah Province",
    population: "8.8 million",
    area: "153,128 km²",
    capital: "Mecca"
  }
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { regionCode } = req.query;
  
  if (!regionCode || Array.isArray(regionCode)) {
    return res.status(400).json({ error: "Invalid region code" });
  }

  const data = mockData[regionCode as keyof typeof mockData];
  
  if (!data) {
    return res.status(404).json({ 
      error: "Region not found",
      availableRegions: Object.keys(mockData)
    });
  }

  res.status(200).json(data);
}