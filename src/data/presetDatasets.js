/**
 * Preset Datasets for TSP Route Planning
 * Real-world geographic city clusters and classic TSPLIB instances.
 */

export const PRESET_DATASETS = {
  indiaMetro: {
    name: 'India Tech & Metro Hubs (10 Cities)',
    description: 'Major economic centers across India',
    recommendedExact: true,
    cities: [
      { id: 0, name: 'New Delhi', x: 420, y: 180 },
      { id: 1, name: 'Jaipur', x: 380, y: 220 },
      { id: 2, name: 'Lucknow', x: 530, y: 220 },
      { id: 3, name: 'Ahmedabad', x: 270, y: 320 },
      { id: 4, name: 'Kolkata', x: 670, y: 320 },
      { id: 5, name: 'Mumbai', x: 280, y: 440 },
      { id: 6, name: 'Pune', x: 310, y: 460 },
      { id: 7, name: 'Hyderabad', x: 440, y: 470 },
      { id: 8, name: 'Bengaluru', x: 410, y: 570 },
      { id: 9, name: 'Chennai', x: 470, y: 570 }
    ]
  },
  usMetros: {
    name: 'US Major Metros (14 Cities)',
    description: 'Transcontinental logistics route across the United States',
    recommendedExact: true,
    cities: [
      { id: 0, name: 'Seattle', x: 120, y: 90 },
      { id: 1, name: 'San Francisco', x: 80, y: 240 },
      { id: 2, name: 'Los Angeles', x: 120, y: 330 },
      { id: 3, name: 'Phoenix', x: 220, y: 340 },
      { id: 4, name: 'Denver', x: 340, y: 230 },
      { id: 5, name: 'Dallas', x: 450, y: 360 },
      { id: 6, name: 'Houston', x: 470, y: 410 },
      { id: 7, name: 'Minneapolis', x: 470, y: 140 },
      { id: 8, name: 'Chicago', x: 540, y: 180 },
      { id: 9, name: 'Atlanta', x: 610, y: 340 },
      { id: 10, name: 'Miami', x: 690, y: 460 },
      { id: 11, name: 'Washington DC', x: 680, y: 220 },
      { id: 12, name: 'New York', x: 720, y: 170 },
      { id: 13, name: 'Boston', x: 750, y: 130 }
    ]
  },
  europeCapitals: {
    name: 'European Capitals (12 Cities)',
    description: 'Central and Western European capital tour',
    recommendedExact: true,
    cities: [
      { id: 0, name: 'London', x: 240, y: 200 },
      { id: 1, name: 'Paris', x: 270, y: 280 },
      { id: 2, name: 'Brussels', x: 310, y: 230 },
      { id: 3, name: 'Amsterdam', x: 320, y: 180 },
      { id: 4, name: 'Berlin', x: 450, y: 190 },
      { id: 5, name: 'Prague', x: 460, y: 260 },
      { id: 6, name: 'Vienna', x: 500, y: 300 },
      { id: 7, name: 'Bern', x: 340, y: 350 },
      { id: 8, name: 'Rome', x: 430, y: 470 },
      { id: 9, name: 'Madrid', x: 150, y: 450 },
      { id: 10, name: 'Warsaw', x: 560, y: 180 },
      { id: 11, name: 'Dublin', x: 170, y: 180 }
    ]
  },
  small6: {
    name: 'Quick Demo: 6 Cities',
    description: 'Fast verification of Branch & Bound lower bounds',
    recommendedExact: true,
    cities: [
      { id: 0, name: 'Alpha', x: 150, y: 150 },
      { id: 1, name: 'Beta', x: 500, y: 120 },
      { id: 2, name: 'Gamma', x: 650, y: 350 },
      { id: 3, name: 'Delta', x: 480, y: 520 },
      { id: 4, name: 'Epsilon', x: 200, y: 480 },
      { id: 5, name: 'Zeta', x: 350, y: 300 }
    ]
  },
  clustered30: {
    name: 'Logistics Clusters (30 Cities)',
    description: 'Three regional clusters simulating distributed supply chain hubs',
    recommendedExact: false,
    cities: generateClusterPreset(30)
  },
  tsplibBays29: {
    name: 'TSPLIB Benchmark: bays29 (29 Cities)',
    description: 'Standard academic TSP benchmark instance (Bavaria)',
    recommendedExact: false,
    cities: [
      { id: 0, name: 'Bay-0', x: 107, y: 107 },
      { id: 1, name: 'Bay-1', x: 130, y: 125 },
      { id: 2, name: 'Bay-2', x: 156, y: 98 },
      { id: 3, name: 'Bay-3', x: 183, y: 82 },
      { id: 4, name: 'Bay-4', x: 209, y: 73 },
      { id: 5, name: 'Bay-5', x: 236, y: 73 },
      { id: 6, name: 'Bay-6', x: 262, y: 82 },
      { id: 7, name: 'Bay-7', x: 288, y: 98 },
      { id: 8, name: 'Bay-8', x: 314, y: 123 },
      { id: 9, name: 'Bay-9', x: 337, y: 157 },
      { id: 10, name: 'Bay-10', x: 356, y: 198 },
      { id: 11, name: 'Bay-11', x: 368, y: 243 },
      { id: 12, name: 'Bay-12', x: 372, y: 290 },
      { id: 13, name: 'Bay-13', x: 367, y: 337 },
      { id: 14, name: 'Bay-14', x: 354, y: 382 },
      { id: 15, name: 'Bay-15', x: 333, y: 423 },
      { id: 16, name: 'Bay-16', x: 305, y: 457 },
      { id: 17, name: 'Bay-17', x: 271, y: 482 },
      { id: 18, name: 'Bay-18', x: 233, y: 497 },
      { id: 19, name: 'Bay-19', x: 193, y: 500 },
      { id: 20, name: 'Bay-20', x: 153, y: 491 },
      { id: 21, name: 'Bay-21', x: 116, y: 471 },
      { id: 22, name: 'Bay-22', x: 83, y: 440 },
      { id: 23, name: 'Bay-23', x: 57, y: 400 },
      { id: 24, name: 'Bay-24', x: 40, y: 353 },
      { id: 25, name: 'Bay-25', x: 33, y: 303 },
      { id: 26, name: 'Bay-26', x: 37, y: 252 },
      { id: 27, name: 'Bay-27', x: 52, y: 203 },
      { id: 28, name: 'Bay-28', x: 77, y: 160 }
    ]
  }
};

function generateClusterPreset(total) {
  const centers = [
    { x: 200, y: 200, label: 'West' },
    { x: 600, y: 220, label: 'East' },
    { x: 400, y: 480, label: 'South' }
  ];
  const list = [];
  let id = 0;
  const perCluster = Math.floor(total / centers.length);

  centers.forEach((c, cIdx) => {
    for (let i = 0; i < perCluster; i++) {
      const angle = (i / perCluster) * 2 * Math.PI;
      const r = 40 + (i % 3) * 30;
      list.push({
        id: id,
        name: `${c.label}-${i + 1}`,
        x: Math.round(c.x + r * Math.cos(angle)),
        y: Math.round(c.y + r * Math.sin(angle))
      });
      id++;
    }
  });

  return list;
}

/**
 * Generates random uniform cities within canvas dimensions
 */
export function generateRandomCities(count, width = 800, height = 550) {
  const cities = [];
  const padding = 50;
  for (let i = 0; i < count; i++) {
    cities.push({
      id: i,
      name: `City ${i + 1}`,
      x: Math.round(padding + Math.random() * (width - 2 * padding)),
      y: Math.round(padding + Math.random() * (height - 2 * padding))
    });
  }
  return cities;
}

/**
 * Generates circular ring cities
 */
export function generateCircleCities(count, width = 800, height = 550) {
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) * 0.38;
  const cities = [];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI;
    cities.push({
      id: i,
      name: `Node ${i + 1}`,
      x: Math.round(cx + r * Math.cos(angle)),
      y: Math.round(cy + r * Math.sin(angle))
    });
  }
  return cities;
}
