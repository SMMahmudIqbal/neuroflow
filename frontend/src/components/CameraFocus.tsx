import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import type { ClusterNode } from '../types';

interface CameraFocusProps {
  selectedNode: ClusterNode | null;
  autoRotate: boolean;
}

export const CameraFocus: React.FC<CameraFocusProps> = ({ selectedNode, autoRotate }) => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const targetCamPos = useRef<THREE.Vector3 | null>(null);
  const targetLookAt = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    if (selectedNode) {
      // Smooth cinematic camera swoop towards the selected node
      targetCamPos.current = new THREE.Vector3(
        selectedNode.x + 4.5,
        selectedNode.y + 2.5,
        selectedNode.z + 6.0
      );
      targetLookAt.current = new THREE.Vector3(
        selectedNode.x,
        selectedNode.y,
        selectedNode.z
      );
    }
  }, [selectedNode]);

  useFrame(() => {
    if (controlsRef.current) {
      if (targetCamPos.current && targetLookAt.current) {
        camera.position.lerp(targetCamPos.current, 0.08);
        controlsRef.current.target.lerp(targetLookAt.current, 0.08);
        controlsRef.current.update();

        if (camera.position.distanceTo(targetCamPos.current) < 0.1) {
          targetCamPos.current = null;
          targetLookAt.current = null;
        }
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
      dampingFactor={0.06}
      rotateSpeed={0.8}
      zoomSpeed={1.0}
      panSpeed={0.8}
      autoRotate={autoRotate}
      autoRotateSpeed={0.4}
      maxDistance={120}
      minDistance={2}
    />
  );
};
