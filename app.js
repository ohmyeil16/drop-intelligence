const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

let points = [];
const stats = document.getElementById("stats");

const mapImg = new Image();
mapImg.src = "map.jpg";

// ---------- RESIZE ----------
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

// ---------- MAP ----------
function getMapTransform() {
  const scale = Math.min(
    canvas.width / mapImg.width,
    canvas.height / mapImg.height
  );

  const w = mapImg.width * scale;
  const h = mapImg.height * scale;

  const x = (canvas.width - w) / 2;
  const y = (canvas.height - h) / 2;

  return { scale, x, y, w, h };
}

mapImg.onload = () => draw();

// ---------- CLICK ----------
canvas.addEventListener("click", (e) => {
  if (points.length < 3) {
    points.push(screenToMap(e.clientX, e.clientY));
  }
});

// ---------- RESET ----------
function resetAll() {
  points = [];
}

// ---------- COORDS ----------
function screenToMap(x, y) {
  const t = getMapTransform();
  return {
    x: (x - t.x) / t.scale,
    y: (y - t.y) / t.scale
  };
}

function mapToScreen(p) {
  const t = getMapTransform();
  return {
    x: p.x * t.scale + t.x,
    y: p.y * t.scale + t.y
  };
}

// ---------- MATH ----------
function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// ---------- AUTO DROP ----------
function getBestDrop(a, b) {
  let best = { score: Infinity, point: a };

  for (let i = 0; i <= 30; i++) {
    const t = i / 30;

    const p = {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t
    };

    const score = Math.abs(t - 0.5);

    if (score < best.score) {
      best = { score, point: p };
    }
  }

  return best.point;
}

// ---------- DRAW ----------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!mapImg.width) return;

  const t = getMapTransform();
  ctx.drawImage(mapImg, t.x, t.y, t.w, t.h);

  // route
  if (points.length >= 2) {
    const a = mapToScreen(points[0]);
    const b = mapToScreen(points[1]);

    ctx.strokeStyle = "#60a5fa";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  // auto drop
  if (points.length >= 2) {
    const drop = getBestDrop(points[0], points[1]);
    const s = mapToScreen(drop);

    ctx.fillStyle = "#39ff88";
    ctx.beginPath();
    ctx.arc(s.x, s.y, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // points
  points.forEach((p, i) => {
    const s = mapToScreen(p);
    const colors = ["#ff3b3b", "#3b82ff", "#39ff88"];

    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.arc(s.x, s.y, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  updateUI();
}

// ---------- UI ----------
function updateUI() {
  if (points.length === 0) {
    stats.innerHTML = "Click 3 points:<br>START → END → DROP";
    return;
  }

  if (points.length === 1) {
    stats.innerHTML = "Select END point";
    return;
  }

  if (points.length === 2) {
    stats.innerHTML = "Select DROP (or use Auto Drop)";
    return;
  }

  stats.innerHTML =
    "System Ready<br>Auto Drop Active<br>Analysis Complete";
}

// ---------- LOOP ----------
function loop() {
  draw();
  requestAnimationFrame(loop);
}

loop();