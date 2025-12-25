import * as THREE from 'three';

export const COLORS = {
  PINE_GREEN: "#0f3824",      // Deep Forest Green
  VIBRANT_GREEN: "#1a5e3a",   // Classic Christmas Green
  SANTA_RED: "#d90429",       // Bright Christmas Red
  BERRY_RED: "#6d071a",       // Deep Burgundy
  SNOW_WHITE: "#f8f9fa",      // Snowy White
  CLASSIC_GOLD: "#ffd700",    // Standard Gold
  CHAMPAGNE_GOLD: "#d4af37",  // Metallic Gold
  WARM_LIGHT: "#fff3cd",      // Warm light
  MIDNIGHT: "#02040a"         // Deep black-blue
};

export const PALETTES = {
  FOLIAGE: [COLORS.PINE_GREEN, COLORS.VIBRANT_GREEN, "#052012"],
  ORNAMENTS_BALLS: [COLORS.SANTA_RED, COLORS.CLASSIC_GOLD, COLORS.SNOW_WHITE, COLORS.BERRY_RED],
  ORNAMENTS_GIFTS: [COLORS.BERRY_RED, COLORS.CHAMPAGNE_GOLD, COLORS.SNOW_WHITE],
  LIGHTS: [COLORS.WARM_LIGHT, COLORS.CLASSIC_GOLD]
};

export const SETTINGS = {
  TREE_HEIGHT: 14,
  TREE_RADIUS: 5,
  PARTICLE_COUNT: 12000,
  ORNAMENT_BALL_COUNT: 150,
  ORNAMENT_GIFT_COUNT: 40,
  LIGHTS_COUNT: 300,
  CHAOS_RADIUS: 25, // How far particles scatter
};

// Helper to get random point in sphere
export const getRandomSpherePoint = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  const x = r * sinPhi * Math.cos(theta);
  const y = r * sinPhi * Math.sin(theta);
  const z = r * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

// Helper to get point on a cone (tree shape)
export const getTreePoint = (height: number, maxRadius: number, yRatio: number): THREE.Vector3 => {
  // yRatio is 0 (bottom) to 1 (top)
  const y = yRatio * height - (height / 2); // Center vertically
  const r = maxRadius * (1 - yRatio); // Taper to top
  const angle = Math.random() * Math.PI * 2;
  
  // Add some thickness to the tree volume
  const volumeR = r * Math.sqrt(Math.random()); 
  
  const x = volumeR * Math.cos(angle);
  const z = volumeR * Math.sin(angle);
  return new THREE.Vector3(x, y, z);
};