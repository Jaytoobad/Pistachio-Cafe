import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const COLOURS = {
  table: 0x5B7052,
  placemat: 0xEFE8D6,
  coffee: 0x3E2723,
  foam: 0xF5F2EB,
  saucer: 0xFFFFFF,
  croissant: 0xD9A04A,
  croissantDark: 0xB47A3A,
  plate: 0xFFFFFF,
  cutlery: 0xC9C4B8,
  napkin: 0xF5F2EB,
  pistachio: 0x7FA356,
  bg: 0xF5F2EB,
  ground: 0xE7E2D8,
};

const SEGMENTS = 32;

export default function BreakfastTable() {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    let webgl = false;
    try {
      webgl = !!(document.createElement('canvas').getContext('webgl') || document.createElement('canvas').getContext('experimental-webgl'));
    } catch (err) {
      webgl = false;
    }

    if (!webgl) {
      canvas.style.display = 'none';
      return;
    }

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(1);
    renderer.setClearColor(COLOURS.bg, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 2.6, 5.2);
    camera.lookAt(0, -0.3, 0);

    const ambient = new THREE.AmbientLight(0xFFFFFF, 0.5);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    keyLight.position.set(2.5, 6, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0xFFEADA, 0.45);
    fillLight.position.set(-2.5, 2, 2);
    scene.add(fillLight);

    const group = new THREE.Group();
    scene.add(group);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({ color: COLOURS.ground, roughness: 1.0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.7;
    ground.receiveShadow = true;
    group.add(ground);

    const table = new THREE.Mesh(
      new THREE.BoxGeometry(6.4, 0.4, 4.2),
      new THREE.MeshStandardMaterial({ color: COLOURS.table, roughness: 0.85 })
    );
    table.position.y = -0.5;
    table.castShadow = true;
    table.receiveShadow = true;
    group.add(table);

    const placemat = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 3.0),
      new THREE.MeshStandardMaterial({ color: COLOURS.placemat, roughness: 0.95 })
    );
    placemat.rotation.x = -Math.PI / 2;
    placemat.position.y = -0.298;
    placemat.receiveShadow = true;
    group.add(placemat);

    const saucer = new THREE.Mesh(
      new THREE.CylinderGeometry(0.92, 0.92, 0.07, SEGMENTS),
      new THREE.MeshStandardMaterial({ color: COLOURS.saucer, roughness: 0.45 })
    );
    saucer.position.set(-1.2, -0.5, 0);
    saucer.rotation.x = -Math.PI / 2;
    saucer.receiveShadow = true;
    group.add(saucer);

    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(1.05, 1.05, 0.06, SEGMENTS),
      new THREE.MeshStandardMaterial({ color: COLOURS.plate, roughness: 0.4 })
    );
    plate.position.set(1.15, -0.497, 0.15);
    plate.rotation.x = -Math.PI / 2;
    plate.receiveShadow = true;
    group.add(plate);

    const croissantBody = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.34, 0.10, 64, 10),
      new THREE.MeshStandardMaterial({ color: COLOURS.croissant, roughness: 0.8 })
    );
    croissantBody.scale.set(1, 0.5, 1);
    croissantBody.rotation.z = Math.PI / 5;
    croissantBody.castShadow = true;
    croissantBody.receiveShadow = true;
    croissantBody.position.set(0.15, 0.02, 0);

    const croissantTip = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 14, 14),
      new THREE.MeshStandardMaterial({ color: COLOURS.croissantDark, roughness: 0.8 })
    );
    croissantTip.position.set(0.28, 0.06, 0);
    croissantTip.castShadow = true;
    croissantTip.receiveShadow = true;

    const croissant = new THREE.Group();
    croissant.add(croissantBody);
    croissant.add(croissantTip);
    croissant.position.set(1.15, -0.5, 0.15);
    croissant.rotation.y = 0.5;
    croissant.rotation.z = 0.15;
    croissant.castShadow = true;
    group.add(croissant);

    const fork = new THREE.Group();
    const forkHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.68, 10),
      new THREE.MeshStandardMaterial({ color: COLOURS.cutlery, roughness: 0.25, metalness: 0.6 })
    );
    forkHandle.rotation.z = Math.PI / 2;
    forkHandle.position.y = 0.34;
    forkHandle.castShadow = true;
    fork.add(forkHandle);
    const forkHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.025, 0.018),
      new THREE.MeshStandardMaterial({ color: COLOURS.cutlery, roughness: 0.25, metalness: 0.6 })
    );
    forkHead.position.set(0, 0.66, 0);
    forkHead.castShadow = true;
    fork.add(forkHead);
    fork.position.set(1.75, -0.5, 0.35);
    fork.rotation.z = -0.35;
    fork.rotation.x = 0.15;
    fork.castShadow = true;
    group.add(fork);

    const knife = new THREE.Mesh(
      new THREE.BoxGeometry(0.018, 0.72, 0.024),
      new THREE.MeshStandardMaterial({ color: COLOURS.cutlery, roughness: 0.25, metalness: 0.6 })
    );
    knife.position.set(1.95, -0.5, 0.18);
    knife.rotation.z = 0.25;
    knife.castShadow = true;
    group.add(knife);

    const napkin = new THREE.Mesh(
      new THREE.PlaneGeometry(0.75, 0.85),
      new THREE.MeshStandardMaterial({ color: COLOURS.napkin, roughness: 0.95 })
    );
    napkin.position.set(-2.05, -0.497, 0.25);
    napkin.rotation.x = -Math.PI / 2;
    napkin.rotation.z = 0.25;
    napkin.receiveShadow = true;
    group.add(napkin);

    const pistachios = new THREE.Group();
    const positions = [
      [-1.7, -0.497, -0.5], [-1.5, -0.497, -0.3], [-1.85, -0.497, -0.15],
      [-1.6, -0.497, 0.1], [-1.4, -0.497, -0.55], [-1.75, -0.497, -0.65],
    ];
    positions.forEach((pos) => {
      const nut = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 12, 12),
        new THREE.MeshStandardMaterial({ color: COLOURS.pistachio, roughness: 0.85 })
      );
      nut.position.set(...pos);
      nut.scale.set(1, 0.65, 1);
      nut.rotation.x = Math.random();
      nut.rotation.y = Math.random();
      nut.castShadow = true;
      pistachios.add(nut);
    });
    group.add(pistachios);

    const steamParticles = [];
    const steamGeo = new THREE.BufferGeometry();
    const steamPos = new Float32Array(40 * 3);
    const steamMat = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.05, transparent: true, opacity: 0.3 });
    const steam = new THREE.Points(steamGeo, steamMat);
    steam.position.set(-1.2, 0.45, 0);
    group.add(steam);

    for (let i = 0; i < 40; i++) {
      steamParticles.push({
        x: 0, y: 0, z: 0, life: Math.random(),
        speed: 0.012 + Math.random() * 0.018,
        drift: (Math.random() - 0.5) * 0.004,
      });
    }

    function updateSteam() {
      for (let i = 0; i < 40; i++) {
        const p = steamParticles[i];
        p.y -= p.speed;
        p.x += p.drift;
        p.life -= 0.007;
        if (p.life <= 0) {
          p.y = 0;
          p.life = 1;
          p.x = (Math.random() - 0.5) * 0.07;
          p.z = (Math.random() - 0.5) * 0.07;
        }
        steamPos[i * 3] = p.x;
        steamPos[i * 3 + 1] = p.y + 0.85;
        steamPos[i * 3 + 2] = p.z;
      }
      steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPos, 3));
      steamGeo.attributes.position.needsUpdate = true;
    }

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      render();
    };
    window.addEventListener('resize', resize);

    let progress = 0;
    const scrollTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        progress = self.progress;
        render();
      },
    });

    function render() {
      const t = window.performance.now() * 0.001;

      group.rotation.y = Math.sin(t * 0.25) * 0.01 + progress * 0.02;
      group.rotation.x = Math.cos(t * 0.18) * 0.005;

      camera.position.z = 5.2 + progress * 0.4;
      camera.position.y = 2.6 - progress * 0.1;
      camera.lookAt(0, -0.3, 0);

      renderer.render(scene, camera);
    }
    render();

    return () => {
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
      <div className="breakfast-table-title-veil" aria-hidden="true" />
      <h2 id="home-breakfast-table-title" className="home-breakfast-table-title">
        The breakfast table
      </h2>
      <div className="breakfast-table-cup">
        <video
          className="breakfast-table-cup-video"
          poster="/images/home/cup-steam.jpg"
          playsInline
          autoPlay
          muted
          loop
        >
          <source src="/videos/cup-steam.webm" type="video/webm" />
          <source src="/videos/cup-steam.mp4" type="video/mp4" />
        </video>
      </div>
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
