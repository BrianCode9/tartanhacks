"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  ConnectionMode,
  MarkerType,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  DollarSign,
  Target,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

interface StrategyNodeData {
  label: string;
  description: string;
  amount?: number;
  nodeType: "income" | "goal" | "strategy" | "suggestion" | "warning";
}

const nodeTypeConfig = {
  income: {
    icon: DollarSign,
    bg: "bg-accent-green/20",
    border: "border-accent-green/40",
    iconColor: "text-accent-green",
    accent: "#10b981",
  },
  goal: {
    icon: Target,
    bg: "bg-accent-blue/20",
    border: "border-accent-blue/40",
    iconColor: "text-accent-blue",
    accent: "#6366f1",
  },
  strategy: {
    icon: TrendingUp,
    bg: "bg-accent-purple/20",
    border: "border-accent-purple/40",
    iconColor: "text-accent-purple",
    accent: "#8b5cf6",
  },
  suggestion: {
    icon: Lightbulb,
    bg: "bg-accent-yellow/20",
    border: "border-accent-yellow/40",
    iconColor: "text-accent-yellow",
    accent: "#f59e0b",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-accent-red/20",
    border: "border-accent-red/40",
    iconColor: "text-accent-red",
    accent: "#ef4444",
  },
};

function StrategyNode({ data }: { data: StrategyNodeData }) {
  const config = nodeTypeConfig[data.nodeType];
  const Icon = config.icon;

  return (
    <div
      className={`${config.bg} ${config.border} border-2 rounded-xl p-4 min-w-[220px] max-w-[280px] shadow-lg backdrop-blur-sm`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-border-main !w-3 !h-3 !border-2 !border-bg-card"
      />
      <div className="flex items-start gap-3">
        <div
          className={`${config.bg} rounded-lg p-2 flex-shrink-0`}
        >
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text-primary text-sm leading-tight">
            {data.label}
          </h3>
          <p className="text-text-secondary text-xs mt-1 leading-relaxed">
            {data.description}
          </p>
          {data.amount !== undefined && (
            <div
              className={`mt-2 text-sm font-bold ${
                data.amount >= 0 ? config.iconColor : "text-accent-red"
              }`}
            >
              {data.amount >= 0 ? "+" : ""}${Math.abs(data.amount).toLocaleString()}/mo
            </div>
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-border-main !w-3 !h-3 !border-2 !border-bg-card"
      />
    </div>
  );
}

const nodeTypes = {
  strategy: StrategyNode,
};

interface Props {
  strategyNodes: {
    id: string;
    type: "income" | "goal" | "strategy" | "suggestion" | "warning";
    label: string;
    description: string;
    amount?: number;
  }[];
  strategyEdges: {
    source: string;
    target: string;
    label?: string;
  }[];
}

export default function StrategyGraphComponent({
  strategyNodes,
  strategyEdges,
}: Props) {
  const nodes: Node[] = useMemo(() => {
    // Layout nodes in columns by type
    const columns: Record<string, number> = {
      income: 0,
      goal: 1,
      strategy: 2,
      suggestion: 2,
      warning: 3,
    };
    const columnCounts: Record<number, number> = {};

    return strategyNodes.map((node) => {
      const col = columns[node.type] ?? 1;
      const count = columnCounts[col] || 0;
      columnCounts[col] = count + 1;

      return {
        id: node.id,
        type: "strategy",
        position: { x: col * 350 + 50, y: count * 200 + 50 },
        data: {
          label: node.label,
          description: node.description,
          amount: node.amount,
          nodeType: node.type,
        },
      };
    });
  }, [strategyNodes]);

  const edges: Edge[] = useMemo(
    () =>
      strategyEdges.map((edge, i) => ({
        id: `e-${i}`,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        type: "smoothstep",
        animated: true,
        style: { stroke: "#4a5568", strokeWidth: 2 },
        labelStyle: { fill: "#9ca3af", fontSize: 11 },
        labelBgStyle: { fill: "#1a1c25", fillOpacity: 0.9 },
        labelBgPadding: [6, 4] as [number, number],
        labelBgBorderRadius: 4,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#4a5568",
        },
      })),
    [strategyEdges]
  );

  const onInit = useCallback(() => {}, []);

  return (
    <div className="w-full h-full min-h-[600px] rounded-xl overflow-hidden border border-border-main">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={onInit}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#2a2d3a" gap={20} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const config =
              nodeTypeConfig[
                (node.data as unknown as StrategyNodeData).nodeType || "goal"
              ];
            return config?.accent || "#6366f1";
          }}
          maskColor="rgba(10, 11, 16, 0.8)"
        />
      </ReactFlow>
    </div>
  );
}
