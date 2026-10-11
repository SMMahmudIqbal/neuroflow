import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import type { ClusterNode } from '../types';
import { soundFX } from '../utils/sound';

interface LatentNodesProps {
  nodes: ClusterNode[];
  selectedNodeId: string | null;
  highlightedIds: Set<string>;
  onSelectNode: (node: ClusterNode) => void;
  hoveredNodeId: string | null;
  setHoveredNodeId: (id: string | null) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Deep Learning': '#6366f1', // Indigo
  'Distributed Systems': '#06b6d4', // Cyan
  'Computer Graphics': '#f43f5e', // Rose
  'Quantum Computing': '#a855f7', // Purple
  'Neuroscience': '#10b981', // Emerald
  'Uploaded': '#eab308', // Amber
  'General': '#38bdf8', // Sky
};

export const LatentNodes: React.FC<LatentNodesProps> = ({
  nodes,
  selectedNodeId,
  highlightedIds,
  onSelectNode,
  hoveredNodeId,
  setHoveredNodeId,
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Prepare color lookup
  const nodeColors = useMemo(() => {
    return nodes.map((node) => {
      const hex = CATEGORY_COLORS[node.category] || '#38bdf8';
      return new THREE.Color(hex);
    });
  }, [nodes]);

  // Update instanced matrices & colors
  useEffect(() => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;

    nodes.forEach((node, i) => {
      dummy.position.set(node.x, node.y, node.z);

      const isSelected = selectedNodeId === node.id;
      const isHovered = hoveredNodeId === node.id;
      const isHighlighted = highlightedIds.size > 0 && highlightedIds.has(node.id);

      let scale = 1.0;
      if (isSelected) scale = 2.4;
      else if (isHovered) scale = 1.9;
      else if (isHighlighted) scale = 1.6;
      else if (selectedNodeId || highlightedIds.size > 0) scale = 0.65;

      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      let color = nodeColors[i].clone();
      if (isSelected) {
        color = new THREE.Color('#ffffff');
      } else if (isHovered) {
        color = color.multiplyScalar(1.6);
      } else if (isHighlighted) {
        color = color.multiplyScalar(1.4);
      } else if (selectedNodeId || highlightedIds.size > 0) {
        color = color.multiplyScalar(0.3);
      }

      mesh.setColorAt(i, color);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [nodes, selectedNodeId, hoveredNodeId, highlightedIds, nodeColors, dummy]);

  // Subtle pulsing animation on the instanced mesh
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    // Subtle gentle pulsation for hovered or selected node
    if (hoveredNodeId || selectedNodeId) {
      const activeId = hoveredNodeId || selectedNodeId;
      const idx = nodes.findIndex((n) => n.id === activeId);
      if (idx !== -1) {
        const node = nodes[idx];
        dummy.position.set(node.x, node.y, node.z);
        const pulse = 1.8 + Math.sin(t * 8) * 0.25;
        dummy.scale.set(pulse, pulse, pulse);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(idx, dummy.matrix);
        meshRef.current.instanceMatrix.needsUpdate = true;
      }
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.instanceId !== undefined && e.instanceId < nodes.length) {
      const node = nodes[e.instanceId];
      soundFX.playSelect();
      onSelectNode(node);
    }
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.instanceId !== undefined && e.instanceId < nodes.length) {
      const node = nodes[e.instanceId];
      if (node.id !== hoveredNodeId) {
        soundFX.playHover();
        setHoveredNodeId(node.id);
        document.body.style.cursor = 'pointer';
      }
    }
  };

  const handlePointerOut = () => {
    setHoveredNodeId(null);
    document.body.style.cursor = 'default';
  };

  // Node targeted for text billboard
  const activeNode = useMemo(() => {
    if (hoveredNodeId) return nodes.find((n) => n.id === hoveredNodeId);
    if (selectedNodeId) return nodes.find((n) => n.id === selectedNodeId);
    return null;
  }, [hoveredNodeId, selectedNodeId, nodes]);

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, nodes.length]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[0.7, 24, 24]} />
        <meshStandardMaterial
          roughness={0.2}
          metalness={0.8}
          emissive="#1e1b4b"
          emissiveIntensity={0.6}
        />
      </instancedMesh>

      {/* Floating 3D Text Label for Active Node */}
      {activeNode && (
        <group position={[activeNode.x, activeNode.y + 1.8, activeNode.z]}>
          <Text
            fontSize={0.85}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.08}
            outlineColor="#090d16"
          >
            {activeNode.title}
          </Text>
          <Text
            position={[0, -0.65, 0]}
            fontSize={0.55}
            color="#38bdf8"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="#090d16"
          >
            {`[ ${activeNode.category} ]`}
          </Text>
        </group>
      )}
    </group>
  );
};
