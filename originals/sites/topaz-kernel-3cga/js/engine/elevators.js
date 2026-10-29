/* Elevators: glass shafts per core, moving cars with floor indicators, doors per floor. Cars carry riders when a person's
   route goes vertical through a core, and otherwise run an ambient schedule. Visible for the focused (cut-away) building. */
(function () {
  const MSK = (window.MSK = window.MSK || {});
  const EL = (MSK.elevators = { banks: [] });
  let THREE, W;
  const CAR_W = 3.2, CAR_D = 3.0, CAR_H = 2.8, SPEED = 4.2;

  EL.init = function () {
    THREE = window.THREE; W = MSK.world;
    const glass = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.07, depthWrite: false, side: THREE.DoubleSide });
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.55 });
    MSK.campus.buildings.forEach((b) => {
      const lv = b.levels.map((l) => l.n).sort((a, c) => a - c);
      const yMin = b.levelMap[lv[0]].y, yMax = b.levelMap[lv[lv.length - 1]].y + b.floorH;
      b.cores.forEach((c) => {
        const L0 = b.levelMap[1] || b.levelMap[lv[0]];
        const shaftZ = L0.zc - 8.5; const offs = c.cars || [0];
        const width = Math.max(9.4, offs.length * (CAR_W + 1.6) + 1);
        const g = new THREE.Group(); g.visible = false; W.scene.add(g);
        const H = yMax - yMin;
        const shaftGeo = new THREE.BoxGeometry(width, H, 8.4); shaftGeo.translate(c.x, yMin + H / 2, shaftZ);
        g.add(new THREE.Mesh(shaftGeo, glass));
        g.add(new THREE.LineSegments(new THREE.EdgesGeometry(shaftGeo), edgeMat));
        // floor rings + doors
        const ringPts = []; const doors = {};
        lv.forEach((n) => {
          const L = b.levelMap[n]; const y = L.y;
          const x0 = c.x - width / 2, x1 = c.x + width / 2, z0 = shaftZ - 4.2, z1 = shaftZ + 4.2;
          ringPts.push(x0, y, z0, x1, y, z0, x1, y, z0, x1, y, z1, x1, y, z1, x0, y, z1, x0, y, z1, x0, y, z0);
          doors[n] = offs.map((o) => {
            const d = new THREE.Mesh(new THREE.PlaneGeometry(CAR_W - 0.4, CAR_H - 0.2), new THREE.MeshBasicMaterial({ color: 0xbfe9ff, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }));
            d.position.set(c.x + o, y + CAR_H / 2, z1 + 0.02); g.add(d); return d;
          });
        });
        const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.Float32BufferAttribute(ringPts, 3));
        g.add(new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 })));
        // cars
        const cars = offs.map((o, i) => {
          const car = new THREE.Group();
          const body = new THREE.Mesh(new THREE.BoxGeometry(CAR_W, CAR_H, CAR_D), new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.22, depthWrite: false }));
          body.position.y = CAR_H / 2; car.add(body);
          car.add(new THREE.LineSegments(new THREE.EdgesGeometry(body.geometry).translate(0, CAR_H / 2, 0), new THREE.LineBasicMaterial({ color: 0xa5f3fc })));
          const lamp = new THREE.Mesh(new THREE.BoxGeometry(CAR_W * 0.8, 0.12, CAR_D * 0.8), new THREE.MeshBasicMaterial({ color: 0xe0f7ff })); lamp.position.y = CAR_H - 0.1; car.add(lamp);
          const floorPlate = new THREE.Mesh(new THREE.BoxGeometry(CAR_W, 0.15, CAR_D), new THREE.MeshBasicMaterial({ color: 0x0b3a52 })); car.add(floorPlate);
          const lbl = W.css2d('<b>1</b>', 'lbl lbl-elev'); lbl.position.set(0, CAR_H + 1.2, 0); car.add(lbl);
          const startN = lv[(i * 5 + 1) % lv.length];
          car.position.set(c.x + o, b.levelMap[startN].y, shaftZ);
          g.add(car);
          return { car, lbl, x: c.x + o, y: car.position.y, target: car.position.y, dwell: 1 + i * 2, rider: null, riderT: 0, idx: i };
        });
        EL.banks.push({ b, core: c, g, cars, doors, levels: lv, shaftZ, width });
      });
    });
    MSK.bus.on('focus:level', ({ b }) => EL.banks.forEach((k) => { k.g.visible = !!b && k.b.id === b; }));
    W.ticks.push(update);
  };

  function levelOf(bank, y) { let best = bank.levels[0], bd = 1e9; bank.levels.forEach((n) => { const d = Math.abs(bank.b.levelMap[n].y - y); if (d < bd) { bd = d; best = n; } }); return best; }
  EL.find = function (x, z) {
    for (const k of EL.banks) for (const c of k.cars) if (Math.abs(c.x - x) < 1.2 && Math.abs(k.shaftZ - z) < 2.5) return { bank: k, car: c };
    return null;
  };
  // an actor is riding: lock car to their height
  EL.ride = function (x, z, y, name) {
    const f = EL.find(x, z); if (!f) return;
    f.car.rider = name || 'rider'; f.car.riderT = 1.2; f.car.y = y; f.car.target = y;
  };
  // an actor is about to board at height y: bring the car there
  EL.call = function (x, z, y) { const f = EL.find(x, z); if (f && !f.car.rider) { f.car.target = y; f.car.dwell = 2.5; } };

  function update(dt) {
    const sp = MSK.director ? Math.max(1, MSK.director.speed()) : 1;
    EL.banks.forEach((k) => {
      k.cars.forEach((c) => {
        if (c.riderT > 0) { c.riderT -= dt; if (c.riderT <= 0) { c.rider = null; c.dwell = 3; } }
        else if (Math.abs(c.target - c.y) < 0.05) {
          c.dwell -= dt;
          if (c.dwell <= 0) { const n = k.levels[Math.floor(Math.random() * k.levels.length)]; c.target = k.b.levelMap[n].y; c.dwell = 2 + Math.random() * 4; }
        } else { const d = c.target - c.y; c.y += Math.sign(d) * Math.min(Math.abs(d), SPEED * sp * dt); }
        c.car.position.y = c.y;
        if (!k.g.visible) return;
        const n = levelOf(k, c.y); const moving = Math.abs(c.target - c.y) > 0.05 || c.rider;
        const dir = c.target > c.y + 0.05 ? '▲ ' : c.target < c.y - 0.05 ? '▼ ' : '';
        const txt = `${dir}${k.b.levelMap[n].label}${c.rider ? ' · ' + c.rider : ''}`;
        if (c._txt !== txt) { c._txt = txt; c.lbl.userData.el.innerHTML = `<b>${MSK.util.esc(txt)}</b>`; c.lbl.userData.el.classList.toggle('busy', !!c.rider); }
        // doors open when a car rests at a floor
        k.levels.forEach((ln) => { const door = k.doors[ln][c.idx]; const at = Math.abs(k.b.levelMap[ln].y - c.y) < 0.2 && !moving; door.material.opacity += ((at ? 0.04 : 0.35) - door.material.opacity) * Math.min(1, dt * 6); door.scale.x += ((at ? 0.15 : 1) - door.scale.x) * Math.min(1, dt * 6); });
      });
    });
  }
})();
