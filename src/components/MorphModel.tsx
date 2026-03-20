import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface MorphModelProps {
  url: string;
  influence: number;
  morphIndex: number;
}

export const MorphModel: React.FC<MorphModelProps> = ({ url, influence, morphIndex }) => {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.morphTargetInfluences) {
          // Check if this mesh has the requested morph index
          if (mesh.morphTargetInfluences.length > morphIndex) {
            mesh.morphTargetInfluences[morphIndex] = influence;
          }
          // Debug: Only log once if needed, or remove to prevent console spam
          if (mesh.morphTargetInfluences.length <= morphIndex && mesh.morphTargetInfluences.length > 0) {
            // Silencing this to prevent console spam
          }
        }
      }
    });
  }, [scene, influence, morphIndex]);

  // Map influence (0 to 1) to proportional height scaling.
  // We'll allow scaling from 1.0 up to 1.15 in height (a 15% physical increase).
  const heightScale = 1.0 + (influence * 0.15);

  return <primitive ref={modelRef} object={scene} scale={[1, heightScale, 1]} position={[0, -1, 0]} />;
};

export const PlaceholderModel: React.FC<{ influence: number }> = ({ influence }) => {
  return (
    <group position={[0, -1, 0]}>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[1, 1, 0.1, 32]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </mesh>
      
      <mesh position={[0, 1 + influence * 0.4, 0]}>
        <capsuleGeometry args={[0.3, 1 + influence * 0.8, 16, 32]} />
        <meshStandardMaterial 
          color="#3b82f6" 
          emissive="#1d4ed8" 
          emissiveIntensity={0.5}
          roughness={0.3} 
          metalness={0.2}
        />
      </mesh>
      
      <gridHelper args={[20, 20, "#222", "#111"]} position={[0, 0, 0]} />
    </group>
  );
};
