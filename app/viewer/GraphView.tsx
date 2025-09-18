// app/viewer/GraphView.tsx
"use client";
import { useEffect, useRef } from "react";
import Graph from "graphology";
import Sigma from "sigma";

type Edge = { source: string; target: string; similarity: number };
type Node = { id: string; label: string; degree: number; x: number; y: number };
type Comp = { id: number; company?: string; nodes: Node[]; edges: Edge[] };

export default function GraphView(
  { compId, basePath = "/data/components" }:
  { compId: number; basePath?: string }
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<Sigma | null>(null);

  useEffect(() => {
    let disposed = false;

    async function load() {
      const res = await fetch(`${basePath}/comp_${compId}.json`);
      const data: Comp = await res.json();
      if (disposed) return;

      const graph = new Graph({ type: "undirected" });

      data.nodes.forEach(n => {
        graph.addNode(n.id, {
          x: n.x,
          y: n.y,
          label: n.label,
          degree: n.degree,
          size: Math.max(2, Math.log2(1 + n.degree) + 2),
        });
      });

      data.edges.forEach(e => {
        if (!graph.hasEdge(e.source, e.target)) {
          graph.addEdge(e.source, e.target, { similarity: e.similarity });
        }
      });

      if (rendererRef.current) {
        rendererRef.current.kill();
        rendererRef.current = null;
      }

      const renderer = new Sigma(graph, containerRef.current!, {
        renderEdgeLabels: false,
        defaultNodeColor: "#4a6fa5",
        defaultEdgeColor: "#999",
        zIndex: true,
      });

      renderer.on("clickNode", ({ node }) => {
        const cam = renderer.getCamera();
        const pos = renderer.getNodeDisplayData(node)!;
        cam.animate({ x: pos.x, y: pos.y, ratio: 0.1 }, { duration: 300 });
      });

      rendererRef.current = renderer;
    }

    load();
    return () => {
      disposed = true;
      if (rendererRef.current) rendererRef.current.kill();
    };
  }, [compId, basePath]);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
