import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { ClusterNode, GraphEdge } from '../types';
import { ImageNodes } from './ImageNodes';
import { LatentNodes } from './LatentNodes';
import { GraphEdges } from './GraphEdges';
import { Starfield } from './Starfield';

interface GraphCanvasProps {
  nodes: ClusterNode[];
  edges: GraphEdge[];
  selectedNode: ClusterNode | null;
  highlightedIds: Set<string>;
  onSelectNode: (node: ClusterNode) => void;
  hoveredNodeId: string | null;
  setHoveredNodeId: (id: string | null) => void;
  mode: 'vision' | 'text';
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes,
  edges,
  selectedNode,
  highlightedIds,
  onSelectNode,
  hoveredNodeId,
  setHoveredNodeId,
  mode,
}) => {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 16, 42], fov: 50, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#06080e']} />

        {/* Ambient & dynamic lights */}
        <ambientLight intensity={0.65} />
        <pointLight position={[20, 30, 20]} intensity={1.5} color="#38bdf8" />
        <pointLight position={[-20, -20, -20]} intensity={1.2} color="#a855f7" />
        <directionalLight position={[0, 40, 10]} intensity={0.9} />

        {/* 3D Visual Layers */}
        <Starfield />

        <GraphEdges
          nodes={nodes}
          edges={edges}
          selectedNodeId={selectedNode ? selectedNode.id : null}
          highlightedIds={highlightedIds}
        />

        {mode === 'vision' ? (
          <ImageNodes
            nodes={nodes}
            selectedNodeId={selectedNode ? selectedNode.id : null}
            highlightedIds={highlightedIds}
            onSelectNode={onSelectNode}
            hoveredNodeId={hoveredNodeId}
            setHoveredNodeId={setHoveredNodeId}
          />
        ) : (
          <LatentNodes
            nodes={nodes}
            selectedNodeId={selectedNode ? selectedNode.id : null}
            highlightedIds={highlightedIds}
            onSelectNode={onSelectNode}
            hoveredNodeId={hoveredNodeId}
            setHoveredNodeId={setHoveredNodeId}
          />
        )}

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.06}
          rotateSpeed={0.8}
          zoomSpeed={1.0}
          panSpeed={0.8}
          maxDistance={120}
          minDistance={3}
        />
      </Canvas>
    </div>
  );
};
