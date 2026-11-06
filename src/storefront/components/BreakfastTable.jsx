import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const COLOURS = {
  table: 0x5B7052,
  placemat: 0xEFE8D6,
  cup: 0xFFFFFF,
  cupShadow: 0xE7E2D8,
  coffee: 0x4B2E1B,
  foam: 0xF5F2EB,
  saucer: 0xFFFFFF,
  croissant: 0xD9A04A,
  croissantDark: 0xB47A3A,
  plate: 0xFFFFFF,
  cutlery: 0xC9C4B8,
  napkin: 0xF5F2EB,
  pistachio: 0x7FA356,
  bg: 0xF5F2EB,
};

export default function BreakfastTable() {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const rafRef = useRef(null);
  const objects = { camera: null, scene: null, renderer: null, group: null, steam: null };

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    let webgl = false;
    try {
      const probe = document.createElement('canvas');
      webgl = !!(probe.getContext('webgl') || probe.getContext('experimental-webgl'));
    } catch (err) {
      webgl = false;
    }

    if (!webgl) {
      canvas.style.display = 'none';
      return;
    }

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(COLOURS.bg, 1);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 2.4, 5);
    camera.lookAt(0, 0, 0);

    const ambient = new THREE.AmbientLight(0xFFFFFF, 0.55);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 0.9);
    keyLight.position.set(2, 5, 3);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0xFFE8D6, 0.5);
    fillLight.position.set(-2, 2, 2);
    scene.add(fillLight);

    const group = new THREE.Group();
    scene.add(group);

    const table = new THREE.Mesh(
      new THREE.BoxGeometry(7, 0.35, 4.5),
      new THREE.MeshStandardMaterial({ color: COLOURS.table, roughness: 0.85 })
    );
    table.position.y = -0.225;
    table.receiveShadow = true;
    group.add(table);

    const placemat = new THREE.Mesh(
      new THREE.PlaneGeometry(5.2, 3.4),
      new THREE.MeshStandardMaterial({ color: COLOURS.placemat, roughness: 0.9 })
    );
    placemat.rotation.x = -Math.PI / 2;
    placemat.position.y = -0.04;
    placemat.receiveShadow = true;
    group.add(placemat);

    const cup = new THREE.Group();
    const cupBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.55, 0.9, 24),
      new THREE.MeshStandardMaterial({ color: COLOURS.cup, roughness: 0.4 })
    );
    cupBody.position.y = 0.45;
    cupBody.castShadow = true;
    cup.add(cupBody);

    const cupBottom = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 0.04, 24),
      new THREE.MeshStandardMaterial({ color: COLOURS.cupShadow, roughness: 0.6 })
    );
    cupBottom.position.y = 0;
    cupBottom.castShadow = true;
    cup.add(cupBottom);

    const handle = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.035, 8, 24, Math.PI),
      new THREE.MeshStandardMaterial({ color: COLOURS.cupShadow, roughness: 0.5 })
    );
    handle.position.set(0.64, 0.45, 0);
    handle.rotation.z = Math.PI / 2;
    handle.castShadow = true;
    cup.add(handle);

    const coffee = new THREE.Mesh(
      new THREE.CylinderGeometry(0.46, 0.46, 0.28, 24),
      new THREE.MeshStandardMaterial({ color: COLOURS.coffee, roughness: 0.3 })
    );
    coffee.position.y = 0.62;
    coffee.castShadow = true;
    cup.add(coffee);

    const foamTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.47, 0.47, 0.05, 24),
      new THREE.MeshStandardMaterial({ color: COLOURS.foam, roughness: 0.7 })
    );
    foamTop.position.y = 0.775;
    cup.add(foamTop);

    cup.position.set(-1.1, -0.175, 0);
    cup.castShadow = true;
    group.add(cup);

    const saucer = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.85, 0.06, 32),
      new THREE.MeshStandardMaterial({ color: COLOURS.saucer, roughness: 0.5 })
    );
    saucer.position.set(-1.1, -0.2, 0);
    saucer.rotation.x = -Math.PI / 2;
    saucer.receiveShadow = true;
    group.add(saucer);

    const croissant = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.32, 0.11, 64, 8),
      new THREE.MeshStandardMaterial({ color: COLOURS.croissant, roughness: 0.7 })
    );
    body.scale.set(1, 0.55, 1);
    body.rotation.z = Math.PI / 4;
    body.castShadow = true;
    croissant.add(body);
    const tip = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 12, 12),
      new THREE.MeshStandardMaterial({ color: COLOURS.croissantDark, roughness: 0.7 })
    );
    tip.position.set(0.3, 0.05, 0);
    tip.castShadow = true;
    croissant.add(tip);
    croissant.position.set(1.0, -0.2, 0.2);
    croissant.rotation.y = 0.6;
    croissant.rotation.z = 0.2;
    group.add(croissant);

    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 0.95, 0.05, 32),
      new THREE.MeshStandardMaterial({ color: COLOURS.plate, roughness: 0.5 })
    );
    plate.position.set(1.0, -0.195, 0.2);
    plate.rotation.x = -Math.PI / 2;
    plate.receiveShadow = true;
    group.add(plate);

    const fork = new THREE.Group();
    const forkHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.7, 8),
      new THREE.MeshStandardMaterial({ color: COLOURS.cutlery, roughness: 0.3 })
    );
    forkHandle.rotation.z = Math.PI / 2;
    forkHandle.position.y = 0.35;
    forkHandle.castShadow = true;
    fork.add(forkHandle);
    const forkHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.03, 0.02),
      new THREE.MeshStandardMaterial({ color: COLOURS.cutlery, roughness: 0.3 })
    );
    forkHead.position.set(0, 0.7, 0);
    forkHead.castShadow = true;
    fork.add(forkHead);
    fork.position.set(1.55, -0.2, 0.35);
    fork.rotation.z = -0.4;
    fork.rotation.x = 0.2;
    group.add(fork);

    const knife = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.75, 0.025),
      new THREE.MeshStandardMaterial({ color: COLOURS.cutlery, roughness: 0.3 })
    );
    knife.position.set(1.85, -0.2, 0.15);
    knife.rotation.z = 0.3;
    knife.castShadow = true;
    group.add(knife);

    const napkin = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, 0.9),
      new THREE.MeshStandardMaterial({ color: COLOURS.napkin, roughness: 0.9 })
    );
    napkin.position.set(-1.9, -0.195, 0.3);
    napkin.rotation.x = -Math.PI / 2;
    napkin.rotation.z = 0.3;
    napkin.receiveShadow = true;
    group.add(napkin);

    const pistachios = new THREE.Group();
    const positions = [
      [-1.4, -0.19, -0.5], [-1.25, -0.19, -0.35], [-1.55, -0.19, -0.2],
      [-1.35, -0.19, 0.1], [-1.15, -0.19, -0.55], [-1.5, -0.19, -0.65],
    ];
    positions.forEach((pos) => {
      const nut = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 10, 10),
        new THREE.MeshStandardMaterial({ color: COLOURS.pistachio, roughness: 0.8 })
      );
      nut.position.set(...pos);
      nut.scale.set(1, 0.7, 1);
      nut.rotation.x = Math.random();
      nut.rotation.y = Math.random();
      nut.castShadow = true;
      pistachios.add(nut);
    });
    group.add(pistachios);

    const steamParticles = [];
    const steamGeo = new THREE.BufferGeometry();
    const steamPos = new Float32Array(40 * 3);
    const steamMat = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.06, transparent: true, opacity: 0.35 });
    const steam = new THREE.Points(steamGeo, steamMat);
    steam.position.set(-1.1, 0.95, 0);
    cup.add(steam);

    for (let i = 0; i < 40; i++) {
      steamParticles.push({ x: 0, y: 0, z: 0, life: Math.random(), speed: 0.01 + Math.random() * 0.02, drift: (Math.random() - 0.5) * 0.005 });
    }

    function updateSteam() {
      for (let i = 0; i < 40; i++) {
        const p = steamParticles[i];
        p.y -= p.speed;
        p.x += p.drift;
        p.life -= 0.008;
        if (p.life <= 0) {
          p.y = 0;
          p.life = 1;
          p.x = (Math.random() - 0.5) * 0.08;
          p.z = (Math.random() - 0.5) * 0.08;
        }
        steamPos[i * 3] = p.x;
        steamPos[i * 3 + 1] = p.y + 0.95;
        steamPos[i * 3 + 2] = p.z;
      }
      steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPos, 3));
      steamGeo.attributes.position.needsUpdate = true;
    }

    objects.camera = camera;
    objects.scene = scene;
    objects.renderer = renderer;
    objects.group = group;
    objects.steam = steam;

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', resize);

    let progress = 0;
    const scrollTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        progress = self.progress;
      },
    });

    function animate() {
      rafRef.current = window.requestAnimationFrame(animate);
      const t = window.performance.now() * 0.001;

      group.rotation.y = Math.sin(t * 0.3) * 0.02 + progress * 0.06;
      group.rotation.x = Math.cos(t * 0.2) * 0.015;

      cup.rotation.z = Math.sin(t * 0.5) * 0.01;

      updateSteam();

      camera.position.z = 5 + progress * 0.8;
      camera.position.y = 2.4 - progress * 0.2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      scrollTrigger.kill();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

      scene.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
          else child.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <section ref={sectionRef} className="home-section home-breakfast-table" aria-label="The breakfast table">
      <canvas ref={canvasRef} className="breakfast-table-canvas" />
      <div className="breakfast-table-fallback" aria-hidden="true">
        <div className="fallback-table" />
        <div className="fallback-cup" />
        <div className="fallback-coffee" />
        <div className="fallback-plate" />
        <div className="fallback-croissant" />
        <div className="fallback-cutlery" />
        <div className="fallback-napkin" />
        <div className="fallback-pistachio" />
        <div className="fallback-pistachio" style={{ left: '44%', top: '70%' }} />
      </div>
    </section>
  );
}
