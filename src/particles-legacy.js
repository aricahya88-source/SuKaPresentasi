import { createShape, morphShape } from "./shapes.js";
export async function createParticles(canvas) {
  const count = innerWidth < 700 ? 720 : 1700,
    targets = Array.from({ length: 10 }, (_, i) => createShape(i, count));
  const current = targets[0].slice();
  let from = current.slice(),
    mode = 0,
    start = -2000,
    enabled = true,
    visible = !document.hidden,
    raf = 0,
    last = 0,
    rotation = 0,
    renderer = null,
    ctx = null,
    disposed = false;
  let rect = null;
  const mouse = { x: 0, y: 0 };
  let T, scene, camera, points, geometry, material, texture;
  // Bidang besar di belakang halaman, tanpa elemen/panggung pada materi.
  const refreshRect = () => {
    const mobile = innerWidth < 700;
    rect = {
      left: innerWidth * (mobile ? -0.05 : 0.2),
      top: -innerHeight * 0.05,
      width: innerWidth * (mobile ? 1.4 : 1.1),
      height: innerHeight * 1.1,
    };
  };
  const useCanvas = () => {
    renderer?.dispose();
    renderer = null;
    canvas.style.display = "none";
    const old = document.querySelector("#fallback-particles");
    old?.remove();
    const fallback = document.createElement("canvas");
    fallback.id = "fallback-particles";
    fallback.setAttribute("aria-hidden", "true");
    document.body.prepend(fallback);
    ctx = fallback.getContext("2d");
  };
  try {
    T = await import("three");
    renderer = new T.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    scene = new T.Scene();
    camera = new T.PerspectiveCamera(40, 1, 0.1, 50);
    camera.position.z = 6;
    geometry = new T.BufferGeometry();
    geometry.setAttribute("position", new T.BufferAttribute(current, 3));
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 32;
    const c = sprite.getContext("2d"),
      g = c.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, "#fff");
    g.addColorStop(0.2, "#fff");
    g.addColorStop(1, "transparent");
    c.fillStyle = g;
    c.fillRect(0, 0, 32, 32);
    texture = new T.CanvasTexture(sprite);
    material = new T.PointsMaterial({
      color: 0xffcb3d,
      size: 0.065,
      map: texture,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    points = new T.Points(geometry, material);
    scene.add(points);
    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      useCanvas();
      resize();
      requestTick();
    });
  } catch {
    useCanvas();
  }
  function resize() {
    refreshRect();
    if (renderer) renderer.setSize(innerWidth, innerHeight, false);
    if (ctx) {
      const dpr = Math.min(devicePixelRatio, 1.5);
      ctx.canvas.width = innerWidth * dpr;
      ctx.canvas.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }
  function paint() {
    if (!rect || rect.width <= 0) return;
    const dark = document.body.classList.contains("dark");
    const tilt = 0.19 + mouse.y * 0.12;
    const angle = rotation + mouse.x * 0.16;
    if (renderer) {
      renderer.setViewport(0, 0, innerWidth, innerHeight);
      renderer.clear();
      renderer.setViewport(
        rect.left,
        innerHeight - rect.top - rect.height,
        rect.width,
        rect.height,
      );
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      points.rotation.set(tilt, angle, mode === 1 ? -0.2 : 0);
      geometry.attributes.position.needsUpdate = true;
      material.color.setHex(dark ? 0xffd36a : 0x3e704b);
      renderer.render(scene, camera);
    } else if (ctx) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      const scale = Math.min(rect.width, rect.height) * 0.225,
        cy = Math.cos(angle),
        sy = Math.sin(angle),
        cx = Math.cos(tilt),
        sx = Math.sin(tilt);
      ctx.fillStyle = dark ? "#ffdc83" : "#34633e";
      for (let i = 0; i < count; i++) {
        let x = current[i * 3],
          y = current[i * 3 + 1],
          z = current[i * 3 + 2];
        const X = x * cy + z * sy,
          Z = -x * sy + z * cy,
          Y = y * cx - Z * sx,
          D = y * sx + Z * cx,
          perspective = 1 / (1 - D * 0.15);
        ctx.globalAlpha = 0.5 + (D + 2) * 0.12;
        ctx.beginPath();
        ctx.arc(
          rect.left + rect.width / 2 + X * scale * perspective,
          rect.top + rect.height / 2 + Y * scale * perspective,
          (innerWidth < 700 ? 1.35 : 1.65) * perspective,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }
  }
  function tick(now) {
    raf = 0;
    if (disposed || !visible) return;
    if (now - last < 32) {
      requestTick();
      return;
    }
    last = now;
    if (enabled) {
      morphShape(current, from, targets[mode], (now - start) / 2200);
      rotation += 0.0012;
    }
    paint();
    if (enabled) requestTick();
  }
  function requestTick() {
    if (!raf && !disposed && visible) raf = requestAnimationFrame(tick);
  }
  function setMode(next) {
    if (!Number.isInteger(next) || next < 0 || next >= targets.length) return;
    refreshRect();
    if (next !== mode) {
      from = current.slice();
      mode = next;
      start = performance.now();
      if (!enabled) current.set(targets[mode]);
    }
    requestTick();
    requestAnimationFrame(() => {
      refreshRect();
      requestTick();
    });
  }
  function setEnabled(value) {
    enabled = Boolean(value);
    if (!enabled) current.set(targets[mode]);
    else {
      from = current.slice();
      start = performance.now();
    }
    document.body.classList.toggle("still", !enabled);
    requestTick();
  }
  const move = (e) => {
    mouse.x = e.clientX / innerWidth - 0.5;
    mouse.y = e.clientY / innerHeight - 0.5;
  };
  const visibility = () => {
    visible = !document.hidden;
    if (visible) {
      refreshRect();
      requestTick();
    } else {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
  addEventListener("resize", () => {
    resize();
    requestTick();
  });
  addEventListener(
    "scroll",
    () => {
      refreshRect();
      requestTick();
    },
    { passive: true },
  );
  addEventListener("pointermove", move, { passive: true });
  document.addEventListener("visibilitychange", visibility);
  resize();
  requestTick();
  return {
    setMode,
    setEnabled,
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      document.removeEventListener("visibilitychange", visibility);
      geometry?.dispose();
      material?.dispose();
      texture?.dispose();
      renderer?.dispose();
      ctx?.canvas.remove();
    },
  };
}
