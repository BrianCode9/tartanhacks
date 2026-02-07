"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  ConnectionMode,
  MarkerType,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  NodeMouseHandler,
  addEdge,
  reconnectEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  CreditCard,
  GraduationCap,
  Car,
  HeartPulse,
  Banknote,
  X,
  Pencil,
  MousePointerClick,
} from "lucide-react";
import { Debt, DebtPayoffScheduleItem, DebtStrategy, DebtType } from "@/lib/types";
import { getDebtRiskColor } from "@/lib/mock-data";

// ─── Config ─────────────────────────────────────────────────────────────────

const debtTypeIcons: Record<DebtType, typeof CreditCard> = {
  "credit-card": CreditCard,
  "student-loan": GraduationCap,
  "car-loan": Car,
  "medical": HeartPulse,
  "personal-loan": Banknote,
};

const riskColorConfig = {
  red: {
    bg: "bg-accent-red/20",
    border: "border-accent-red/40",
    iconColor: "text-accent-red",
    accent: "#ef4444",
  },
  yellow: {
    bg: "bg-accent-yellow/20",
    border: "border-accent-yellow/40",
    iconColor: "text-accent-yellow",
    accent: "#f59e0b",
  },
  green: {
    bg: "bg-accent-green/20",
    border: "border-accent-green/40",
    iconColor: "text-accent-green",
    accent: "#10b981",
  },
};

// ─── Node Data ──────────────────────────────────────────────────────────────

interface DebtNodeData {
  label: string;
  balance: number;
  interestRate: number;
  type: DebtType;
  payoffDate: string;
  orderNumber: number;
  riskColor: "red" | "yellow" | "green";
  minimumPayment: number;
  totalInterestPaid: number;
  cumulativePayment: number;
  monthsToPayoff: number;
  isCustomMode: boolean;
  [key: string]: unknown;
}

// ─── Custom Node ────────────────────────────────────────────────────────────

function DebtNode({ data }: { data: DebtNodeData }) {
  const config = riskColorConfig[data.riskColor];
  const Icon = debtTypeIcons[data.type];

  return (
    <div
      className={`${config.bg} ${config.border} border-2 rounded-xl p-3 min-w-[200px] max-w-[240px] shadow-lg backdrop-blur-sm cursor-pointer hover:scale-[1.02] transition-transform ${
        data.isCustomMode ? "ring-2 ring-accent-blue/30 ring-offset-1 ring-offset-transparent" : ""
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className={`!w-3 !h-3 !border-2 !border-bg-card ${
          data.isCustomMode
            ? "!bg-accent-blue !w-4 !h-4 hover:!bg-accent-blue/80"
            : "!bg-border-main"
        }`}
        isConnectable={data.isCustomMode}
      />
      <div className="flex items-center gap-2.5">
        <div className={`${config.bg} rounded-lg p-1.5 flex-shrink-0 relative`}>
          <Icon className={`w-4 h-4 ${config.iconColor}`} />
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-bg-card border border-border-main flex items-center justify-center text-[9px] font-bold text-text-primary">
            {data.orderNumber}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text-primary text-sm leading-tight truncate">
            {data.label}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-bold text-text-primary">
              ${data.balance.toLocaleString()}
            </span>
            <span className={`text-xs ${config.iconColor}`}>
              {data.interestRate}% APR
            </span>
          </div>
          <span className="text-[10px] text-text-secondary">
            Payoff: {data.payoffDate}
          </span>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className={`!w-3 !h-3 !border-2 !border-bg-card ${
          data.isCustomMode
            ? "!bg-accent-blue !w-4 !h-4 hover:!bg-accent-blue/80"
            : "!bg-border-main"
        }`}
        isConnectable={data.isCustomMode}
      />
    </div>
  );
}

const nodeTypes = {
  debt: DebtNode,
};

// ─── Detail Card ────────────────────────────────────────────────────────────

interface DetailCardProps {
  data: DebtNodeData;
  onClose: () => void;
}

function DebtDetailCard({ data, onClose }: DetailCardProps) {
  const config = riskColorConfig[data.riskColor];
  const Icon = debtTypeIcons[data.type];

  return (
    // Use fixed positioning so the card isn't clipped by the ReactFlow viewport container.
    <div className="fixed top-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] overflow-auto animate-in fade-in slide-in-from-right-4 duration-200">
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
                #{data.orderNumber} in payoff order
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

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl p-3 bg-bg-card/50 border border-border-main">
            <span className="text-sm text-text-secondary">Balance</span>
            <span className="text-lg font-bold text-text-primary">
              ${data.balance.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl p-3 bg-bg-card/50 border border-border-main">
            <span className="text-sm text-text-secondary">Interest Rate</span>
            <span className={`text-lg font-bold ${config.iconColor}`}>
              {data.interestRate}%
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl p-3 bg-bg-card/50 border border-border-main">
            <span className="text-sm text-text-secondary">Min. Payment</span>
            <span className="text-lg font-bold text-text-primary">
              ${data.minimumPayment}/mo
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl p-3 bg-bg-card/50 border border-border-main">
            <span className="text-sm text-text-secondary">Payoff Date</span>
            <span className="text-lg font-bold text-text-primary">
              {data.payoffDate}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl p-3 bg-bg-card/50 border border-border-main">
            <span className="text-sm text-text-secondary">Total Interest</span>
            <span className="text-lg font-bold text-accent-red">
              ${data.totalInterestPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl p-3 bg-bg-card/50 border border-border-main">
            <span className="text-sm text-text-secondary">Cumulative Paid</span>
            <span className="text-lg font-bold text-text-primary">
              ${data.cumulativePayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Position Persistence ───────────────────────────────────────────────────

interface SavedNodePositions {
  [nodeId: string]: { x: number; y: number };
}

function getStorageKey(strategy: DebtStrategy): string {
  return `debt-graph-node-positions-${strategy}`;
}

function loadNodePositions(strategy: DebtStrategy): SavedNodePositions {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(getStorageKey(strategy));
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveNodePositions(strategy: DebtStrategy, positions: SavedNodePositions): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getStorageKey(strategy), JSON.stringify(positions));
  } catch {
    console.warn("Failed to save debt node positions to localStorage");
  }
}

function extractNodePositions(nodes: Node[]): SavedNodePositions {
  return Object.fromEntries(nodes.map((n) => [n.id, n.position]));
}

// ─── Edge order → debt order helper ─────────────────────────────────────────

/** Walk edges to derive a linear payoff order. Returns debt IDs in order. */
function deriveOrderFromEdges(edges: Edge[], allDebtIds: string[]): string[] {
  // Build adjacency: source → target
  const next = new Map<string, string>();
  const hasIncoming = new Set<string>();
  for (const e of edges) {
    next.set(e.source, e.target);
    hasIncoming.add(e.target);
  }

  // Find the starting node (no incoming edge)
  const starts = allDebtIds.filter((id) => !hasIncoming.has(id));
  // If multiple starts or broken chains, just walk what we can
  const order: string[] = [];
  const visited = new Set<string>();

  for (const start of starts) {
    let current: string | undefined = start;
    while (current && !visited.has(current)) {
      visited.add(current);
      order.push(current);
      current = next.get(current);
    }
  }

  // Append any orphaned nodes not in the chain
  for (const id of allDebtIds) {
    if (!visited.has(id)) {
      order.push(id);
    }
  }

  return order;
}

// ─── Main Component ─────────────────────────────────────────────────────────

interface Props {
  debts: Debt[];
  schedule: DebtPayoffScheduleItem[];
  strategy: DebtStrategy;
  onOrderChange?: (newOrder: string[]) => void;
}

export default function DebtGraph({ debts, schedule, strategy, onOrderChange }: Props) {
  const [selectedNode, setSelectedNode] = useState<DebtNodeData | null>(null);
  const [savedPositions] = useState<SavedNodePositions>(() =>
    loadNodePositions(strategy)
  );
  const edgeReconnectSuccessful = useRef(true);
  const isCustomMode = strategy === "custom";

  const debtMap = useMemo(() => new Map(debts.map((d) => [d.id, d])), [debts]);
  const scheduleMap = useMemo(() => new Map(schedule.map((s) => [s.debtId, s])), [schedule]);

  // Build the payoff order from schedule
  const payoffOrder = useMemo(() => schedule.map((s) => s.debtId), [schedule]);
  const allDebtIds = useMemo(() => debts.map((d) => d.id), [debts]);

  const initialNodes: Node[] = useMemo(() => {
    return payoffOrder.map((id, index) => {
      const debt = debtMap.get(id)!;
      const schedItem = scheduleMap.get(id)!;
      const riskColor = getDebtRiskColor(debt.interestRate);

      const data: DebtNodeData = {
        label: debt.name,
        balance: debt.balance,
        interestRate: debt.interestRate,
        type: debt.type,
        payoffDate: schedItem.payoffDate,
        orderNumber: index + 1,
        riskColor,
        minimumPayment: debt.minimumPayment,
        totalInterestPaid: schedItem.totalInterestPaid,
        cumulativePayment: schedItem.cumulativePayment,
        monthsToPayoff: schedItem.monthsToPayoff,
        isCustomMode,
      };

      // Use saved position if available
      if (savedPositions[id]) {
        return {
          id,
          type: "debt",
          position: savedPositions[id],
          draggable: true,
          data,
        };
      }

      // Default: left-to-right with zigzag Y offset
      const x = index * 320 + 50;
      const y = (index % 2 === 0 ? 0 : 80) + 50;

      return {
        id,
        type: "debt",
        position: { x, y },
        draggable: true,
        data,
      };
    });
  }, [payoffOrder, debtMap, scheduleMap, savedPositions, isCustomMode]);

  const makeEdgeStyle = useCallback((isCustom: boolean) => ({
    type: "smoothstep" as const,
    animated: true,
    style: { stroke: isCustom ? "#6366f1" : "#4a5568", strokeWidth: 2 },
    labelStyle: { fill: "#9ca3af", fontSize: 11 },
    labelBgStyle: { fill: "#1a1c25", fillOpacity: 0.9 },
    labelBgPadding: [6, 4] as [number, number],
    labelBgBorderRadius: 4,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: isCustom ? "#6366f1" : "#4a5568",
    },
    ...(isCustom ? { deletable: true } : {}),
  }), []);

  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    for (let i = 0; i < payoffOrder.length - 1; i++) {
      const sourceId = payoffOrder[i];
      const targetId = payoffOrder[i + 1];
      const targetDebt = debtMap.get(targetId)!;

      const label = `$${targetDebt.minimumPayment}/mo`;

      edges.push({
        id: `e-${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        label,
        ...makeEdgeStyle(isCustomMode),
      });
    }
    return edges;
  }, [payoffOrder, debtMap, makeEdgeStyle, isCustomMode]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Save positions whenever nodes change
  useEffect(() => {
    const positions = extractNodePositions(nodes);
    saveNodePositions(strategy, positions);
  }, [nodes, strategy]);

  // ─── Custom mode: connect / reconnect / delete edges ──────────────────────

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!isCustomMode) return;
      // Don't allow self-connections
      if (connection.source === connection.target) return;

      const newEdge: Edge = {
        id: `e-${connection.source}-${connection.target}`,
        source: connection.source!,
        target: connection.target!,
        label: "",
        ...makeEdgeStyle(true),
      };

      setEdges((eds) => {
        // Remove any existing edge FROM this source (each node can only point to one next)
        const filtered = eds.filter((e) => e.source !== connection.source);
        // Also remove any existing edge TO this target (each node can only have one predecessor)
        const filtered2 = filtered.filter((e) => e.target !== connection.target);
        const updated = [...filtered2, newEdge];
        // Derive new order and notify parent
        const newOrder = deriveOrderFromEdges(updated, allDebtIds);
        onOrderChange?.(newOrder);
        return updated;
      });
    },
    [isCustomMode, makeEdgeStyle, setEdges, allDebtIds, onOrderChange]
  );

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      if (!isCustomMode) return;
      edgeReconnectSuccessful.current = true;
      setEdges((eds) => {
        const updated = reconnectEdge(oldEdge, newConnection, eds);
        // Clean: ensure no node has multiple outgoing or incoming
        const seenSources = new Set<string>();
        const seenTargets = new Set<string>();
        const clean = updated.filter((e) => {
          if (seenSources.has(e.source) || seenTargets.has(e.target)) return false;
          seenSources.add(e.source);
          seenTargets.add(e.target);
          return true;
        });
        const newOrder = deriveOrderFromEdges(clean, allDebtIds);
        onOrderChange?.(newOrder);
        return clean;
      });
    },
    [isCustomMode, setEdges, allDebtIds, onOrderChange]
  );

  const onReconnectEnd = useCallback(
    (_event: MouseEvent | TouchEvent, edge: Edge) => {
      if (!edgeReconnectSuccessful.current) {
        // Edge was dropped on empty space — delete it
        setEdges((eds) => {
          const updated = eds.filter((e) => e.id !== edge.id);
          const newOrder = deriveOrderFromEdges(updated, allDebtIds);
          onOrderChange?.(newOrder);
          return updated;
        });
      }
      edgeReconnectSuccessful.current = true;
    },
    [setEdges, allDebtIds, onOrderChange]
  );

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      if (!isCustomMode) return;
      // Delete edge on click in custom mode
      setEdges((eds) => {
        const updated = eds.filter((e) => e.id !== edge.id);
        const newOrder = deriveOrderFromEdges(updated, allDebtIds);
        onOrderChange?.(newOrder);
        return updated;
      });
    },
    [isCustomMode, setEdges, allDebtIds, onOrderChange]
  );

  // ─── Node click for detail card ───────────────────────────────────────────

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNode(node.data as unknown as DebtNodeData);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return (
    <div className="w-full h-full rounded-xl border border-border-main relative">
      {/* Custom mode indicator */}
      {isCustomMode && (
        <div className="absolute top-3 left-3 z-40 flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-accent-blue bg-accent-blue/10 border border-accent-blue/20 rounded-lg px-3 py-1.5 backdrop-blur-sm">
            <Pencil className="w-3 h-3" />
            Edit Mode
          </div>
          <div className="flex items-center gap-2 text-xs text-text-secondary bg-bg-card/80 border border-border-main rounded-lg px-3 py-1.5 backdrop-blur-sm">
            <MousePointerClick className="w-3 h-3" />
            Drag handles to connect &middot; Click edges to remove
          </div>
        </div>
      )}

      {/* Keep ReactFlow clipped, but allow overlays (like the detail card) to escape. */}
      <div className="absolute inset-0 rounded-xl overflow-hidden z-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={isCustomMode ? onEdgesChange : undefined}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onConnect={isCustomMode ? onConnect : undefined}
          onReconnectStart={isCustomMode ? onReconnectStart : undefined}
          onReconnect={isCustomMode ? onReconnect : undefined}
          onReconnectEnd={isCustomMode ? onReconnectEnd : undefined}
          onEdgeClick={isCustomMode ? onEdgeClick : undefined}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.3}
          maxZoom={2}
          nodesDraggable={true}
          edgesReconnectable={isCustomMode}
          proOptions={{ hideAttribution: true }}
          connectionLineStyle={isCustomMode ? { stroke: "#6366f1", strokeWidth: 2 } : undefined}
        >
          <Background color="#2a2d3a" gap={20} size={1} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const data = node.data as unknown as DebtNodeData;
              const config = riskColorConfig[data?.riskColor || "green"];
              return config?.accent || "#10b981";
            }}
            maskColor="rgba(10, 11, 16, 0.8)"
          />
        </ReactFlow>
      </div>

      {selectedNode && (
        <DebtDetailCard
          data={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}
