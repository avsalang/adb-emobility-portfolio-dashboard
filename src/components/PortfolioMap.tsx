import maplibregl, { type GeoJSONSource } from 'maplibre-gl';
import { useEffect, useMemo, useRef } from 'react';

const COUNTRY_COORDINATES: Record<string, [number, number]> = {
  Armenia: [44.5, 40.1],
  Azerbaijan: [47.6, 40.1],
  Bangladesh: [90.4, 23.7],
  Bhutan: [90.4, 27.5],
  Cambodia: [104.9, 12.6],
  "China, People's Republic of": [104.2, 35.9],
  Fiji: [178.1, -17.8],
  Georgia: [43.4, 42.3],
  India: [78.9, 22.8],
  Indonesia: [117.5, -2.2],
  Kazakhstan: [67.0, 48.0],
  Kiribati: [-157.4, 1.9],
  'Kyrgyz Republic': [74.6, 41.2],
  "Lao People's Democratic Republic": [102.6, 19.9],
  Malaysia: [102.0, 4.2],
  Maldives: [73.2, 3.2],
  Mongolia: [103.8, 46.9],
  Myanmar: [96.0, 21.9],
  Nepal: [84.1, 28.4],
  Pakistan: [69.3, 30.4],
  Palau: [134.6, 7.5],
  'Papua New Guinea': [145.0, -6.3],
  Philippines: [122.5, 12.7],
  'Sri Lanka': [80.7, 7.9],
  Tajikistan: [71.0, 38.9],
  Thailand: [101.0, 15.9],
  'Timor-Leste': [125.7, -8.9],
  Tonga: [-175.2, -21.2],
  Türkiye: [35.2, 39.0],
  Uzbekistan: [64.6, 41.4],
  'Viet Nam': [108.3, 15.9],
};

const ATO_MAP_STYLE = `${import.meta.env.BASE_URL}map-style.json`;

export interface MapCountry {
  name: string;
  funding: number;
  projects: number;
}

export function PortfolioMap({
  countries,
  onSelect,
}: {
  countries: MapCountry[];
  onSelect: (country: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const onSelectRef = useRef(onSelect);

  const features = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: countries
        .filter((country) => COUNTRY_COORDINATES[country.name])
        .map((country) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: COUNTRY_COORDINATES[country.name],
          },
          properties: {
            name: country.name,
            funding: country.funding,
            projects: country.projects,
          },
        })),
    }),
    [countries],
  );

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: ATO_MAP_STYLE,
      center: [101, 20],
      zoom: 2.25,
      minZoom: 1.25,
      attributionControl: false,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;
    popupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 14,
      maxWidth: '260px',
    });

    map.on('load', () => {
      map.addSource('recipient-funding', {
        type: 'geojson',
        data: features,
      });
      map.addLayer({
        id: 'recipient-glow',
        type: 'circle',
        source: 'recipient-funding',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['sqrt', ['get', 'funding']],
            0,
            7,
            50,
            12,
          ],
          'circle-color': '#178f8f',
          'circle-opacity': 0.16,
          'circle-blur': 0.5,
        },
      });
      map.addLayer({
        id: 'recipient-points',
        type: 'circle',
        source: 'recipient-funding',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['sqrt', ['get', 'funding']],
            0,
            4,
            50,
            9,
          ],
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'funding'],
            0,
            '#76c7c0',
            250,
            '#178f8f',
            1000,
            '#0d5670',
          ],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 1.5,
          'circle-opacity': 0.92,
        },
      });

      map.on('mouseenter', 'recipient-points', (event) => {
        map.getCanvas().style.cursor = 'pointer';
        const feature = event.features?.[0];
        if (!feature) return;
        const { name, funding, projects } = feature.properties ?? {};
        popupRef.current
          ?.setLngLat((feature.geometry as { coordinates: [number, number] }).coordinates)
          .setHTML(
            `<div class="map-popup"><strong>${name}</strong><span>$${Number(funding).toLocaleString(undefined, { maximumFractionDigits: 1 })}M associated funding</span><small>${projects} project${projects === 1 ? '' : 's'}</small></div>`,
          )
          .addTo(map);
      });
      map.on('mouseleave', 'recipient-points', () => {
        map.getCanvas().style.cursor = '';
        popupRef.current?.remove();
      });
      map.on('click', 'recipient-points', (event) => {
        const name = event.features?.[0]?.properties?.name;
        if (name) onSelectRef.current(String(name));
      });
    });

    return () => {
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const source = mapRef.current?.getSource('recipient-funding') as
      | GeoJSONSource
      | undefined;
    source?.setData(features);
  }, [features]);

  return (
    <div className="portfolio-map-shell">
      <div
        ref={containerRef}
        className="portfolio-map"
        role="region"
        aria-label="Interactive map of recipient countries, associated funding, and project counts"
      />
      <div className="portfolio-map-attribution">
        <a href="https://openfreemap.org/" target="_blank" rel="noreferrer">OpenFreeMap</a>
        <span>·</span>
        <a href="https://openmaptiles.org/" target="_blank" rel="noreferrer">OpenMapTiles</a>
        <span>·</span>
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>
      </div>
    </div>
  );
}
