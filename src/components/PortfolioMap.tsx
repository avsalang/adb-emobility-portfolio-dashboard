import maplibregl, { type GeoJSONSource, LngLatBounds } from 'maplibre-gl';
import { useEffect, useMemo, useRef } from 'react';
import { financeExplorerMapStyle } from '../map/financeExplorerMapStyle';
import {
  LOCATION_PRECISION_LABELS,
  type ProjectMapLocation,
} from '../map/projectLocations';

function normalizeAsiaPacificLng(lng: number) {
  return lng < -25 ? lng + 360 : lng;
}

function hideBoundaryLayers(map: maplibregl.Map) {
  map.getStyle().layers?.forEach((layer) => {
    const id = layer.id.toLowerCase();
    const sourceLayer =
      (layer as { ['source-layer']?: string })['source-layer']?.toLowerCase() ??
      '';
    if (
      id.includes('boundary') ||
      id.includes('admin') ||
      id.includes('border') ||
      sourceLayer.includes('boundary')
    ) {
      if (map.getLayer(layer.id)) {
        map.setLayoutProperty(layer.id, 'visibility', 'none');
      }
    }
  });
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function projectPopupHtml(properties: Record<string, unknown>) {
  const funding = Number(properties.funding);
  const fundingLabel = funding.toLocaleString(undefined, {
    maximumFractionDigits: 1,
  });
  const precision =
    LOCATION_PRECISION_LABELS[
      String(properties.precision) as keyof typeof LOCATION_PRECISION_LABELS
    ] ?? 'Reported project location';
  return [
    '<div class="map-popup project-location-popup">',
    `<small>${escapeHtml(properties.projectNumber)} · ${escapeHtml(
      properties.approvalYear,
    )}</small>`,
    `<strong>${escapeHtml(properties.projectTitle)}</strong>`,
    `<span>${escapeHtml(properties.locationName)}</span>`,
    `<small>${escapeHtml(precision)} · $${fundingLabel}M project envelope</small>`,
    '</div>',
  ].join('');
}

function clusterPopupHtml(count: number) {
  return [
    '<div class="map-popup project-location-popup">',
    `<strong>${count.toLocaleString()} project location${
      count === 1 ? '' : 's'
    }</strong>`,
    '<span>Click to zoom or view projects</span>',
    '</div>',
  ].join('');
}

function clusterProjectListHtml(properties: Record<string, unknown>[]) {
  const projects = new Map<string, Record<string, unknown>>();
  properties.forEach((row) => {
    const projectNumber = String(row.projectNumber ?? '');
    if (projectNumber && !projects.has(projectNumber)) {
      projects.set(projectNumber, row);
    }
  });
  const rows = [...projects.values()].sort(
    (a, b) =>
      Number(b.approvalYear) - Number(a.approvalYear) ||
      String(a.projectTitle).localeCompare(String(b.projectTitle)),
  );
  const locationNames = new Set(
    properties.map((row) => String(row.locationName ?? '')).filter(Boolean),
  );
  const locationSummary =
    locationNames.size === 1
      ? [...locationNames][0]
      : `${locationNames.size} nearby mapped locations`;

  return [
    '<div class="map-popup cluster-project-popup">',
    `<small>${escapeHtml(locationSummary)}</small>`,
    `<strong>${rows.length} project${rows.length === 1 ? '' : 's'}</strong>`,
    '<div class="cluster-project-list">',
    ...rows.map((row) => {
      const precision =
        LOCATION_PRECISION_LABELS[
          String(row.precision) as keyof typeof LOCATION_PRECISION_LABELS
        ] ?? 'Reported project location';
      return [
        `<button type="button" data-project-number="${escapeHtml(
          row.projectNumber,
        )}">`,
        `<b>${escapeHtml(row.projectNumber)}</b>`,
        `<span>${escapeHtml(row.projectTitle)}</span>`,
        `<small>${
          locationNames.size === 1
            ? escapeHtml(precision)
            : `${escapeHtml(row.locationName)} · ${escapeHtml(precision)}`
        }</small>`,
        '</button>',
      ].join('');
    }),
    '</div>',
    '</div>',
  ].join('');
}

export function PortfolioMap({
  locations,
  onSelectProject,
}: {
  locations: ProjectMapLocation[];
  onSelectProject: (projectNumber: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const detailPopupRef = useRef<maplibregl.Popup | null>(null);
  const onSelectProjectRef = useRef(onSelectProject);

  const features = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: locations.map((location) => ({
        type: 'Feature' as const,
        id: location.id,
        geometry: {
          type: 'Point' as const,
          coordinates: [
            normalizeAsiaPacificLng(location.coordinates[0]),
            location.coordinates[1],
          ],
        },
        properties: {
          projectNumber: location.projectNumber,
          projectTitle: location.projectTitle,
          projectUrl: location.projectUrl,
          approvalYear: location.approvalYear,
          recipient: location.recipient,
          funding: location.funding,
          reportedLocation: location.reportedLocation,
          locationName: location.locationName,
          precision: location.precision,
        },
      })),
    }),
    [locations],
  );

  useEffect(() => {
    onSelectProjectRef.current = onSelectProject;
  }, [onSelectProject]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: JSON.parse(JSON.stringify(financeExplorerMapStyle)),
      center: [115, 13],
      zoom: 2.15,
      maxZoom: 9,
      attributionControl: {},
    });
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      'top-right',
    );
    mapRef.current = map;
    popupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 14,
      maxWidth: '320px',
    });
    map.on('load', () => {
      hideBoundaryLayers(map);
      map.addSource('project-locations', {
        type: 'geojson',
        data: features,
        cluster: true,
        clusterMaxZoom: 9,
        clusterRadius: 34,
      });
      map.addLayer({
        id: 'project-location-cluster-glow',
        type: 'circle',
        source: 'project-locations',
        filter: ['has', 'point_count'],
        paint: {
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            16,
            10,
            21,
            30,
            27,
          ],
          'circle-color': '#0d5670',
          'circle-opacity': 0.16,
          'circle-blur': 0.5,
        },
      });
      map.addLayer({
        id: 'project-location-clusters',
        type: 'circle',
        source: 'project-locations',
        filter: ['has', 'point_count'],
        paint: {
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            10,
            10,
            14,
            30,
            18,
          ],
          'circle-color': '#0d5670',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 1.5,
          'circle-opacity': 0.94,
        },
      });
      map.addLayer({
        id: 'project-location-cluster-count',
        type: 'symbol',
        source: 'project-locations',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['Noto Sans Regular'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#ffffff',
        },
      });
      map.addLayer({
        id: 'project-location-points',
        type: 'circle',
        source: 'project-locations',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'circle-sort-key': [
            'match',
            ['get', 'precision'],
            'site',
            4,
            'city',
            3,
            'subnational',
            2,
            1,
          ],
        },
        paint: {
          'circle-radius': 6.5,
          'circle-color': '#178f8f',
          'circle-opacity': 0.94,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 1.5,
        },
      });

      if (features.features.length) {
        const bounds = new LngLatBounds();
        features.features.forEach((feature) => {
          bounds.extend(feature.geometry.coordinates as [number, number]);
        });
        map.fitBounds(bounds, { padding: 38, maxZoom: 5.5, duration: 600 });
      }

      map.on('mouseenter', 'project-location-points', (event) => {
        map.getCanvas().style.cursor = 'pointer';
        const feature = event.features?.[0];
        if (!feature) return;
        popupRef.current
          ?.setLngLat(
            (feature.geometry as { coordinates: [number, number] }).coordinates,
          )
          .setHTML(
            projectPopupHtml(
              (feature.properties ?? {}) as Record<string, unknown>,
            ),
          )
          .addTo(map);
      });
      map.on('mouseleave', 'project-location-points', () => {
        map.getCanvas().style.cursor = '';
        popupRef.current?.remove();
      });
      map.on('click', 'project-location-points', (event) => {
        const projectNumber =
          event.features?.[0]?.properties?.projectNumber;
        if (projectNumber) {
          onSelectProjectRef.current(String(projectNumber));
        }
      });

      map.on('mouseenter', 'project-location-clusters', (event) => {
        map.getCanvas().style.cursor = 'pointer';
        const feature = event.features?.[0];
        if (!feature) return;
        const pointCount = Number(feature.properties?.point_count ?? 0);
        popupRef.current
          ?.setLngLat(
            (feature.geometry as { coordinates: [number, number] }).coordinates,
          )
          .setHTML(clusterPopupHtml(pointCount))
          .addTo(map);
      });
      map.on('mouseleave', 'project-location-clusters', () => {
        map.getCanvas().style.cursor = '';
        popupRef.current?.remove();
      });
      map.on('click', 'project-location-clusters', async (event) => {
        const feature = event.features?.[0];
        const clusterId = Number(feature?.properties?.cluster_id);
        const pointCount = Number(feature?.properties?.point_count ?? 0);
        const source = map.getSource('project-locations') as GeoJSONSource;
        if (!feature || !Number.isFinite(clusterId) || !source) return;
        const expansionZoom = await source.getClusterExpansionZoom(clusterId);
        const coordinates = (
          feature.geometry as { coordinates: [number, number] }
        ).coordinates;
        const terminalCluster =
          expansionZoom > map.getMaxZoom() ||
          map.getZoom() >= map.getMaxZoom() - 0.2;
        if (!terminalCluster) {
          detailPopupRef.current?.remove();
          map.easeTo({
            center: coordinates,
            zoom: expansionZoom,
            duration: 500,
          });
          return;
        }

        const leaves = await source.getClusterLeaves(
          clusterId,
          Math.max(pointCount, 1),
          0,
        );
        const leafProperties = leaves.map(
          (leaf) => (leaf.properties ?? {}) as Record<string, unknown>,
        );
        const compact = map.getContainer().clientWidth <= 480;
        popupRef.current?.remove();
        detailPopupRef.current?.remove();
        detailPopupRef.current = new maplibregl.Popup({
          anchor: compact ? 'bottom-right' : 'bottom',
          closeButton: true,
          closeOnClick: false,
          offset: 14,
          maxWidth: compact ? '270px' : '380px',
        });
        map.easeTo({
          center: coordinates,
          zoom: map.getZoom(),
          offset: [
            compact ? map.getContainer().clientWidth * 0.28 : 0,
            map.getContainer().clientHeight * 0.32,
          ],
          duration: 250,
        });
        detailPopupRef.current
          ?.setLngLat(coordinates)
          .setHTML(clusterProjectListHtml(leafProperties))
          .addTo(map);
        detailPopupRef.current
          ?.getElement()
          .querySelectorAll<HTMLButtonElement>('[data-project-number]')
          .forEach((button) => {
            button.addEventListener('click', () => {
              const projectNumber = button.dataset.projectNumber;
              if (!projectNumber) return;
              detailPopupRef.current?.remove();
              onSelectProjectRef.current(projectNumber);
            });
          });
      });
    });

    return () => {
      popupRef.current?.remove();
      detailPopupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const source = map?.getSource('project-locations') as
      | GeoJSONSource
      | undefined;
    source?.setData(features);
    detailPopupRef.current?.remove();
    if (!map || !source || !features.features.length) return;

    const bounds = new LngLatBounds();
    features.features.forEach((feature) => {
      bounds.extend(feature.geometry.coordinates as [number, number]);
    });
    map.fitBounds(bounds, { padding: 38, maxZoom: 5.5, duration: 600 });
  }, [features]);

  return (
    <div
      ref={containerRef}
      className="portfolio-map"
      role="region"
      aria-label="Interactive map of reported project activity locations"
    />
  );
}
