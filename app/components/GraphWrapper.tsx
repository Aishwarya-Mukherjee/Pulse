"use client";

/**
 * GraphWrapper.tsx
 *
 * This is the ONLY place `ssr: false` is used. It must be in a Client
 * Component ("use client") — Next.js 16 forbids `ssr: false` with
 * `next/dynamic` inside Server Components.
 *
 * page.tsx (Server Component) imports this wrapper instead of the graph
 * directly, so the constraint is satisfied.
 */
import dynamic from "next/dynamic";
import type { GraphMember, GraphInteraction } from "./CollaborationGraph";

const CollaborationGraph = dynamic(() => import("./CollaborationGraph"), {
  ssr: false,
  loading: () => (
    <div className="flex-grow flex items-center justify-center min-h-[300px]">
      <p className="text-sm text-on-surface-variant animate-pulse">
        Loading graph…
      </p>
    </div>
  ),
});

interface Props {
  members: GraphMember[];
  interactions: GraphInteraction[];
  weekIndex: number;
  onNodeClick?: (memberId: string) => void;
  isTableView?: boolean;
}

export default function GraphWrapper(props: Props) {
  return <CollaborationGraph {...props} />;
}
