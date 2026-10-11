import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Image as DreiImage, Text } from '@react-three/drei';
import type { ClusterNode } from '../types';
import { soundFX } from '../utils/sound';

interface ImageNodesProps {
  nodes: ClusterNode[];
  selectedNodeId: string | null;
  highlightedIds: Set<string>;
  onSelectNode: (node: ClusterNode) => void;
  hoveredNodeId: string | null;
  setHoveredNodeId: (id: string | null) => void;
}

interface ImageCardItemProps {
  node: ClusterNode;
  isSelected: boolean;
  isHovered: boolean;
  isDimmed: boolean;
  onSelect: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
}

const ImageCardItem: React.FC<ImageCardItemProps> = ({
  node,
  isSelected,
  isHovered,
  isDimmed,
  onSelect,
  onPointerOver,
  onPointerOut,
}) => {
  const scale = isSelected ? 3.2 : isHovered ? 2.6 : isDimmed ? 1.0 : 1.8;
  const opacity = isDimmed ? 0.25 : 1.0;

  return (
    <group
      position={[node.x, node.y, node.z]}
      scale={[scale, scale, scale]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onPointerOver();
      }}
      onPointerOut={() => {
        onPointerOut();
      }}
    >
      {/* Neo-Glass Frame Backplate */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[1.25, 1.25]} />
        <meshBasicMaterial
          color={isSelected ? '#38bdf8' : isHovered ? '#818cf8' : '#0f172a'}
          transparent
          opacity={isSelected ? 0.9 : isHovered ? 0.6 : 0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floating 3D Image Texture */}
      {node.imageUrl ? (
        <DreiImage
          url={node.imageUrl}
          scale={[1.15, 1.15]}
          transparent
          opacity={opacity}
          toneMapped={false}
        />
      ) : (
        <mesh>
          <boxGeometry args={[1.1, 1.1, 0.1]} />
          <meshStandardMaterial color="#38bdf8" />
        </mesh>
      )}

      {/* Title Tag on Hover or Select */}
      {(isHovered || isSelected) && (
        <group position={[0, -0.85, 0]}>
          <Text
            fontSize={0.22}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {node.title}
          </Text>
          <Text
            position={[0, -0.22, 0]}
            fontSize={0.16}
            color="#38bdf8"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {node.category}
          </Text>
        </group>
      )}
    </group>
  );
};

export const ImageNodes: React.FC<ImageNodesProps> = ({
  nodes,
  selectedNodeId,
  highlightedIds,
  onSelectNode,
  hoveredNodeId,
  setHoveredNodeId,
}) => {
  const isAnyActive = Boolean(selectedNodeId || highlightedIds.size > 0);

  const renderedItems = useMemo(() => {
    return nodes.map((node) => {
      const isSelected = selectedNodeId === node.id;
      const isHovered = hoveredNodeId === node.id;
      const isHighlighted = highlightedIds.size > 0 && highlightedIds.has(node.id);
      const isDimmed = isAnyActive && !isSelected && !isHighlighted && !isHovered;

      return (
        <ImageCardItem
          key={node.id}
          node={node}
          isSelected={isSelected}
          isHovered={isHovered}
          isDimmed={isDimmed}
          onSelect={() => {
            soundFX.playSelect();
            onSelectNode(node);
          }}
          onPointerOver={() => {
            if (node.id !== hoveredNodeId) {
              soundFX.playHover();
              setHoveredNodeId(node.id);
              document.body.style.cursor = 'pointer';
            }
          }}
          onPointerOut={() => {
            setHoveredNodeId(null);
            document.body.style.cursor = 'default';
          }}
        />
      );
    });
  }, [nodes, selectedNodeId, highlightedIds, hoveredNodeId, isAnyActive, onSelectNode, setHoveredNodeId]);

  return <group>{renderedItems}</group>;
};
