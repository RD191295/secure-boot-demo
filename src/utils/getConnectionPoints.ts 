// src/utils/getConnectionPoints.ts

interface Position {
  x: number;
  y: number;
  z: number;
}

interface Size {
  width: number;
  height: number;
  depth: number;
}

interface Module {
  id: string;
  position: Position;
  size: Size;
}

/**
 * Compute the closest edge-to-edge connection points between two rectangular modules.
 * This avoids bus lines going through the middle of the modules.
 */
export function getConnectionPoints(fromModule: Module, toModule: Module) {
  const fromCenter = {
    x: fromModule.position.x,
    y: fromModule.position.y,
    z: fromModule.position.z
  };
  const toCenter = {
    x: toModule.position.x,
    y: toModule.position.y,
    z: toModule.position.z
  };

  const dx = toCenter.x - fromCenter.x;
  const dy = toCenter.y - fromCenter.y;

  // Pick edge on "from" module
  let from: Position = { ...fromCenter };
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal connection
    from.x += dx > 0 ? fromModule.size.width / 2 : -fromModule.size.width / 2;
  } else {
    // Vertical connection
    from.y += dy > 0 ? fromModule.size.height / 2 : -fromModule.size.height / 2;
  }

  // Pick edge on "to" module
  let to: Position = { ...toCenter };
  if (Math.abs(dx) > Math.abs(dy)) {
    to.x += dx > 0 ? -toModule.size.width / 2 : toModule.size.width / 2;
  } else {
    to.y += dy > 0 ? -toModule.size.height / 2 : toModule.size.height / 2;
  }

  return { from, to };
}