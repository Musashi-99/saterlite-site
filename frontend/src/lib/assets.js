// Single source of truth for every marketing image slot.
// Drop a file with the given name into frontend/public/assets/ at (or above) the
// stated size and ratio and it is used automatically. If the file is missing or
// smaller than `minWidth`, the app falls back to a crisp procedural graphic
// instead of showing a blurry upscale.
export const ASSETS = {
  hero:      { src: '/assets/hero-earth.jpg',    ratio: '16 / 9',  minWidth: 1600, ideal: '2880×1620' },
  satellite: { src: '/assets/satellite.png',     ratio: '1 / 1',   minWidth: 480,  ideal: '1600×1600 (transparent PNG/WebP)' },
  horizon:   { src: '/assets/earth-horizon.jpg', ratio: '16 / 3',  minWidth: 1600, ideal: '2880×540' },
  intelMap:  { src: '/assets/coast.jpg',         ratio: '4 / 3',   minWidth: 1000, ideal: '1600×1200' },
  story:     { src: '/assets/glacier.jpg',       ratio: '16 / 10', minWidth: 1000, ideal: '1600×1000' },
  gov:       { src: '/assets/card-government.jpg',           ratio: '4 / 5',   minWidth: 700,  ideal: '1200×1500' },
  env:       { src: '/assets/card-environmental.jpg', ratio: '4 / 5',   minWidth: 800,  ideal: '1200×1500' },
  energy:    { src: '/assets/card-energy.jpg',        ratio: '4 / 5',   minWidth: 800,  ideal: '1200×1500' },
  maritime:  { src: '/assets/card-maritime.jpg',      ratio: '4 / 5',   minWidth: 800,  ideal: '1200×1500' },
  mission:   { src: '/assets/mission.jpg',       ratio: '3 / 1',   minWidth: 1600, ideal: '2880×960' },
}
