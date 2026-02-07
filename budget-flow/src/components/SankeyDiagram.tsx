"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal, SankeyNode, SankeyLink } from "d3-sankey";

interface SankeyNodeExtra {
  name: string;
}

interface SankeyData {
  nodes: SankeyNodeExtra[];
  links: { source: number; target: number; value: number }[];
}

const categoryColors: Record<string, string> = {
  Income: "#10b981",
  Housing: "#6366f1",
  "Food & Dining": "#10b981",
  Transportation: "#f59e0b",
  Entertainment: "#ec4899",
  Shopping: "#8b5cf6",
  Health: "#ef4444",
  Savings: "#14b8a6",
};

function getNodeColor(name: string): string {
  if (categoryColors[name]) return categoryColors[name];
  // For subcategories, find parent color
  return "#6366f1";
}

export default function SankeyDiagram({ data }: { data: SankeyData }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });
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

    const sankeyGenerator = sankey<SankeyNodeExtra, object>()
      .nodeId((d: SankeyNode<SankeyNodeExtra, object>) => d.index as number)
      .nodeWidth(20)
      .nodePadding(14)
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ]);

    const sankeyData = sankeyGenerator({
      nodes: data.nodes.map((d) => ({ ...d })),
      links: data.links.map((d) => ({ ...d })),
    });

    // Draw links
    svg
      .append("g")
      .selectAll("path")
      .data(sankeyData.links)
      .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("fill", "none")
      .attr(
        "stroke",
        (d: SankeyLink<SankeyNodeExtra, object>) => {
          const sourceNode = d.source as SankeyNode<SankeyNodeExtra, object>;
          return getNodeColor(sourceNode.name);
        }
      )
      .attr("stroke-opacity", 0.3)
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

    // Draw nodes
    const nodeGroup = svg
      .append("g")
      .selectAll("g")
      .data(sankeyData.nodes)
      .join("g");

    nodeGroup
      .append("rect")
      .attr("x", (d: SankeyNode<SankeyNodeExtra, object>) => d.x0 || 0)
      .attr("y", (d: SankeyNode<SankeyNodeExtra, object>) => d.y0 || 0)
      .attr(
        "width",
        (d: SankeyNode<SankeyNodeExtra, object>) => (d.x1 || 0) - (d.x0 || 0)
      )
      .attr(
        "height",
        (d: SankeyNode<SankeyNodeExtra, object>) =>
          Math.max(1, (d.y1 || 0) - (d.y0 || 0))
      )
      .attr("fill", (d: SankeyNode<SankeyNodeExtra, object>) =>
        getNodeColor(d.name)
      )
      .attr("rx", 4)
      .attr("opacity", 0.9);

    // Node labels
    nodeGroup
      .append("text")
      .attr("x", (d: SankeyNode<SankeyNodeExtra, object>) => {
        const x0 = d.x0 || 0;
        const x1 = d.x1 || 0;
        return x0 < dimensions.width / 2 ? x1 + 8 : x0 - 8;
      })
      .attr("y", (d: SankeyNode<SankeyNodeExtra, object>) =>
        ((d.y0 || 0) + (d.y1 || 0)) / 2
      )
      .attr("dy", "0.35em")
      .attr("text-anchor", (d: SankeyNode<SankeyNodeExtra, object>) =>
        (d.x0 || 0) < dimensions.width / 2 ? "start" : "end"
      )
      .attr("fill", "#f0f0f5")
      .attr("font-size", "12px")
      .attr("font-weight", "500")
      .text(
        (d: SankeyNode<SankeyNodeExtra, object>) =>
          `${d.name} ($${(d.value || 0).toLocaleString()})`
      );
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
