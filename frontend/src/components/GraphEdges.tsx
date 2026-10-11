import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { ClusterNode, GraphEdge } from '../types';

interface GraphEdgesProps {
  nodes: ClusterNode[];
  edges: GraphEdge[];
  selectedNodeId: string | null;
  highlightedIds: Set<string>;
}

export const GraphEdges: React.FC<GraphEdgesProps> = ({
  nodes,
  edges,
  selectedNodeId,
  highlightedIds,
}) => {
  const nodeMap = useMemo(() => {
    const map = new Map<string, ClusterNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Generate line segments for all standard edges
  const { positions, colors } = useMemo(() => {
    const posArr: number[] = [];
    const colArr: number[] = [];

    const defaultColor = new THREE.Color('#38bdf8').multiplyScalar(0.2);
    const activeColor = new THREE.Color('#38bdf8');
    const inactiveColor = new THREE.Color('#1e293b').multiplyScalar(0.4);

    edges.forEach((edge) => {
      const src = nodeMap.get(edge.source);
      const tgt = nodeMap.get(edge.target);
      if (!src || !tgt) return;

      posArr.push(src.x, src.y, src.z);
      posArr.push(tgt.x, tgt.y, tgt.z);

      const isConnectedToSelected =
        selectedNodeId && (edge.source === selectedNodeId || edge.target === selectedNodeId);
      const isHighlighted =
        highlightedIds.size > 0 &&
        highlightedIds.has(edge.source) &&
        highlightedIds.has(edge.target);

      let c = defaultColor;
      if (isConnectedToSelected || isHighlighted) {
        c = activeColor;
      } else if (selectedNodeId || highlightedIds.size > 0) {
        c = inactiveColor;
      }

      colArr.push(c.r, c.g, c.b);
      colArr.push(c.r, c.g, c.b);
    });

    return {
      positions: new Float32Array(posArr),
      colors: new Float32Array(colArr),
    };
  }, [edges, nodeMap, selectedNodeId, highlightedIds]);

  if (positions.length === 0) return null;

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
};
