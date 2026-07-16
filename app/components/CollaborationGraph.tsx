"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";

// ── Types ───────────────────────────────────────────────────────────────────

export interface GraphMember {
  memberId: string;
  displayName: string;
  initials: string;
  role: string;
  pod: string;
}

export interface GraphInteraction {
  weekIndex: number;
  memberA: string;
  memberB: string;
  interactionStrength: number;
  channel: string;
}

interface Props {
  members: GraphMember[];
  interactions: GraphInteraction[];
  /** Which weekIndex to display (0–5). Defaults to the last index. */
  weekIndex: number;
  /** Optional click handler for member nodes */
  onNodeClick?: (memberId: string) => void;
  /** Whether to render as an accessible data table */
  isTableView?: boolean;
}

// ── Colour thresholds (matches PRD §6.1 and design-system tokens) ───────────
const EDGE_STRONG = 0.7;  // ≥ 0.7 → green  (primary)
const EDGE_MILD   = 0.4;  // 0.4–0.7 → amber (secondary)
// below EDGE_MILD           → red   (tertiary/error)

function edgeColor(strength: number): string {
  if (strength >= EDGE_STRONG) return "var(--color-success)";
  if (strength >= EDGE_MILD)   return "var(--color-warning)";
  return "var(--color-error)";
}

function edgeWidth(strength: number): number {
  if (strength >= EDGE_STRONG) return 2.5;
  if (strength >= EDGE_MILD)   return 1.8;
  return 1.2;
}

function edgeOpacity(strength: number): number {
  if (strength >= EDGE_STRONG) return 0.85;
  if (strength >= EDGE_MILD)   return 0.65;
  return 0.9; // weak edges are vivid so they stand out as warnings
}

// Node colour by pod
const POD_COLORS: Record<string, string> = {
  Core:     "var(--color-primary)",
  Design:   "var(--color-secondary)",
  Platform: "var(--color-tertiary)",
};
function podColor(pod: string): string {
  return POD_COLORS[pod] ?? "var(--color-outline)";
}

// ── D3 node/link shapes ─────────────────────────────────────────────────────

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  initials: string;
  displayName: string;
  role: string;
  pod: string;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  strength: number;
  channel: string;
}

// ── Tooltip state ────────────────────────────────────────────────────────────

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  label: string;
  sub: string;
  color: string;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function CollaborationGraph({
  members,
  interactions,
  weekIndex,
  onNodeClick,
  isTableView = false,
}: Props) {
  const svgRef  = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0, y: 0,
    label: "",
    sub: "",
    color: "var(--color-primary)",
  });

  // ── Filter to the requested week ────────────────────────────────────────
  const { weekLinks, nodes } = useMemo(() => {
    const links = interactions
      .filter((i) => i.weekIndex === weekIndex)
      .map((i) => ({
        source: i.memberA,
        target: i.memberB,
        strength: i.interactionStrength,
        channel: i.channel,
      } as SimLink));

    const activeIds = new Set(links.flatMap((l) => [l.source as string, l.target as string]));
    const computedNodes = members
      .filter((m) => activeIds.has(m.memberId))
      .map((m) => ({
        id:          m.memberId,
        initials:    m.initials,
        displayName: m.displayName,
        role:        m.role,
        pod:         m.pod,
      } as SimNode));

    return { weekLinks: links, nodes: computedNodes };
  }, [interactions, members, weekIndex]);

  useEffect(() => {
    if (isTableView) return;
    const svg = svgRef.current;
    if (!svg || nodes.length === 0) return;

    // Clear previous render
    d3.select(svg).selectAll("*").remove();

    const width  = svg.clientWidth  || 500;
    const height = svg.clientHeight || 320;

    const root = d3
      .select(svg)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // ── Force simulation ────────────────────────────────────────────────────
    const simulation = d3
      .forceSimulation<SimNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimLink>(weekLinks)
          .id((d) => d.id)
          .distance((l) => {
            // Stronger links pull nodes closer
            return 80 + (1 - l.strength) * 120;
          })
          .strength((l) => l.strength * 0.6)
      )
      .force("charge", d3.forceManyBody().strength(-220))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide(30));

    // ── Defs: arrow markers for directed feel ──────────────────────────────
    const defs = root.append("defs");

    ["strong", "mild", "weak"].forEach((tier, i) => {
      const colors = ["var(--color-success)", "var(--color-warning)", "var(--color-error)"];
      defs
        .append("marker")
        .attr("id", `arrow-${tier}`)
        .attr("viewBox", "0 -4 8 8")
        .attr("refX", 22)
        .attr("refY", 0)
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-4L8,0L0,4")
        .attr("fill", colors[i])
        .attr("opacity", 0.7);
    });

    // ── Edges ───────────────────────────────────────────────────────────────
    const linkGroup = root.append("g").attr("class", "links");

    const linkEls = linkGroup
      .selectAll<SVGLineElement, SimLink>("line")
      .data(weekLinks)
      .join("line")
      .attr("stroke", (d) => edgeColor(d.strength))
      .attr("stroke-width", (d) => edgeWidth(d.strength))
      .attr("stroke-opacity", (d) => edgeOpacity(d.strength))
      .attr("stroke-linecap", "round")
      .attr("marker-end", (d) =>
        d.strength >= EDGE_STRONG
          ? "url(#arrow-strong)"
          : d.strength >= EDGE_MILD
          ? "url(#arrow-mild)"
          : "url(#arrow-weak)"
      )
      .style("cursor", "pointer")
      .on("mouseenter", function (event: MouseEvent, d: SimLink) {
        const rect = svg.getBoundingClientRect();
        const tier =
          d.strength >= EDGE_STRONG
            ? "Strong"
            : d.strength >= EDGE_MILD
            ? "Mild"
            : "Weak";
        const src = (d.source as SimNode).displayName;
        const tgt = (d.target as SimNode).displayName;
        let subText = `${tier} collaboration strength (${d.strength.toFixed(2)}) via ${d.channel}`;
        if (d.strength < EDGE_MILD) {
          subText = `Weak tie: Low interaction frequency in the last 6 weeks. Score: ${d.strength.toFixed(2)} via ${d.channel}`;
        }
        
        setTooltip({
          visible: true,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 12,
          label: `${src} ↔ ${tgt}`,
          sub: subText,
          color: edgeColor(d.strength),
        });
      })
      .on("mousemove", function (event: MouseEvent) {
        const rect = svg.getBoundingClientRect();
        setTooltip((t) => ({
          ...t,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 12,
        }));
      })
      .on("mouseleave", () => setTooltip((t) => ({ ...t, visible: false })));

    // ── Nodes ───────────────────────────────────────────────────────────────
    const nodeGroup = root.append("g").attr("class", "nodes");

    const nodeEls = nodeGroup
      .selectAll<SVGGElement, SimNode>("g")
      .data(nodes)
      .join("g")
      .style("cursor", "pointer")
      .call(
        d3
          .drag<SVGGElement, SimNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on("click", (event, d) => {
        if (onNodeClick) onNodeClick(d.id);
      });

    // Shadow / glow circle
    nodeEls
      .append("circle")
      .attr("r", 22)
      .attr("fill", (d) => podColor(d.pod))
      .attr("opacity", 0.12);

    // Main circle
    nodeEls
      .append("circle")
      .attr("r", 18)
      .attr("fill", (d) => podColor(d.pod))
      .attr("stroke", "var(--color-surface)")
      .attr("stroke-width", 2);

    // Initials text
    nodeEls
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("fill", "#ffffff")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .attr("font-family", "Inter, ui-sans-serif, system-ui")
      .attr("pointer-events", "none")
      .text((d) => d.initials);

    // Node hover
    nodeEls
      .on("mouseenter", function (event: MouseEvent, d: SimNode) {
        const rect = svg.getBoundingClientRect();
        setTooltip({
          visible: true,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 12,
          label: d.displayName,
          sub: `${d.role} in ${d.pod} Pod (Click to view health metrics)`,
          color: podColor(d.pod),
        });
        d3.select<SVGGElement, SimNode>(this)
          .select<SVGCircleElement>("circle:nth-child(2)")
          .transition()
          .duration(150)
          .attr("r", 21)
          .attr("stroke-width", 3);
          
        linkEls.transition().duration(200).attr("stroke-opacity", (l: any) => {
          return (l.source.id === d.id || l.target.id === d.id) ? edgeOpacity(l.strength) : 0.15;
        });
      })
      .on("mousemove", function (event: MouseEvent) {
        const rect = svg.getBoundingClientRect();
        setTooltip((t) => ({
          ...t,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 12,
        }));
      })
      .on("mouseleave", function () {
        setTooltip((t) => ({ ...t, visible: false }));
        d3.select<SVGGElement, SimNode>(this as SVGGElement)
          .select<SVGCircleElement>("circle:nth-child(2)")
          .transition()
          .duration(150)
          .attr("r", 18)
          .attr("stroke-width", 2);
          
        linkEls.transition().duration(200).attr("stroke-opacity", (l: any) => edgeOpacity(l.strength));
      });

    // ── Tick ────────────────────────────────────────────────────────────────
    simulation.on("tick", () => {
      linkEls
        .attr("x1", (d) => (d.source as SimNode).x ?? 0)
        .attr("y1", (d) => (d.source as SimNode).y ?? 0)
        .attr("x2", (d) => (d.target as SimNode).x ?? 0)
        .attr("y2", (d) => (d.target as SimNode).y ?? 0);

      nodeEls.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [nodes, weekLinks, isTableView, onNodeClick]);

  if (isTableView) {
    return (
      <div className="w-full h-full min-h-[300px] overflow-y-auto custom-scrollbar relative">
        <table className="w-full text-left border-collapse text-sm text-on-surface">
          <thead className="sticky top-0 bg-surface-container-lowest z-10 border-b border-outline-variant/30 text-[10px] text-on-surface-variant uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 font-semibold">Node A</th>
              <th className="py-3 px-4 font-semibold">Node B</th>
              <th className="py-3 px-4 font-semibold">Strength</th>
              <th className="py-3 px-4 font-semibold">Channel</th>
            </tr>
          </thead>
          <tbody>
            {weekLinks.map((link: any, idx: number) => {
              const src = typeof link.source === 'string' ? (members.find(m => m.memberId === link.source)?.displayName || link.source) : link.source.displayName;
              const tgt = typeof link.target === 'string' ? (members.find(m => m.memberId === link.target)?.displayName || link.target) : link.target.displayName;
              return (
                <tr key={idx} className="border-b border-outline-variant/10 hover:bg-surface-container-high/50 transition-colors">
                  <td className="py-3 px-4 font-medium">{src}</td>
                  <td className="py-3 px-4 font-medium">{tgt}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${edgeColor(link.strength)} 15%, transparent)`, color: edgeColor(link.strength), border: `1px solid color-mix(in srgb, ${edgeColor(link.strength)} 30%, transparent)` }}>
                      {link.strength >= EDGE_STRONG ? 'Strong' : link.strength >= EDGE_MILD ? 'Mild' : 'Weak'} ({link.strength.toFixed(2)})
                    </span>
                  </td>
                  <td className="py-3 px-4 capitalize text-on-surface-variant">{link.channel}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[300px]">
      {/* Graph SVG */}
      <svg
        ref={svgRef}
        className="w-full h-full"
        aria-label="Team collaboration network graph showing member interaction strengths"
      />

      {/* Legend */}
      <div className="absolute bottom-2 left-3 flex flex-col gap-1">
        {[
          { label: "Strong  ≥ 0.7",  color: "var(--color-success)" },
          { label: "Mild  0.4–0.7",  color: "var(--color-warning)" },
          { label: "Weak  < 0.4",    color: "var(--color-error)" },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span
              className="block w-5 h-[2.5px] rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-[10px] text-on-surface-variant font-medium">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Pod legend */}
      <div className="absolute bottom-2 right-3 flex flex-col gap-1 items-end">
        {Object.entries(POD_COLORS).map(([pod, color]) => (
          <div key={pod} className="flex items-center gap-1.5">
            <span className="text-[10px] text-on-surface-variant font-medium">
              {pod}
            </span>
            <span
              className="block w-3 h-3 rounded-full"
              style={{ backgroundColor: color, opacity: 0.85 }}
            />
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="pointer-events-none absolute z-20 px-3 py-2 rounded-lg shadow-lg text-xs"
          style={{
            left:  tooltip.x + 12,
            top:   tooltip.y,
            background: "var(--color-surface-container-highest)",
            border: `1px solid color-mix(in srgb, ${tooltip.color} 25%, transparent)`,
            maxWidth: 220,
          }}
        >
          <p
            className="font-semibold text-on-surface"
            style={{ color: tooltip.color }}
          >
            {tooltip.label}
          </p>
          <p className="text-on-surface-variant mt-0.5">{tooltip.sub}</p>
        </div>
      )}
    </div>
  );
}
