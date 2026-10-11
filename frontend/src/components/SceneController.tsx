import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import type { ClusterNode } from '../types';

interface SceneControllerProps {
  selectedNode: ClusterNode | null;
  targetCoords: [number, number, number] | null;
}

export const SceneController: React.FC<SceneControllerProps> = ({
  selectedNode,
  targetCoords,
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const targetPos = useRef<THREE.Vector3 | null>(null);
  const targetLookAt = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    let focus: [number, number, number] | null = null;
    if (selectedNode) {
      focus = [selectedNode.x, selectedNode.y, selectedNode.z];
    } else if (targetCoords) {
      focus = targetCoords;
    }

    if (focus) {
      const [fx, fy, fz] = focus;
      // Position camera offset from node for a cinematic focus
      targetPos.current = new THREE.Vector3(fx + 6, fy + 4, fz + 8);
      targetLookAt.current = new THREE.Vector3(fx, fy, fz);
    }
  }, [selectedNode, targetCoords]);

  useFrame(() => {
    if (targetPos.current && targetLookAt.current && controlsRef.current) {
      camera.position.lerp(targetPos.current, 0.06);
      controlsRef.current.target.lerp(targetLookAt.current, 0.06);
      controlsRef.current.update();

      if (camera.position.distanceTo(targetPos.current) < 0.1) {
        targetPos.current = null;
        targetLookAt.current = null;
      }
    }
  });

  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <primitive
      object={new OrbitControlsImpl(camera, document.body)}
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      maxDistance={90}
      minDistance={4}
    />
  );
};
