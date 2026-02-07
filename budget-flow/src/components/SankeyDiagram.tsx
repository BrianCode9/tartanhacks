"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal, sankeyCenter, SankeyNode, SankeyLink } from "d3-sankey";

interface SankeyNodeExtra {
  name: string;
  color?: string;
}

interface SankeyData {
  nodes: SankeyNodeExtra[];
  links: { source: number; target: number; value: number }[];
}

// Fallback color scheme (used when nodes don't provide explicit colors).
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

function getNodeColor(node: SankeyNodeExtra): string {
  return node.color || colorScale(node.name);
}

export default function SankeyDiagram({ data }: { data: SankeyData }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1400, height: 600 });
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    content: string;
  }>({ show: false, x: 0, y: 0, content: "" });

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: Math.max(500, entry.contentRect.height),
        });
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;
    const margin = { top: 20, right: 30, bottom: 20, left: 30 };
    const nodePadding = 10;

    const sankeyGenerator = sankey<SankeyNodeExtra, object>()
      .nodeId((d: SankeyNode<SankeyNodeExtra, object>) => d.index as number)
      .nodeAlign(sankeyCenter)
      .nodeWidth(36)
      .nodePadding(nodePadding)
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ]);

    // Generate layout
    const sankeyData = sankeyGenerator({
      nodes: data.nodes.map((d) => ({ ...d })),
      links: data.links.map((d) => ({ ...d })),
    });

    // --- Manual Centering of Layers ---
    const columns = new Map<number, any[]>();
    sankeyData.nodes.forEach((node: any) => {
      const x = Math.round(node.x0 ?? 0);
      if (!columns.has(x)) columns.set(x, []);
      columns.get(x)?.push(node);
    });

    columns.forEach((nodesInCol) => {
      if (!nodesInCol.length) return;

      let minY = Infinity;
      let maxY = -Infinity;
      nodesInCol.forEach(n => {
        minY = Math.min(minY, n.y0);
        maxY = Math.max(maxY, n.y1);
      });

      const contentHeight = maxY - minY;
      const availableHeight = height - margin.top - margin.bottom;
      const targetY = margin.top + (availableHeight - contentHeight) / 2;
      const dy = targetY - minY;

      if (Math.abs(dy) > 1) {
        nodesInCol.forEach(n => {
          n.y0 += dy;
          n.y1 += dy;
        });

        // Adjust ONLY links connected to these specific nodes
        sankeyData.links.forEach((link: any) => {
          if (nodesInCol.includes(link.source)) {
            link.y0 += dy;
          }
          if (nodesInCol.includes(link.target)) {
            link.y1 += dy;
          }
        });
      }
    });

    const textColor = getComputedStyle(document.documentElement).getPropertyValue("--text-primary").trim() || "#f0f0f5";

    const linkPath = sankeyLinkHorizontal<SankeyNodeExtra, object>();

    const links = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke-opacity", 0.3)
      .selectAll("path")
      .data(sankeyData.links)
      .join("path")
      .attr("d", linkPath)
      .attr(
        "stroke",
        (d: SankeyLink<SankeyNodeExtra, object>) => {
          const sourceNode = d.source as SankeyNode<SankeyNodeExtra, object>;
          return getNodeColor(sourceNode as unknown as SankeyNodeExtra);
        }
      )
      .attr("stroke-width", (d: SankeyLink<SankeyNodeExtra, object>) =>
        Math.max(1, d.width || 0)
      )
      .style("cursor", "pointer")
      .on("mouseenter", function (
        event: MouseEvent,
        d: SankeyLink<SankeyNodeExtra, object>
      ) {
        d3.select(this).attr("stroke-opacity", 0.6);
        const sourceNode = d.source as SankeyNode<SankeyNodeExtra, object>;
        const targetNode = d.target as SankeyNode<SankeyNodeExtra, object>;
        setTooltip({
          show: true,
          x: event.offsetX,
          y: event.offsetY,
          content: `${sourceNode.name} → ${targetNode.name}: $${(d.value || 0).toLocaleString()}`,
        });
      })
      .on("mouseleave", function () {
        d3.select(this).attr("stroke-opacity", 0.3);
        setTooltip((t) => ({ ...t, show: false }));
      });

    const node = svg
      .append("g")
      .selectAll<SVGGElement, SankeyNode<SankeyNodeExtra, object>>("g")
      .data(sankeyData.nodes)
      .join("g")
      .style("cursor", "grab")
      .call(
        d3
          .drag<SVGGElement, SankeyNode<SankeyNodeExtra, object>>()
          .subject((event, d) => d)
          .on("start", function (event, d) {
            d3.select(this).raise().style("cursor", "grabbing");

            // Capture Relative Offsets for ALL links
            // This ensures we know exactly where each link should attach to its node
            sankeyData.links.forEach((link: any) => {
              link._sourceOffsetY = link.y0 - link.source.y0;
              link._targetOffsetY = link.y1 - link.target.y0;
            });
          })
          .on("drag", function (event, d) {
            // 1. Determine requested position (for sorting)
            // UNCLAMPED event.y allows sorting outside bounds (easy swap to top/bottom)
            const requestedY = event.y;

            // 2. Identify relevant column
            const columnNodes = sankeyData.nodes.filter((n: any) => Math.abs(n.x0 - (d.x0 ?? 0)) < 1);

            // 3. Sort based on requestedY
            columnNodes.sort((a: any, b: any) => {
              const aY = (a === d) ? requestedY : (a.y0 ?? 0);
              const bY = (b === d) ? requestedY : (b.y0 ?? 0);
              return aY - bY;
            });

            // 4. Calculate total height for centering
            let totalHeight = 0;
            columnNodes.forEach((n: any) => {
              totalHeight += (n.y1 - n.y0) + nodePadding;
            });
            totalHeight -= nodePadding;

            // 5. Determine starting Y for the column
            let startY = margin.top + (height - margin.top - margin.bottom - totalHeight) / 2;

            // 6. Apply strict stacking
            columnNodes.forEach((n: any) => {
              const h = (n.y1 - n.y0);
              n.y0 = startY;
              n.y1 = startY + h;

              // IMPORTANT: Since we moved n.y0, we MUST update all links attached to n
              // We do this globally below using the captured offsets

              startY += h + nodePadding;
            });

            // 7. Update DOM for Nodes
            node
              .filter((n: any) => Math.abs(n.x0 - (d.x0 ?? 0)) < 1)
              .select("rect")
              .attr("y", (n: any) => n.y0);

            node
              .filter((n: any) => Math.abs(n.x0 - (d.x0 ?? 0)) < 1)
              .select("text")
              .attr("y", (n: any) => (n.y0 + n.y1) / 2);

            // 8. Update Links based on new Node positions
            // We use the stored offsets to ensure rigid attachment
            sankeyData.links.forEach((link: any) => {
              if (link._sourceOffsetY !== undefined) {
                link.y0 = link.source.y0 + link._sourceOffsetY;
              }
              if (link._targetOffsetY !== undefined) {
                link.y1 = link.target.y0 + link._targetOffsetY;
              }
            });

            links.attr("d", linkPath);
          })
      );

    node
      .append("rect")
      .attr("x", (d) => d.x0 ?? 0)
      .attr("y", (d) => d.y0 ?? 0)
      .attr("width", (d) => (d.x1 ?? 0) - (d.x0 ?? 0))
      .attr("height", (d) => Math.max(1, (d.y1 ?? 0) - (d.y0 ?? 0)))
      .attr("fill", (d) => getNodeColor(d as unknown as SankeyNodeExtra))
      .attr("rx", 4)
      .attr("opacity", 0.9)
      .append("title")
      .text((d) => `${d.name}\n$${d.value?.toLocaleString()}`);

    node
      .append("text")
      .attr("x", (d) => {
        const x0 = d.x0 ?? 0;
        const x1 = d.x1 ?? 0;
        return x0 < width / 2 ? x1 + 8 : x0 - 8;
      })
      .attr("y", (d) => ((d.y0 ?? 0) + (d.y1 ?? 0)) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d) =>
        (d.x0 ?? 0) < width / 2 ? "start" : "end"
      )
      .attr("fill", textColor)
      .attr("font-size", "12px")
      .attr("font-weight", "500")
      .text((d) => `${d.name} ($${(d.value ?? 0).toLocaleString()})`);
  }, [data, dimensions]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[500px]">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
      />
      {tooltip.show && (
        <div
          className="absolute pointer-events-none bg-bg-card border border-border-main rounded-lg px-3 py-2 text-sm text-text-primary shadow-xl z-10"
          style={{ left: tooltip.x + 10, top: tooltip.y - 30 }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
