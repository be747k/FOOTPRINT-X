import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import worldData from 'world-atlas/countries-110m.json';

interface GeoMapProps {
  latitude: number | null;
  longitude: number | null;
  city: string;
  country: string;
  ip: string;
}

export const GeoMap: React.FC<GeoMapProps> = ({
  latitude,
  longitude,
  city,
  country,
  ip,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    if (latitude === null || longitude === null) return;

    const width = containerRef.current.clientWidth || 700;
    const height = 360;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', height);

    // Convert TopoJSON to GeoJSON
    const countriesGeo: any = feature(worldData as any, (worldData as any).objects.countries);

    // Mercator projection centered on the target coordinate
    const projection = d3
      .geoMercator()
      .center([longitude, latitude])
      .scale(width / 2.5)
      .translate([width / 2, height / 2]);

    const pathGenerator = d3.geoPath().projection(projection);

    const g = svg.append('g').attr('class', 'map-content');

    // Background rectangle
    g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#ffffff');

    // Graticule (lat/long grid lines)
    const graticule = d3.geoGraticule();
    g.append('path')
      .datum(graticule)
      .attr('d', pathGenerator as any)
      .attr('fill', 'none')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '2,2');

    // Render countries
    g.selectAll('path.country')
      .data(countriesGeo.features)
      .enter()
      .append('path')
      .attr('class', 'country')
      .attr('d', pathGenerator as any)
      .attr('fill', '#f9fafb')
      .attr('stroke', '#000000')
      .attr('stroke-width', 0.75);

    // Target position coordinates in SVG pixels
    const coords = projection([longitude, latitude]);

    if (coords) {
      const [x, y] = coords;

      const markerGroup = g.append('g').attr('class', 'target-marker');

      // Crosshair horizontal and vertical lines
      markerGroup
        .append('line')
        .attr('x1', x - 24)
        .attr('y1', y)
        .attr('x2', x + 24)
        .attr('y2', y)
        .attr('stroke', '#000000')
        .attr('stroke-width', 1.5);

      markerGroup
        .append('line')
        .attr('x1', x)
        .attr('y1', y - 24)
        .attr('x2', x)
        .attr('y2', y + 24)
        .attr('stroke', '#000000')
        .attr('stroke-width', 1.5);

      // Outer circle
      markerGroup
        .append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 16)
        .attr('fill', 'none')
        .attr('stroke', '#000000')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '3,3');

      // Middle circle
      markerGroup
        .append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 8)
        .attr('fill', 'none')
        .attr('stroke', '#000000')
        .attr('stroke-width', 1.5);

      // Center point
      markerGroup
        .append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 3)
        .attr('fill', '#000000');

      // Coordinate tooltip badge box (minimalist black & white)
      const labelY = y - 30 < 20 ? y + 36 : y - 30;
      const labelText = `${city ? `${city}, ` : ''}${country} (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;

      const textElement = markerGroup
        .append('text')
        .attr('x', x)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .attr('fill', '#000000')
        .text(labelText);

      // Bounding box for label
      const bbox = (textElement.node() as SVGTextContentElement)?.getBBox();
      if (bbox) {
        markerGroup
          .insert('rect', 'text')
          .attr('x', bbox.x - 6)
          .attr('y', bbox.y - 3)
          .attr('width', bbox.width + 12)
          .attr('height', bbox.height + 6)
          .attr('fill', '#ffffff')
          .attr('stroke', '#000000')
          .attr('stroke-width', 1);
      }
    }

    // Zoom and Pan interaction with D3
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(Math.round(event.transform.k * 100) / 100);
      });

    svg.call(zoomBehavior as any);

    // Initial transform
    svg.call(zoomBehavior.transform as any, d3.zoomIdentity);
  }, [latitude, longitude, city, country]);

  const resetView = () => {
    if (!svgRef.current || latitude === null || longitude === null) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(400).call(
      d3.zoom<SVGSVGElement, unknown>().transform as any,
      d3.zoomIdentity
    );
  };

  if (latitude === null || longitude === null) {
    return (
      <div className="border border-black p-5 bg-white text-xs font-mono">
        <h2 className="text-xs font-bold uppercase tracking-wider font-mono border-b border-black pb-2 mb-4">
          Section 5: Target Geolocation Map (D3.js)
        </h2>
        <div className="p-8 text-center text-neutral-400">
          Geographic coordinates are unavailable for this target host.
        </div>
      </div>
    );
  }

  return (
    <div className="border border-black p-5 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black pb-2 mb-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider font-mono">
            Section 5: Target Geolocation Map (D3.js)
          </h2>
          <span className="text-[11px] font-mono text-neutral-500">
            Centered on {latitude.toFixed(4)}, {longitude.toFixed(4)} · {city}, {country}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-neutral-500">
            Zoom: {zoomLevel}x
          </span>
          <button
            type="button"
            onClick={resetView}
            className="px-2.5 py-1 text-[11px] font-mono border border-black hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            Reset Center
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div
        ref={containerRef}
        className="w-full border border-black bg-white overflow-hidden relative cursor-grab active:cursor-grabbing"
      >
        <svg ref={svgRef} className="w-full block" />
      </div>

      {/* Telemetry Bar */}
      <div className="mt-3 pt-2 border-t border-neutral-200 flex flex-wrap items-center justify-between text-[11px] font-mono text-neutral-500">
        <div>PROJECTION: MERCATOR (D3.GEO) · SOURCE: IP-API & NATURAL EARTH (110M)</div>
        <div>
          TARGET IP: <span className="font-semibold text-black">{ip}</span>
        </div>
      </div>
    </div>
  );
};
