import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Ride, RouteWaypoint } from '../types';

interface LeafletMapProps {
  originLat?: number;
  originLng?: number;
  originAddress?: string;
  destLat?: number;
  destLng?: number;
  destAddress?: string;
  currentLat?: number;
  currentLng?: number;
  waypoints?: RouteWaypoint[];
  rides?: Ride[];
  height?: string;
  className?: string;
  interactive?: boolean;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  originLat,
  originLng,
  originAddress,
  destLat,
  destLng,
  destAddress,
  currentLat,
  currentLng,
  waypoints,
  rides,
  height = '320px',
  className = '',
  interactive = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Default center: Pune / Central Maharashtra Corridor (India)
    const defaultLat = originLat || 18.5204;
    const defaultLng = originLng || 73.8567;
    const defaultZoom = rides && rides.length > 0 ? 8 : (originLat ? 12 : 9);

    // Destroy existing instance if re-rendering
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: false,
    }).setView([defaultLat, defaultLng], defaultZoom);

    // 100% English CartoDB Voyager tiles (renders clear English Latin place names across Maharashtra, India)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '© OpenStreetMap contributors © CARTO (English)',
    }).addTo(map);

    const bounds: L.LatLngExpression[] = [];

    // Custom SVG Origin Pin (Blue or Pink for Women-Only)
    const createOriginIcon = (isWomenOnly = false) =>
      L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
          <div style="background-color: ${isWomenOnly ? '#db2777' : '#3b82f6'}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 2.5px solid white;">
            <div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

    // Custom SVG Destination Pin (Violet/Purple)
    const destIcon = L.divIcon({
      className: 'custom-leaflet-pin',
      html: `
        <div style="background-color: #8b5cf6; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 2.5px solid white;">
          <div style="width: 7px; height: 7px; background-color: white; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });

    // Custom SVG Waypoint Pin (Amber)
    const waypointIcon = (num: number) =>
      L.divIcon({
        className: 'custom-leaflet-waypoint',
        html: `
          <div style="background-color: #f59e0b; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.25); border: 2px solid white; color: white; font-weight: bold; font-size: 10px;">
            ${num}
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

    // Custom SVG Current Position Pin (Green)
    const currentIcon = L.divIcon({
      className: 'custom-leaflet-pin',
      html: `
        <div style="background-color: #10b981; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.25); border: 2px solid white;">
          <div style="width: 10px; height: 10px; background-color: white; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Case 1: Multi-ride display (for Find Rides / Maharashtra corridor view)
    if (rides && rides.length > 0) {
      rides.forEach((r) => {
        if (r.originLat && r.originLng && r.destLat && r.destLng) {
          const originMarker = L.marker([r.originLat, r.originLng], {
            icon: createOriginIcon(r.isWomenOnly),
          }).addTo(map);

          originMarker.bindPopup(`
            <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 200px;">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: ${r.isWomenOnly ? '#db2777' : '#3b82f6'};">
                ${r.isWomenOnly ? '♀ Women-Only Commute' : 'Verified Journey'}
              </span>
              <p style="margin: 3px 0; font-weight: 700; color: #1e293b;">${r.originAddress}</p>
              <p style="margin: 0 0 6px 0; color: #64748b; font-size: 11px;">➜ To: ${r.destAddress}</p>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 4px; font-size: 11px;">
                <span style="font-weight: 700; color: #4338ca;">₹${r.pricePerSeat}</span>
                <span style="color: #64748b;">${r.availableSeats} seat(s) left</span>
              </div>
              <a href="/rides/${r.id}" style="display: block; margin-top: 6px; padding: 4px 8px; background: #4f46e5; color: white; border-radius: 6px; text-decoration: none; text-align: center; font-size: 11px; font-weight: 600;">
                View Journey Details
              </a>
            </div>
          `);

          const destMarker = L.marker([r.destLat, r.destLng], { icon: destIcon }).addTo(map);
          destMarker.bindPopup(`
            <div style="font-family: inherit; font-size: 12px;">
              <b>Drop-off:</b><br/>${r.destAddress}
            </div>
          `);

          const routeCoords: [number, number][] = [
            [r.originLat, r.originLng],
            ...(r.waypoints ? r.waypoints.map((w) => [w.lat, w.lng] as [number, number]) : []),
            [r.destLat, r.destLng],
          ];

          L.polyline(routeCoords, {
            color: r.isWomenOnly ? '#ec4899' : '#6366f1',
            weight: 3,
            opacity: 0.7,
            dashArray: '6, 6',
          }).addTo(map);

          bounds.push([r.originLat, r.originLng]);
          bounds.push([r.destLat, r.destLng]);
        }
      });
    } else {
      // Case 2: Single ride origin & destination display with detailed highway waypoints
      if (originLat !== undefined && originLng !== undefined) {
        const originMarker = L.marker([originLat, originLng], {
          icon: createOriginIcon(false),
        }).addTo(map);
        if (originAddress) {
          originMarker.bindPopup(`<b>Pickup Location (Maharashtra):</b><br/>${originAddress}`);
        }
        bounds.push([originLat, originLng]);
      }

      // Add waypoints along Maharashtra highway
      if (waypoints && waypoints.length > 0) {
        waypoints.forEach((wp, idx) => {
          const wpMarker = L.marker([wp.lat, wp.lng], {
            icon: waypointIcon(idx + 1),
          }).addTo(map);
          wpMarker.bindPopup(`<b>Checkpoint ${idx + 1}:</b><br/>${wp.name}`);
          bounds.push([wp.lat, wp.lng]);
        });
      }

      if (destLat !== undefined && destLng !== undefined) {
        const destMarker = L.marker([destLat, destLng], { icon: destIcon }).addTo(map);
        if (destAddress) {
          destMarker.bindPopup(`<b>Drop-off Destination (Maharashtra):</b><br/>${destAddress}`);
        }
        bounds.push([destLat, destLng]);
      }

      if (currentLat !== undefined && currentLng !== undefined) {
        const currentMarker = L.marker([currentLat, currentLng], { icon: currentIcon }).addTo(map);
        currentMarker.bindPopup('<b>Vehicle Live Position (Maharashtra)</b>');
        bounds.push([currentLat, currentLng]);
      }

      if (
        originLat !== undefined &&
        originLng !== undefined &&
        destLat !== undefined &&
        destLng !== undefined
      ) {
        const routePoints: [number, number][] = [
          [originLat, originLng],
          ...(waypoints ? waypoints.map((w) => [w.lat, w.lng] as [number, number]) : []),
          [destLat, destLng],
        ];

        L.polyline(routePoints, {
          color: '#4f46e5',
          weight: 4.5,
          opacity: 0.9,
          lineJoin: 'round',
        }).addTo(map);
      }
    }

    // Fit bounds if points exist
    if (bounds.length > 1) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [35, 35] });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [
    originLat,
    originLng,
    destLat,
    destLng,
    currentLat,
    currentLng,
    waypoints,
    rides,
    interactive,
    originAddress,
    destAddress,
  ]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: '100%' }}
      className={`relative rounded-xl overflow-hidden shadow-inner border border-slate-200 z-10 ${className}`}
    />
  );
};
