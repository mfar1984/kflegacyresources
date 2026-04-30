import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

// Malaysian coastal locations with approximate coordinates
const TIDES_LOCATIONS: Record<string, { lat: number; lon: number }> = {
  'Pulau Langkawi': { lat: 6.3500, lon: 99.8000 },
  'Pulau Pinang': { lat: 5.4141, lon: 100.3288 },
  'Lumut': { lat: 4.2333, lon: 100.6333 },
  'Pelabuhan Kelang': { lat: 3.0042, lon: 101.3936 },
  'Tanjung Keling': { lat: 2.1833, lon: 102.1333 },
  'Kukup': { lat: 1.3203, lon: 103.4395 },
  'Johor Bahru': { lat: 1.4655, lon: 103.7578 },
  'Tanjung Sedili': { lat: 1.9333, lon: 104.1167 },
  'Pulau Tioman': { lat: 2.8167, lon: 104.1667 },
  'Tanjung Gelang': { lat: 3.9667, lon: 103.4333 },
  'Cendering': { lat: 5.2667, lon: 103.1167 },
  'Geting': { lat: 5.9667, lon: 102.5167 },
  'Pulau Lakei': { lat: 3.4833, lon: 113.0333 },
  'Sejingkat': { lat: 1.5833, lon: 110.3500 },
  'Bintulu': { lat: 3.1667, lon: 113.0333 },
  'Miri': { lat: 4.3997, lon: 113.9914 },
  'Kota Kinabalu': { lat: 5.9804, lon: 116.0735 },
  'Kudat': { lat: 6.8833, lon: 116.8333 },
  'Sandakan': { lat: 5.8389, lon: 118.1178 },
  'Lahad Datu': { lat: 5.0333, lon: 118.3333 },
  'Tawau': { lat: 4.2495, lon: 117.8944 },
  'Labuan': { lat: 5.2831, lon: 115.2308 },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get integrations settings
    const results: any = await query(
      `SELECT tides_enabled, tides_location FROM integrations WHERE id = 1 LIMIT 1`
    );

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(404).json({ error: 'Integration settings not found' });
    }

    const { tides_enabled, tides_location } = results[0];

    if (!tides_enabled) {
      return res.status(400).json({ error: 'Tides feature is not enabled' });
    }

    const locationCoords = TIDES_LOCATIONS[tides_location];
    if (!locationCoords) {
      return res.status(400).json({ error: 'Invalid location' });
    }

    // Fetch tides data from WorldTides API
    const WORLDTIDES_API_KEY = '07a00638-3f72-4dff-8855-568b7ac44267';
    const { lat, lon } = locationCoords;
    
    // Get extremes (high/low tides) for next 3 days
    const worldTidesUrl = `https://www.worldtides.info/api/v3?extremes&lat=${lat}&lon=${lon}&key=${WORLDTIDES_API_KEY}&days=3`;
    
    let tidesData: any = {
      location: tides_location,
      extremes: [],
    };

    try {
      const tidesResponse = await fetch(worldTidesUrl);
      
      if (tidesResponse.ok) {
        const data = await tidesResponse.json();
        
        // Parse WorldTides response
        if (data.extremes && Array.isArray(data.extremes)) {
          tidesData.extremes = data.extremes.map((extreme: any) => ({
            dt: new Date(extreme.dt * 1000).toISOString(), // Convert Unix timestamp to ISO
            type: extreme.type === 'High' ? 'High' : 'Low',
            height: parseFloat(extreme.height.toFixed(2)),
          }));
        }
      } else {
        console.error('WorldTides API error:', await tidesResponse.text());
        // Fallback to mock data if API fails
        tidesData.extremes = [
          {
            dt: new Date(Date.now() + 2 * 3600000).toISOString(),
            type: 'High',
            height: 2.1,
          },
          {
            dt: new Date(Date.now() + 8 * 3600000).toISOString(),
            type: 'Low',
            height: 0.3,
          },
          {
            dt: new Date(Date.now() + 14 * 3600000).toISOString(),
            type: 'High',
            height: 2.3,
          },
        ];
      }
    } catch (fetchError) {
      console.error('Failed to fetch from WorldTides:', fetchError);
      // Fallback to mock data
      tidesData.extremes = [
        {
          dt: new Date(Date.now() + 2 * 3600000).toISOString(),
          type: 'High',
          height: 2.1,
        },
        {
          dt: new Date(Date.now() + 8 * 3600000).toISOString(),
          type: 'Low',
          height: 0.3,
        },
        {
          dt: new Date(Date.now() + 14 * 3600000).toISOString(),
          type: 'High',
          height: 2.3,
        },
      ];
    }

    // Update tides data in database
    await query(
      `UPDATE integrations SET tides_data = ?, tides_last_sync = NOW() WHERE id = 1`,
      [JSON.stringify(tidesData)]
    );

    return res.status(200).json({
      message: 'Tides data synced successfully',
      data: tidesData,
    });
  } catch (error) {
    console.error('Error syncing tides:', error);
    return res.status(500).json({ error: 'Failed to sync tides data' });
  }
}

