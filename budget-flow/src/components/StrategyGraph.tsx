"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
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
  useNodesState,
  useEdgesState,
  NodeMouseHandler,
  NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  DollarSign,
  Target,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  X,
} from "lucide-react";

interface StrategyNodeData {
  label: string;
  description: string;
  amount?: number;
  nodeType: "income" | "goal" | "strategy" | "suggestion" | "warning";
  [key: string]: unknown;
}

const nodeTypeConfig = {
  income: {
    icon: DollarSign,
    bg: "bg-accent-green/20",
    border: "border-accent-green/40",
    iconColor: "text-accent-green",
    accent: "#10b981",
    label: "Income",
  },
  goal: {
    icon: Target,
    bg: "bg-accent-blue/20",
    border: "border-accent-blue/40",
    iconColor: "text-accent-blue",
    accent: "#6366f1",
    label: "Goal",
  },
  strategy: {
    icon: TrendingUp,
    bg: "bg-accent-purple/20",
    border: "border-accent-purple/40",
    iconColor: "text-accent-purple",
    accent: "#8b5cf6",
    label: "Strategy",
  },
  suggestion: {
    icon: Lightbulb,
    bg: "bg-accent-yellow/20",
    border: "border-accent-yellow/40",
    iconColor: "text-accent-yellow",
    accent: "#f59e0b",
    label: "Suggestion",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-accent-red/20",
    border: "border-accent-red/40",
    iconColor: "text-accent-red",
    accent: "#ef4444",
    label: "Warning",
  },
};

function StrategyNode({ data }: { data: StrategyNodeData }) {
  const config = nodeTypeConfig[data.nodeType];
  const Icon = config.icon;

  return (
    <div
      className={`${config.bg} ${config.border} border-2 rounded-xl p-3 min-w-[180px] max-w-[220px] shadow-lg backdrop-blur-sm cursor-pointer hover:scale-[1.02] transition-transform`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-border-main !w-3 !h-3 !border-2 !border-bg-card"
      />
      <div className="flex items-center gap-2.5">
        <div className={`${config.bg} rounded-lg p-1.5 flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text-primary text-sm leading-tight truncate">
            {data.label}
          </h3>
          {data.amount !== undefined && (
            <span
              className={`text-xs font-bold ${data.amount >= 0 ? config.iconColor : "text-accent-red"
                }`}
            >
              {data.amount >= 0 ? "+" : ""}${Math.abs(data.amount).toLocaleString()}/mo
            </span>
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

// ─── Detail Card ─────────────────────────────────────────────────────────────

interface DetailCardProps {
  data: StrategyNodeData;
  onClose: () => void;
}

function DetailCard({ data, onClose }: DetailCardProps) {
  const config = nodeTypeConfig[data.nodeType];
  const Icon = config.icon;

  return (
    <div className="absolute top-4 right-4 z-50 w-80 animate-in fade-in slide-in-from-right-4 duration-200">
      <div
        className={`${config.bg} border-2 ${config.border} rounded-2xl p-5 shadow-2xl backdrop-blur-md`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`${config.bg} rounded-xl p-2.5`}>
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div>
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${config.iconColor}`}
              >
                {config.label}
              </span>
              <h3 className="text-lg font-bold text-text-primary leading-tight">
                {data.label}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-bg-card/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed mb-4">
          {data.description}
        </p>

        {data.amount !== undefined && (
          <div
            className={`flex items-center justify-between rounded-xl p-3 ${data.amount >= 0
              ? "bg-accent-green/10 border border-accent-green/20"
              : "bg-accent-red/10 border border-accent-red/20"
              }`}
          >
            <span className="text-sm text-text-secondary">Monthly Impact</span>
            <span
              className={`text-xl font-bold ${data.amount >= 0 ? "text-accent-green" : "text-accent-red"
                }`}
            >
              {data.amount >= 0 ? "+" : "-"}${Math.abs(data.amount).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

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

// ─── Position Persistence ────────────────────────────────────────────────────

const STORAGE_KEY = "strategy-graph-node-positions";

interface SavedNodePositions {
  [nodeId: string]: { x: number; y: number };
}

function loadNodePositions(): SavedNodePositions {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveNodePositions(positions: SavedNodePositions): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {
    console.warn("Failed to save node positions to localStorage");
  }
}

function extractNodePositions(nodes: Node[]): SavedNodePositions {
  return Object.fromEntries(nodes.map((n) => [n.id, n.position]));
}

export default function StrategyGraphComponent({
  strategyNodes,
  strategyEdges,
}: Props) {
  const [selectedNode, setSelectedNode] = useState<StrategyNodeData | null>(null);
  const [savedPositions, setSavedPositions] = useState<SavedNodePositions>(() =>
    loadNodePositions()
  );

  const initialNodes: Node[] = useMemo(() => {
    const columns: Record<string, number> = {
      income: 0,
      goal: 1,
      strategy: 2,
      suggestion: 2,
      warning: 3,
    };
    const columnCounts: Record<number, number> = {};

    return strategyNodes.map((node) => {
      // Use saved position if available
      if (savedPositions[node.id]) {
        return {
          id: node.id,
          type: "strategy",
          position: savedPositions[node.id],
          draggable: true,
          data: {
            label: node.label,
            description: node.description,
            amount: node.amount,
            nodeType: node.type,
          },
        };
      }

      // Default positioning logic
      const col = columns[node.type] ?? 1;
      const count = columnCounts[col] || 0;
      columnCounts[col] = count + 1;

      return {
        id: node.id,
        type: "strategy",
        position: { x: col * 350 + 50, y: count * 180 + 50 },
        draggable: true,
        data: {
          label: node.label,
          description: node.description,
          amount: node.amount,
          nodeType: node.type,
        },
      };
    });
  }, [strategyNodes, savedPositions]);

  const initialEdges: Edge[] = useMemo(
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

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Save positions whenever nodes change
  useEffect(() => {
    const positions = extractNodePositions(nodes);
    saveNodePositions(positions);
  }, [nodes]);

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNode(node.data as unknown as StrategyNodeData);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-border-main relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
        nodesDraggable={true}
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

      {selectedNode && (
        <DetailCard
          data={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}
