import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { AlertTriangle, LocateFixed, MapPinned, RefreshCw, Shield } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { adminService } from '../services/admin.service';

const defaultCenter = [20, 0];

function FitMarkers({ locations }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      map.fitBounds(locations.map((location) => [location.lat, location.lon]), { padding: [40, 40], maxZoom: 5 });
    }
  }, [locations, map]);

  return null;
}

function LiveLocationMarker({ location }) {
  const map = useMap();
  const hasCentered = useRef(false);

  useEffect(() => {
    if (location && !hasCentered.current) {
      map.setView([location.lat, location.lon], 13);
      hasCentered.current = true;
    }
  }, [location, map]);

  if (!location) return null;

  return (
    <CircleMarker center={[location.lat, location.lon]} radius={9} pathOptions={{ color: '#22d3ee', fillColor: '#22d3ee', fillOpacity: 0.9 }}>
      <Popup>
        <strong>YOUR LIVE LOCATION</strong><br />
        Accuracy: approximately {Math.round(location.accuracy)}m
      </Popup>
    </CircleMarker>
  );
}

function FocusIncident({ location }) {
  const map = useMap();

  useEffect(() => {
    if (location) map.setView([location.lat, location.lon], Math.max(map.getZoom(), 8));
  }, [location, map]);

  return null;
}

const isPrivateIp = (ip) => {
  if (!ip) return true;
  return ip === '::1' || ip === '127.0.0.1' || ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.');
};

export default function IncidentMap() {
  const [events, setEvents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [newIncidentCount, setNewIncidentCount] = useState(0);
  const [liveLocation, setLiveLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('Location sharing is off');
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const eventsRef = useRef([]);
  const locationWatchRef = useRef(null);

  const startLiveLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by this browser');
      return;
    }

    setLocationStatus('Requesting browser location permission...');
    if (locationWatchRef.current !== null) {
      navigator.geolocation.clearWatch(locationWatchRef.current);
    }

    locationWatchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setLiveLocation({ lat: position.coords.latitude, lon: position.coords.longitude, accuracy: position.coords.accuracy });
        setLocationStatus('Live location sharing enabled');
      },
      () => setLocationStatus('Location permission was denied or unavailable'),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

  };

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await adminService.getSecurityEvents({ limit: 50 });
      const nextEvents = response.data?.events || [];
      const previousEvents = eventsRef.current;
      const previousEventIds = new Set(previousEvents.map((event) => event._id));
      const incomingCount = previousEvents.length > 0
        ? nextEvents.filter((event) => !previousEventIds.has(event._id)).length
        : 0;
      eventsRef.current = nextEvents;
      setEvents(nextEvents);
      if (incomingCount > 0) setNewIncidentCount((count) => count + incomingCount);

      const publicIps = [...new Set(nextEvents.map((event) => event.sourceIp).filter((ip) => !isPrivateIp(ip)))];
      const resolved = await Promise.all(publicIps.map(async (ip) => {
        try {
          const locationResponse = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`);
          const location = await locationResponse.json();
          if (!location.latitude || !location.longitude) return null;
          return { ip, lat: location.latitude, lon: location.longitude, city: location.city, country: location.country_name };
        } catch {
          return null;
        }
      }));

      setLocations(resolved.filter(Boolean));
      setUpdatedAt(new Date());
    } catch (error) {
      console.error('[Incident map fetch error]', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    startLiveLocation();
    return () => {
      if (locationWatchRef.current !== null) {
        navigator.geolocation.clearWatch(locationWatchRef.current);
      }
    };
  }, []);

  const privateEvents = events.filter((event) => isPrivateIp(event.sourceIp));
  const selectedIncident = events.find((event) => event._id === selectedIncidentId);
  const selectedLocation = locations.find((location) => location.ip === selectedIncident?.sourceIp);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-mono text-gray-100 flex items-center gap-2">
            <MapPinned className="w-5 h-5 text-cyan-400" />
            INCIDENT SOURCE MAP
          </h1>
            <p className="text-xs text-gray-400 mt-1">Geographic view of recent gateway security incidents</p>
          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE INCIDENT STREAM
            {newIncidentCount > 0 && (
              <button
                onClick={() => setNewIncidentCount(0)}
                className="text-red-300 bg-red-500/10 border border-red-500/30 rounded px-1.5 py-0.5"
              >
                {newIncidentCount} NEW INCIDENT{newIncidentCount === 1 ? '' : 'S'}
              </button>
            )}
            {updatedAt && <span className="text-gray-500">UPDATED {updatedAt.toLocaleTimeString()}</span>}
          </div>
        </div>
        <button
          onClick={loadEvents}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#111827] border border-[#1F2937] hover:border-gray-700 text-xs font-mono text-cyan-400 rounded-lg"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          REFRESH MAP
        </button>
        <button
          onClick={startLiveLocation}
          className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400 text-xs font-mono text-cyan-300 rounded-lg"
        >
          <LocateFixed className="w-3.5 h-3.5" />
          TRACK MY LIVE LOCATION
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 h-[520px] bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-lg">
          <MapContainer center={defaultCenter} zoom={2} scrollWheelZoom className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitMarkers locations={locations} />
            <FocusIncident location={selectedLocation} />
            <LiveLocationMarker location={liveLocation} />
            {locations.map((location) => {
              const locationEvents = events.filter((event) => event.sourceIp === location.ip);
              return (
                <CircleMarker
                  key={location.ip}
                  center={[location.lat, location.lon]}
                  radius={selectedLocation?.ip === location.ip ? 14 : 10}
                  pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.75 }}
                >
                  <Popup>
                    <strong>{location.ip}</strong><br />
                    {location.city || 'Unknown city'}, {location.country || 'Unknown country'}<br />
                    <a href={`https://ipinfo.io/${encodeURIComponent(location.ip)}`} target="_blank" rel="noreferrer">View IP details</a><br />
                    {locationEvents.length} incident{locationEvents.length === 1 ? '' : 's'}
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-mono font-bold text-gray-200">
            <Shield className="w-4 h-4 text-red-400" />
            SOURCE SUMMARY
          </div>
          <div className="text-xs font-mono space-y-3">
            <div className="flex justify-between text-gray-400"><span>Total incidents</span><strong className="text-red-400">{events.length}</strong></div>
            <div className="flex justify-between text-gray-400"><span>Mapped public IPs</span><strong className="text-cyan-400">{locations.length}</strong></div>
            <div className="flex justify-between text-gray-400"><span>Private/local sources</span><strong className="text-amber-400">{privateEvents.length}</strong></div>
          </div>
          <div className="border-t border-[#1F2937] pt-3 text-[11px] font-mono text-cyan-300">
            <div className="flex items-center gap-2"><LocateFixed className="w-3.5 h-3.5" />{locationStatus}</div>
            {liveLocation && <div className="text-gray-500 mt-1">{liveLocation.lat.toFixed(5)}, {liveLocation.lon.toFixed(5)}</div>}
          </div>
          <div className="border-t border-[#1F2937] pt-3 text-[11px] text-gray-500 leading-relaxed">
            Admin security access includes source IP, endpoint, event type, severity, and incident metadata. Localhost and private network addresses cannot be geolocated.
          </div>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5">
        <h2 className="text-sm font-bold font-mono text-gray-200 flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          RECENT MAPPED INCIDENTS
        </h2>
        <div className="space-y-2 text-xs font-mono">
          {events.slice(0, 8).map((event) => (
            <button
              type="button"
              key={event._id}
              onClick={() => setSelectedIncidentId(event._id)}
              className={`w-full flex flex-wrap items-center justify-between gap-2 border-b border-[#1F2937] py-2 last:border-0 text-left hover:bg-cyan-500/10 ${selectedIncidentId === event._id ? 'bg-cyan-500/10 ring-1 ring-cyan-500/40' : ''} ${newIncidentCount > 0 ? 'bg-red-500/5' : ''}`}
            >
              <span className="text-red-400">{event.eventType}</span>
              <span className="text-cyan-400">{event.sourceIp}</span>
              <span className="text-gray-500">{new Date(event.timestamp).toLocaleString()}</span>
            </button>
          ))}
          {events.length === 0 && <div className="text-gray-500">No incidents recorded.</div>}
        </div>
        {selectedIncident && !selectedLocation && (
          <div className="mt-3 text-xs font-mono text-amber-400">
            {selectedIncident.sourceIp} is a local/private source and cannot be placed on a geographic map. Full incident details remain available to Admin.
          </div>
        )}
        {selectedIncident && (
          <pre className="mt-3 overflow-x-auto rounded-lg border border-[#1F2937] bg-[#0B0F19] p-3 text-[10px] text-gray-400">
            {JSON.stringify(selectedIncident, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
