import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DataTrace3DProps {
  from: { x: number; y: number; z: number };
  to: { x: number; y: number; z: number };
  isActive: boolean;
  type: 'power' | 'data' | 'control';
}

const DataTrace3D: React.FC<DataTrace3DProps> = ({ from, to, isActive, type }) => {
  const particlesRef = useRef<THREE.Points>(null);
  const lineRef = useRef<THREE.Line>(null);

  const fromPos = new THREE.Vector3(
    (from.x - 350) / 100,
    from.z / 100 + 0.5,
    -(from.y - 250) / 100
  );
  const toPos = new THREE.Vector3(
    (to.x - 350) / 100,
    to.z / 100 + 0.5,
    -(to.y - 250) / 100
  );

  const midPoint = new THREE.Vector3().lerpVectors(fromPos, toPos, 0.5);
  midPoint.y += 0.5;

  const curve = useMemo(() => {
    return new THREE.QuadraticBezierCurve3(fromPos, midPoint, toPos);
  }, [fromPos.x, fromPos.y, fromPos.z, toPos.x, toPos.y, toPos.z]);

  const points = curve.getPoints(50);
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

  const particleCount = isActive ? 20 : 0;
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const point = curve.getPoint(t);
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    }
    return positions;
  }, [particleCount, curve]);

  const particleGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    return geometry;
  }, [particlePositions]);

  const getColor = () => {
    switch (type) {
      case 'power': return '#ef4444';
      case 'data': return '#3b82f6';
      case 'control': return '#10b981';
      default: return '#6b7280';
    }
  };

  useFrame((state) => {
    if (particlesRef.current && isActive) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const time = state.clock.getElapsedTime();

      for (let i = 0; i < particleCount; i++) {
        const t = ((i / particleCount) + time * 0.3) % 1;
        const point = curve.getPoint(t);
        positions[i * 3] = point.x;
        positions[i * 3 + 1] = point.y;
        positions[i * 3 + 2] = point.z;
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      <line ref={lineRef} geometry={lineGeometry}>
        <lineBasicMaterial
          color={getColor()}
          linewidth={2}
          opacity={isActive ? 0.6 : 0.2}
          transparent
        />
      </line>

      {isActive && particleCount > 0 && (
        <points ref={particlesRef} geometry={particleGeometry}>
          <pointsMaterial
            size={0.08}
            color={getColor()}
            sizeAttenuation={true}
            transparent
            opacity={0.8}
          />
        </points>
      )}
    </group>
  );
};

export default DataTrace3D;
