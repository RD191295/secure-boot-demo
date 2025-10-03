// src/components/DataBus.tsx
import * as THREE from "three";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";

interface Position {
  x: number;
  y: number;
  z: number;
}

interface DataBusProps {
  id: string;
  from: Position;
  to: Position;
  isActive: boolean;
  isVisible: boolean;
  type: string;
  data?: string;
  animationSpeed?: number;
}

export default function DataBus({
  id,
  from,
  to,
  isActive,
  isVisible,
  type,
  animationSpeed = 1
}: DataBusProps) {
  const lineRef = useRef<THREE.Line>(null!);

  // Define line geometry
  const points = useMemo(() => {
    return [new THREE.Vector3(from.x, from.y, from.z), new THREE.Vector3(to.x, to.y, to.z)];
  }, [from, to]);

  // Shader material for moving dashes
  const materialRef = useRef<THREE.LineDashedMaterial>(null!);

  useFrame((_, delta) => {
    if (isActive && materialRef.current) {
      materialRef.current.dashOffset -= delta * animationSpeed; // animate dash offset
    }
  });

  if (!isVisible) return null;

  return (
    <line ref={lineRef}>
      <bufferGeometry attach="geometry" setFromPoints={points} />
      <lineDashedMaterial
        ref={materialRef}
        color={isActive ? "limegreen" : "gray"}
        dashSize={0.2}
        gapSize={0.1}
        linewidth={2}
      />
    </line>
  );
}
