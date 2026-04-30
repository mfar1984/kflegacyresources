'use client';

import { useState, useEffect } from 'react';

interface WeatherData {
  name: string;
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    temp_min?: number;
    temp_max?: number;
  };
  wind: {
    speed: number;
  };
  visibility: number;
  clouds?: {
    all: number;
  };
  sys: {
    country: string;
  };
  temp_min?: number;
  temp_max?: number;
  rain?: number;
}

interface WeatherResponse {
  weather: WeatherData;
  lastUpdate: string;
  updateFrequency: number; // in minutes
  tides?: {
    enabled: boolean;
    location: string;
    data: {
      extremes: Array<{
        dt: string;
        type: 'High' | 'Low';
        height: number;
      }>;
    } | null;
  };
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updateFrequency, setUpdateFrequency] = useState(30); // default 30 minutes
  const [tides, setTides] = useState<WeatherResponse['tides'] | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [hoveredTide, setHoveredTide] = useState<{ x: number; y: number; time: string; height: string; type: string } | null>(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  useEffect(() => {
    // Set interval based on update frequency from database
    const interval = setInterval(fetchWeather, updateFrequency * 60 * 1000);
    return () => clearInterval(interval);
  }, [updateFrequency]);

  const fetchWeather = async () => {
    try {
      const response = await fetch('/api/admin/weather');
      if (response.ok) {
        const data: WeatherResponse = await response.json();
        setWeather(data.weather);
        if (data.updateFrequency) {
          setUpdateFrequency(data.updateFrequency);
        }
        if (data.tides) {
          setTides(data.tides);
        }
        if (data.lastUpdate) {
          setLastUpdate(data.lastUpdate);
        }
      }
    } catch (error) {
      console.error('Failed to fetch weather:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !weather) return null;

  const temp = Math.round(weather.main.temp);
  const description = weather.weather[0]?.description || '';
  const icon = weather.weather[0]?.icon || '01d';

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 12px',
        cursor: 'pointer',
        borderRadius: '2px',
        transition: 'background 0.2s',
      }}
      onMouseEnter={() => setShowPopup(true)}
      onMouseLeave={() => setShowPopup(false)}
      className="weather-widget"
    >
      {/* Weather Icon & Temp */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '20px' }}>
          {icon.startsWith('01') ? '☀️' :
           icon.startsWith('02') ? '⛅' :
           icon.startsWith('03') ? '☁️' :
           icon.startsWith('04') ? '☁️' :
           icon.startsWith('09') ? '🌧️' :
           icon.startsWith('10') ? '🌦️' :
           icon.startsWith('11') ? '⛈️' :
           icon.startsWith('13') ? '❄️' :
           icon.startsWith('50') ? '🌫️' : '🌤️'}
        </span>
        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
          {temp}°C
        </span>
        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#6b7280' }}>
          | {description.charAt(0).toUpperCase() + description.slice(1)}
        </span>
      </div>

      {/* Hover Popup - RISDA EXACT */}
      {showPopup && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '4px',
            width: '320px',
            maxHeight: '85vh',
            background: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e5e7eb',
            zIndex: 10000,
            fontFamily: 'Poppins, sans-serif',
            overflow: 'hidden',
            overflowY: 'auto',
          }}
        >
          {/* Header - Blue Gradient */}
          <div style={{ background: 'linear-gradient(to right, #3b82f6, #2563eb)', padding: '12px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
                  Weather {weather.name}, Malaysia
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#e0f2fe' }}>
                  {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#ffffff' }}>
                {temp}°C
              </div>
            </div>
          </div>

          {/* Current Condition - Light Blue BG */}
          <div style={{ padding: '12px 16px', background: 'linear-gradient(to bottom right, #eff6ff, #ffffff)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '32px' }}>
                  {icon.startsWith('01') ? '☀️' :
                   icon.startsWith('02') ? '⛅' :
                   icon.startsWith('03') ? '☁️' :
                   icon.startsWith('04') ? '☁️' :
                   icon.startsWith('09') ? '🌧️' :
                   icon.startsWith('10') ? '🌦️' :
                   icon.startsWith('11') ? '⛈️' :
                   icon.startsWith('13') ? '❄️' :
                   icon.startsWith('50') ? '🌫️' : '🌤️'}
                </span>
                <div>
                  <p style={{ margin: 0, fontSize: '10px', color: '#6b7280' }}>Condition</p>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#111827', textTransform: 'capitalize' }}>
                    {description}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '32px' }}>🌡️</span>
                <div>
                  <p style={{ margin: 0, fontSize: '10px', color: '#6b7280' }}>Temperature</p>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#111827' }}>
                    {temp}°C
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Details - White Card */}
          <div style={{ padding: '16px 24px', background: '#ffffff', borderTop: '1px solid #f3f4f6' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '10px', fontWeight: '600', color: '#374151' }}>Current Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <p style={{ margin: 0, fontSize: '10px', color: '#6b7280' }}>Feels Like:</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                  {Math.round(weather.main.feels_like)}°C
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '10px', color: '#6b7280' }}>Humidity:</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                  {weather.main.humidity}%
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '10px', color: '#6b7280' }}>Wind Speed:</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                  {weather.wind.speed.toFixed(1)} km/h
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '10px', color: '#6b7280' }}>Pressure:</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                  {weather.main.pressure} hPa
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '10px', color: '#6b7280' }}>Visibility:</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                  {(weather.visibility / 1000).toFixed(0)} km
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '10px', color: '#6b7280' }}>UV Index:</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                  5
                </p>
              </div>
            </div>
          </div>

          {/* Forecast - Gray BG */}
          <div style={{ padding: '24px', background: '#f9fafb', borderTop: '1px solid #f3f4f6' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '10px', fontWeight: '600', color: '#374151' }}>Today&apos;s Forecast</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '32px', marginBottom: '4px' }}>🌡️</span>
                <p style={{ margin: '4px 0', fontSize: '10px', color: '#6b7280' }}>Min</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#dc2626' }}>
                  {Math.round(weather.main.temp_min || weather.main.temp)}°C
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '32px', marginBottom: '4px' }}>🌡️</span>
                <p style={{ margin: '4px 0', fontSize: '10px', color: '#6b7280' }}>Max</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#2563eb' }}>
                  {Math.round(weather.main.temp_max || weather.main.temp)}°C
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '32px', marginBottom: '4px' }}>💧</span>
                <p style={{ margin: '4px 0', fontSize: '10px', color: '#6b7280' }}>Rain</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#06b6d4' }}>
                  {weather.rain || 10}%
                </p>
              </div>
            </div>
          </div>

          {/* Tides Chart */}
          {tides && tides.enabled && tides.data && tides.data.extremes && tides.data.extremes.length > 0 && (() => {
            const extremes = tides.data.extremes;
            
            // Find next high and low tide
            const now = new Date();
            const nextHigh = extremes.find(t => new Date(t.dt) > now && t.type === 'High');
            const nextLow = extremes.find(t => new Date(t.dt) > now && t.type === 'Low');
            
            // Calculate chart dimensions
            const chartWidth = 288; // 320 - 32 (padding)
            const chartHeight = 120;
            const padding = { top: 20, right: 10, bottom: 30, left: 35 };
            const plotWidth = chartWidth - padding.left - padding.right;
            const plotHeight = chartHeight - padding.top - padding.bottom;
            
            // Get time range (first to last tide)
            const firstTime = new Date(extremes[0].dt).getTime();
            const lastTime = new Date(extremes[extremes.length - 1].dt).getTime();
            const timeRange = lastTime - firstTime;
            
            // Get height range
            const heights = extremes.map(t => t.height);
            const minHeight = Math.min(...heights);
            const maxHeight = Math.max(...heights);
            const heightRange = maxHeight - minHeight;
            
            // Convert tide data to chart coordinates
            const points = extremes.map(tide => {
              const time = new Date(tide.dt).getTime();
              const x = padding.left + ((time - firstTime) / timeRange) * plotWidth;
              const y = padding.top + plotHeight - ((tide.height - minHeight) / heightRange) * plotHeight;
              return { x, y, tide };
            });
            
            // Create smooth bezier curve path
            const createSmoothPath = (pts: Array<{ x: number; y: number; tide: any }>) => {
              if (pts.length < 2) return '';
              
              let path = `M ${pts[0].x} ${pts[0].y}`;
              
              for (let i = 0; i < pts.length - 1; i++) {
                const curr = pts[i];
                const next = pts[i + 1];
                const controlX = (curr.x + next.x) / 2;
                
                path += ` C ${controlX} ${curr.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
              }
              
              return path;
            };
            
            const linePath = createSmoothPath(points);
            
            // Create gradient fill area
            const areaPath = linePath + ` L ${points[points.length - 1].x} ${padding.top + plotHeight} L ${padding.left} ${padding.top + plotHeight} Z`;
            
            // Generate day labels
            const dayLabels: { x: number; label: string }[] = [];
            const daysSet = new Set<string>();
            
            extremes.forEach(tide => {
              const tideDate = new Date(tide.dt);
              const dateKey = tideDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
              
              if (!daysSet.has(dateKey)) {
                daysSet.add(dateKey);
                const time = tideDate.getTime();
                const x = padding.left + ((time - firstTime) / timeRange) * plotWidth;
                
                const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                
                dayLabels.push({
                  x,
                  label: dateKey === today ? 'Today' : dateKey === tomorrow ? 'Tomorrow' : dateKey
                });
              }
            });

            return (
              <div style={{ padding: '16px', background: 'linear-gradient(to bottom, #ecfeff, #ffffff)', borderTop: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '11px', fontWeight: '600', color: '#475569' }}>
                  🌊 Tides - {tides.location} <span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: '400' }}>(3-Day Forecast)</span>
                </h4>
                
                {/* Chart Container */}
                <div style={{ position: 'relative' }}>
                  {/* SVG Chart */}
                  <svg width={chartWidth} height={chartHeight} style={{ display: 'block' }}>
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="tideGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 0.3 }} />
                      <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 0.05 }} />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid lines */}
                  <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + plotHeight} stroke="#e5e7eb" strokeWidth="1" />
                  <line x1={padding.left} y1={padding.top + plotHeight} x2={chartWidth - padding.right} y2={padding.top + plotHeight} stroke="#e5e7eb" strokeWidth="1" />
                  
                  {/* Y-axis labels */}
                  <text x={padding.left - 8} y={padding.top} textAnchor="end" fontSize="9" fill="#6b7280" fontFamily="Poppins">
                    {maxHeight.toFixed(1)}m
                  </text>
                  <text x={padding.left - 8} y={padding.top + plotHeight / 2} textAnchor="end" fontSize="9" fill="#6b7280" fontFamily="Poppins">
                    0m
                  </text>
                  <text x={padding.left - 8} y={padding.top + plotHeight} textAnchor="end" fontSize="9" fill="#6b7280" fontFamily="Poppins">
                    {minHeight.toFixed(1)}m
                  </text>
                  
                  {/* Area fill */}
                  <path d={areaPath} fill="url(#tideGradient)" />
                  
                  {/* Line */}
                  <path d={linePath} fill="none" stroke="#0891b2" strokeWidth="2.5" strokeLinecap="round" />
                  
                  {/* Data points */}
                  {points.map((point, i) => {
                    const tideTime = new Date(point.tide.dt);
                    const timeStr = tideTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                    const dateStr = tideTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                    
                    return (
                      <g key={i}>
                        {/* Invisible larger circle for easier hover */}
                        <circle 
                          cx={point.x} 
                          cy={point.y} 
                          r="8" 
                          fill="transparent"
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={() => setHoveredTide({
                            x: point.x,
                            y: point.y,
                            time: `${dateStr} ${timeStr}`,
                            height: `${point.tide.height.toFixed(2)}m`,
                            type: point.tide.type
                          })}
                          onMouseLeave={() => setHoveredTide(null)}
                        />
                        {/* Visible point */}
                        <circle 
                          cx={point.x} 
                          cy={point.y} 
                          r="4" 
                          fill={point.tide.type === 'High' ? '#0891b2' : '#dc2626'} 
                          stroke="#ffffff" 
                          strokeWidth="2"
                          style={{ pointerEvents: 'none' }}
                        />
                      </g>
                    );
                  })}
                  
                  {/* X-axis day labels */}
                  {dayLabels.map((label, i) => (
                    <text 
                      key={i}
                      x={label.x} 
                      y={chartHeight - 8} 
                      textAnchor="middle" 
                      fontSize="9" 
                      fill="#374151" 
                      fontFamily="Poppins"
                      fontWeight="600"
                    >
                      {label.label}
                    </text>
                  ))}
                </svg>
                
                {/* Tooltip */}
                {hoveredTide && (
                  <div style={{
                    position: 'absolute',
                    left: `${hoveredTide.x - 40}px`,
                    top: `${hoveredTide.y - 60}px`,
                    background: '#ffffff',
                    border: `2px solid ${hoveredTide.type === 'High' ? '#0891b2' : '#dc2626'}`,
                    borderRadius: '6px',
                    padding: '6px 10px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    pointerEvents: 'none',
                    zIndex: 1000,
                    minWidth: '100px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px' }}>{hoveredTide.type === 'High' ? '⬆️' : '⬇️'}</span>
                      <p style={{ margin: 0, fontSize: '10px', fontWeight: '700', color: hoveredTide.type === 'High' ? '#0891b2' : '#dc2626' }}>
                        {hoveredTide.type} Tide
                      </p>
                    </div>
                    <p style={{ margin: 0, fontSize: '10px', color: '#374151', fontWeight: '600' }}>
                      {hoveredTide.time}
                    </p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', fontWeight: '700', color: '#0c4a6e' }}>
                      {hoveredTide.height}
                    </p>
                  </div>
                )}
                </div>
                
                {/* Next Tides Info */}
                <div style={{ 
                  marginTop: '12px', 
                  padding: '10px 12px', 
                  background: '#ffffff', 
                  borderRadius: '6px',
                  border: '1px solid #e0f2fe',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  {nextHigh && (
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '14px' }}>⬆️</span>
                        <p style={{ margin: 0, fontSize: '9px', color: '#6b7280' }}>Next High</p>
                      </div>
                      <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: '#0891b2' }}>
                        {new Date(nextHigh.dt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '10px', fontWeight: '600', color: '#0c4a6e' }}>
                        {nextHigh.height.toFixed(2)}m
                      </p>
                    </div>
                  )}
                  {nextLow && (
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', marginBottom: '2px' }}>
                        <p style={{ margin: 0, fontSize: '9px', color: '#6b7280' }}>Next Low</p>
                        <span style={{ fontSize: '14px' }}>⬇️</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: '#dc2626' }}>
                        {new Date(nextLow.dt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '10px', fontWeight: '600', color: '#0c4a6e' }}>
                        {nextLow.height.toFixed(2)}m
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Footer */}
          <div style={{ padding: '12px 24px', background: '#f3f4f6', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: '10px', color: '#6b7280' }}>
              Updated: {lastUpdate ? new Date(lastUpdate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
            </p>
            <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af' }}>
              {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

