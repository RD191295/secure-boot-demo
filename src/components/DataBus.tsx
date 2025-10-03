import React from 'react';

interface DataBusProps {
  id: string;
  from: { x: number; y: number; z?: number };
  to: { x: number; y: number; z?: number };
  isActive: boolean;
  isVisible: boolean;
  type: 'control' | 'data';
  data: string;
  animationSpeed: number;
  offsetIndex?: number;  // NEW: helps stagger multiple buses
}

const DataBus: React.FC<DataBusProps> = ({
  id,
  from,
  to,
  isActive,
  isVisible,
  type,
  data,
  animationSpeed,
  offsetIndex = 0
}) => {
  if (!isVisible) return null;

  // Midpoint
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  // Vector direction
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  // Normal vector (perpendicular) for outward offset
  const length = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;

  // Stagger offset (so multiple buses curve outward differently)
  const spacing = 20; // distance between parallel buses
  const offset = (offsetIndex % 3 - 1) * spacing; // -20, 0, +20

  const c1 = { x: midX + nx * offset, y: from.y + ny * offset };
  const c2 = { x: midX + nx * offset, y: to.y + ny * offset };

  const pathData = `M ${from.x},${from.y} C ${c1.x},${c1.y} ${c2.x},${c2.y} ${to.x},${to.y}`;

  return (
    <svg
      className="absolute overflow-visible pointer-events-none"
      style={{ left: 0, top: 0, width: '100%', height: '100%' }}
    >
      <path
        d={pathData}
        fill="none"
        stroke={
          isActive
            ? type === 'control'
              ? '#facc15' // yellow
              : '#3b82f6' // blue
            : '#6b7280'   // gray
        }
        strokeWidth={isActive ? 3 : 2}
        strokeDasharray={isActive ? '6,4' : '0'}
        style={{
          animation: isActive ? `dash ${animationSpeed}s linear infinite` : 'none'
        }}
      />
      {isActive && (
        <text
          x={midX + nx * (offset + 10)}
          y={midY + ny * (offset + 10)}
          fill="white"
          fontSize="12"
          textAnchor="middle"
        >
          {data}
        </text>
      )}
    </svg>
  );
};

export default DataBus;