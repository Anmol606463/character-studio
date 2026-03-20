import { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface HumanModelProps {
  measurements: {
    gender: 'male' | 'female';
    height: number;
    weight: number;
    chest: number;
    waist: number;
    hips: number;
    thigh: number;
    armLength: number;
  };
  skinColor?: string;
  hairColor?: string;
}

export const HumanModel = ({ measurements, skinColor = '#e8beac', hairColor = '#3d2b1f' }: HumanModelProps) => {
  const { scene } = useGLTF('/model.glb', true);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!scene) return;

    // Reset scales first
    scene.traverse((child) => {
       if (child.type === 'Bone') {
           child.scale.set(1, 1, 1);
       }
    });

    const getBone = (name: string) => scene.getObjectByName(name) as THREE.Bone | undefined;

    // Baseline measurements (used to determine scaling ratios)
    const isFemale = measurements.gender === 'female';
    
    const baseHeight = isFemale ? 165 : 170;
    const baseWeight = isFemale ? 60 : 70;
    const baseChest = isFemale ? 88 : 95;
    const baseWaist = isFemale ? 70 : 80;
    const baseHips = isFemale ? 96 : 92;
    const baseThigh = isFemale ? 54 : 55;
    const baseArmLen = isFemale ? 56 : 60;

    // Overall scalar
    const heightScale = measurements.height / baseHeight;
    scene.scale.set(heightScale, heightScale, heightScale);

    // Thickness / Girth Scalars
    // Instead of messing with complex bone hierarchies that can cause skewing,
    // we apply modest bone-level thickness scales.
    const weightFactor = Math.pow(measurements.weight / baseWeight, 1/3); // Cube root for volume
    
    // Adjust base shapes based on gender morph mappings
    let shoulderScaleMultiplier = isFemale ? 0.88 : 1.0; 
    let pelvisScaleMultiplier = isFemale ? 1.08 : 1.0; 

    const chestScale = (measurements.chest / baseChest) * weightFactor;
    const waistScale = (measurements.waist / baseWaist) * weightFactor;
    const hipsScale = (measurements.hips / baseHips) * weightFactor * pelvisScaleMultiplier;
    const thighScale = (measurements.thigh / baseThigh) * weightFactor;
    const armLenScale = measurements.armLength / baseArmLen;

    // A helper to safely scale a bone in thickness
    const scaleThickness = (boneName: string, scale: number) => {
        const bone = getBone(boneName);
        if (bone) {
            // Assuming X and Z are thickness, Y is length
            bone.scale.set(scale, 1, scale);
        }
    };

    // A helper to scale length
    const scaleLength = (boneName: string, scale: number) => {
        const bone = getBone(boneName);
        if (bone) {
            bone.scale.y = scale;
        }
    };

    // Apply thickness
    scaleThickness('Spine01', waistScale);
    scaleThickness('Spine02', chestScale);
    scaleThickness('Pelvis', hipsScale);
    
    if (isFemale) {
        // Narrows shoulders for female
        scaleThickness('L_Clavicle', shoulderScaleMultiplier);
        scaleThickness('R_Clavicle', shoulderScaleMultiplier);
        
        // Enhance chest geometry slightly differently for female figure base approximation if needed
    } else {
        // Reset clavicle scale for male
        scaleThickness('L_Clavicle', 1.0);
        scaleThickness('R_Clavicle', 1.0);
    }
    
    scaleThickness('L_Thigh', thighScale);
    scaleThickness('R_Thigh', thighScale);
    scaleThickness('L_Calf', thighScale * 0.9);
    scaleThickness('R_Calf', thighScale * 0.9);

    // Apply Arm lengths
    scaleLength('L_Upperarm', armLenScale);
    scaleLength('R_Upperarm', armLenScale);
    scaleLength('L_Forearm', armLenScale);
    scaleLength('R_Forearm', armLenScale);

    // Tweak skins and hair
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
         const mesh = child as THREE.Mesh;
         mesh.castShadow = true;
         mesh.receiveShadow = true;

         if (mesh.material) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            
            // Map colors to parts
            const name = mesh.name.toLowerCase();
            if (name.includes('body') || name.includes('skin') || name.includes('head')) {
                mat.color.set(skinColor);
                mat.roughness = 0.45;
                mat.metalness = 0.05;
            } else if (name.includes('hair') || name.includes('scalp')) {
                mat.color.set(hairColor);
                mat.roughness = 0.7;
            } else if (name.includes('cloth') || name.includes('bottom') || name.includes('top')) {
                // Keep default or set a neutral tone
                if (!mat.map) mat.color.set('#222222');
                mat.roughness = 0.8;
            }
            
            mat.needsUpdate = true;
         }
      }
    });
  }, [measurements, scene, skinColor, hairColor]);

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      <primitive object={scene} />
    </group>
  );
};

useGLTF.preload('/model.glb', true);
