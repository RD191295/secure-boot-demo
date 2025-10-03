// src/components/DataBus3D.tsx
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferGeometry, Float32BufferAttribute, Line, Vector3, LineBasicMaterial } from 'three';

interface DataBus3DProps {
  from: { x: number; y: number; z: number };
  to: { x: number; y: number; z: number };
  type: 'power' | 'data' | 'control' | 'address';
  isActive: boolean;
  animationSpeed: number;
}

const DataBus3D: React.FC<DataBus3DProps> = ({ from, to, type, isActive, animationSpeed }) => {
  const lineRef = useRef<Line>(null);
  const particlesRef = useRef<Array<Vector3>>([]);

  // Line points
  const points = useMemo(() => {
    const pts = [new Vector3(from.x, from.y, from.z), new Vector3(to.x, to.y, to.z)];
    return pts;
  }, [from, to]);

  // Particle initialization
  const particleCount = 10;
  const particles = useMemo(() => {
    const arr: Vector3[] = [];
    for (let i = 0; i < particleCount; i++) {
      arr.push(new Vector3(from.x, from.y, from.z));
    }
    return arr;
  }, [from, particleCount]);

  particlesRef.current = particles;

  useFrame((state, delta) => {
    if (!isActive) return;

    particlesRef.current.forEach((p, i) => {
      // Move particle along line
      const t = ((state.clock.elapsedTime * animationSpeed + i / particleCount) % 1);
      p.lerpVectors(points[0], points[1], t);
    });
  });

  // Line color based on type
  const colorMap: Record<string, string> = {
    power: 'red',
    data: 'cyan',
    control: 'green',
    address: 'purple',
  };
  const lineColor = colorMap[type] || 'white';

  return (
    <group>
      {/* Line */}
      <line ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={points.length}
            array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={lineColor} linewidth={2} />
      </line>

      {/* Moving particles */}
      {particlesRef.current.map((p, idx) => (
        <mesh key={idx} position={p.toArray()}>
          <sphereGeometry args={[2, 8, 8]} />
          <meshStandardMaterial color={lineColor} emissive={lineColor} />
        </mesh>
      ))}
    </group>
  );
};

export default DataBus3D;