// Decorative hand-cut stone texture (from the team's stone design) on the page background.
// Cards sit on top, so the stones only show in the beige/dark spaces around them.
// To remove it: delete this file and the <StoneWall /> line in app/layout.tsx.

// Same "random" stones every time, so the server and browser draw the same texture.
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

// One stone: a rounded, slightly uneven box, like a hand-cut block.
function stonePath(rnd: () => number, x: number, y: number, w: number, h: number) {
  const j = () => (rnd() - 0.5) * Math.min(w, h) * 0.22;
  const pts = [
    [x + j(), y + j()], [x + w / 2 + j(), y + j() / 2], [x + w + j(), y + j()], [x + w + j() / 2, y + h / 2 + j()],
    [x + w + j(), y + h + j()], [x + w / 2 + j(), y + h + j() / 2], [x + j(), y + h + j()], [x + j() / 2, y + h / 2 + j()],
  ];
  const mid = (a: number[], b: number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const f = (n: number) => n.toFixed(1);
  const start = mid(pts[0], pts[1]);
  let d = `M${f(start[0])} ${f(start[1])}`;
  for (let i = 1; i <= pts.length; i++) {
    const corner = pts[i % pts.length];
    const next = mid(corner, pts[(i + 1) % pts.length]);
    d += ` Q${f(corner[0])} ${f(corner[1])} ${f(next[0])} ${f(next[1])}`;
  }
  return d + "Z";
}

// One square tile of stones in rows. Every row fills the tile edge to edge, so tiles
// repeat side by side without visible seams. Bigger numbers = bigger stones.
const TILE = 560;
function buildTile() {
  const rnd = seeded(11);
  const gap = 10;
  const paths: string[] = [];
  for (let y = 0; y < TILE - 20; ) {
    const h = Math.min(36 + rnd() * 44, TILE - y);
    for (let x = 0; x < TILE - 20; ) {
      const w = Math.min(60 + rnd() * 110, TILE - x);
      paths.push(stonePath(rnd, x + gap / 2, y + gap / 2, w - gap, h - gap));
      x += w;
    }
    y += h;
  }
  return paths;
}

const STONES = buildTile();

export default function StoneWall() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full text-mint opacity-[0.06] light:opacity-[0.09]"
    >
      <defs>
        <pattern id="grove-stones" width={TILE} height={TILE} patternUnits="userSpaceOnUse">
          {STONES.map((d, i) => (
            <path key={i} d={d} fill="currentColor" />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grove-stones)" />
    </svg>
  );
}
