import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get weather and tides data from integrations table
    const results: any = await query(
      `SELECT weather_current_data, weather_last_update, weather_update_frequency, 
              tides_enabled, tides_location, tides_data, tides_last_sync 
       FROM integrations WHERE id = 1 LIMIT 1`
    );

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(404).json({ error: 'Weather data not found' });
    }

    const { 
      weather_current_data, 
      weather_last_update, 
      weather_update_frequency,
      tides_enabled,
      tides_location,
      tides_data,
      tides_last_sync
    } = results[0];

    if (!weather_current_data) {
      return res.status(404).json({ error: 'No weather data available' });
    }

    // Parse JSON weather data
    const weatherData = typeof weather_current_data === 'string' 
      ? JSON.parse(weather_current_data) 
      : weather_current_data;

    // Parse JSON tides data
    const tidesData = tides_data ? (typeof tides_data === 'string' ? JSON.parse(tides_data) : tides_data) : null;

    return res.status(200).json({
      weather: weatherData,
      lastUpdate: weather_last_update,
      updateFrequency: weather_update_frequency || 30, // default 30 minutes
      tides: {
        enabled: Boolean(tides_enabled),
        location: tides_location || '',
        data: tidesData,
        lastSync: tides_last_sync,
      },
    });
  } catch (error) {
    console.error('Error fetching weather:', error);
    return res.status(500).json({ error: 'Failed to fetch weather data' });
  }
}

