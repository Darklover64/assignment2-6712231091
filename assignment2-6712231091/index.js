import * as THREE from 'three'; // three จากที่กำหนดใน importmap
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import Stats from 'three/addons/libs/stats.module.js';
import { M3D, createLabel2D, FPS } from './utils-module.js';

document.addEventListener("DOMContentLoaded", main);

function main() {
	// ใช้ M3D ที่นำเข้ามา
	document.body.appendChild(M3D.renderer.domElement);
	document.body.appendChild(M3D.cssRenderer.domElement);

	M3D.renderer.setClearColor(0x333333); // กำหนดสีพื้นหลังของ renderer (canvas)
	M3D.renderer.setPixelRatio(window.devicePixelRatio); // ปรับความละเอียดของ renderer ให้เหมาะสมกับหน้าจอ
	M3D.renderer.shadowMap.enabled = true; // เปิดใช้งาน shadow map
	M3D.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // กำหนดประเภทของ shadow map
	M3D.renderer.physicallyCorrectLights = true; // เปิดใช้งานการคำนวณแสงแบบฟิสิกส์
	M3D.renderer.outputEncoding = THREE.sRGBEncoding; // กำหนดการเข้ารหัสสีของ renderer
	M3D.renderer.setAnimationLoop(animate); // ตั้งค่า animation loop

	// Prepaire objects here
	// TODO: วาดฉากทิวทัศน์ 3D ด้วย Three.js
	// ต้องมีครบ 6 อย่าง: ภูเขา, พระอาทิตย์, ท้องนา, ต้นไม้, บ้าน/กระท่อม, แม่น้ำ
	// องค์ประกอบอื่น ๆ เพิ่มเติมได้ตามต้องการ (เช่น ท้องฟ้า, ก้อนเมฆ ฯลฯ)

	M3D.scene = new THREE.Scene();

// =============== ท้องฟ้า ===============
const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
const skyMaterial = new THREE.MeshBasicMaterial({
	color: 0x87ceeb, // สีฟ้าอ่อน
	side: THREE.BackSide
});
const sky = new THREE.Mesh(skyGeometry, skyMaterial);
M3D.scene.add(sky);
// =============== ก้อนเมฆ (ไม่ใช้รูป) ===============
function createCloud() {
  const cloud = new THREE.Group();
  const cloudMaterial = new THREE.MeshLambertMaterial({
    color: 0xffffff, // สีขาวเมฆ
    transparent: true,
    opacity: 0.8,
  });

  const numParts = 3 + Math.floor(Math.random() * 3); // จำนวนก้อนในเมฆ 3-5 ก้อน
  for (let i = 0; i < numParts; i++) {
    const geometry = new THREE.SphereGeometry(
      Math.random() * 15 + 20, // ขนาดสุ่ม
      16,
      16
    );
    const sphere = new THREE.Mesh(geometry, cloudMaterial);

    sphere.position.set(
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 20
    );

    cloud.add(sphere);
  }

  return cloud;
}

// เพิ่มก้อนเมฆแบบสุ่มลงในฉาก
const cloudGroup = new THREE.Group();
M3D.scene.add(cloudGroup);

for (let i = 0; i < 10; i++) {
  const cloud = createCloud();

  const angle = Math.random() * Math.PI * 2;
  const radius = 350 + Math.random() * 100;
  const height = Math.random() * 100 + 50;

  cloud.position.set(
    radius * Math.cos(angle),
    height,
    radius * Math.sin(angle)
  );

  cloudGroup.add(cloud);
}
	// =============== พระอาทิตย์ ===============
const sunGeometry = new THREE.SphereGeometry(20, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffdd33, emissive: 0xffdd33 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.set(-100, 100, -200);
M3D.scene.add(sun);
let angle = 0;

function animate() {
  requestAnimationFrame(animate);

  // เคลื่อนที่เป็นวงกลม + ขึ้นลงเล็กน้อย
  angle += 0.005;
  const radius = 200;
  const heightOffset = 100;

  sun.position.x = radius * Math.cos(angle);
  sun.position.z = radius * Math.sin(angle);
  sun.position.y = heightOffset + 50 * Math.sin(angle * 0.5); // ขึ้นลงแบบโค้ง

  // render scene
  M3D.renderer.render(M3D.scene, M3D.camera);
}

// =============== ภูเขา ===============
// ฟังก์ชันสร้างภูเขาเดี่ยว (โค้งมน)
function createMountain(x, z, size) {
	const mountainGeometry = new THREE.SphereGeometry(size, 32, 32);
	const mountainMaterial = new THREE.MeshStandardMaterial({
		color: 0x556b2f,
		flatShading: true,
		roughness: 1,
		metalness: 0
	});

	const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
	mountain.scale.y = 0.6 + Math.random() * 0.2; // ปรับความโค้งให้แตกต่าง
	mountain.position.set(x, size * mountain.scale.y, z);
	mountain.castShadow = true;
	mountain.receiveShadow = true;

	// ทำให้พื้นผิวขรุขระเล็กน้อย
	const positions = mountain.geometry.attributes.position;
	for (let i = 0; i < positions.count; i++) {
		const offset = (Math.random() - 0.5) * 2; // สุ่มระยะ
		positions.setY(i, positions.getY(i) + offset);
	}
	positions.needsUpdate = true;

	return mountain;
}

// ฟังก์ชันสร้างเทือกเขา
function createMountainRange(startX, endX, z, count) {
	const group = new THREE.Group();

	for (let i = 0; i < count; i++) {
		const x = THREE.MathUtils.lerp(startX, endX, i / (count - 1));
		const size = 30 + Math.random() * 40; // ความใหญ่ของภูเขาแต่ละลูก
		const mountain = createMountain(x, z + Math.random() * 20 - 10, size);
		group.add(mountain);
	}

	return group;
}

// เพิ่มเทือกเขาเข้าฉาก
const mountainRange1 = createMountainRange(-120, 120, -120, 7);
M3D.scene.add(mountainRange1);

const mountainRange2 = createMountainRange(-140, 140, -150, 6);
mountainRange2.scale.set(1.1, 1.1, 1.1);
mountainRange2.position.y = 5; // อยู่สูงขึ้นเล็กน้อย (เป็นแนวหลัง)
M3D.scene.add(mountainRange2);


// =============== ท้องนา (พื้นหญ้า) ===============
const groundGeometry = new THREE.PlaneGeometry(400, 400);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
M3D.scene.add(ground);

// 4) ต้นไม้
	const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2);
	const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
	const leavesGeometry = new THREE.SphereGeometry(1, 16, 16);
	const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x006400 });
	// สร้างกลุ่มต้นไม้ (trunk + leaves)
	const tree = new THREE.Group();
	const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
	const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
	leaves.position.y = 1.5;
	tree.add(trunk);
	tree.add(leaves);
	tree.position.set(5, 0, -10);
	M3D.scene.add(tree);
	
	// สุ่มต้นไม้หลายต้นที่ไม่ทับกับบ้านglb และภูเขา และแม่น้ำ
	for (let i = 0; i < 20; i++) {
		const newTree = tree.clone();
		let x, z;
		do {
			x = Math.random() * 80 - 40; // สุ่มตำแหน่ง x ในช่วง -40 ถึง 40
			z = Math.random() * 80 - 40; // สุ่มตำแหน่ง z ในช่วง -40 ถึง 40
		} while (
			(x > -15 && x < 15 && z > -15 && z < 15) || // ไม่ทับกับบ้านglb
			(x > -15 && x < -5 && z > -25 && z < -15) || // ไม่ทับกับภูเขา
			(z > 15 && z < 25) // ไม่ทับกับแม่น้ำ
		);
		newTree.position.set(x, 0, z);
		newTree.scale.setScalar(0.5 + Math.random()); // สุ่มขนาดต้นไม้
		M3D.scene.add(newTree);
	}

// =============== บ้าน / กระท่อม ===============
const houseGroup = new THREE.Group();

// ---------------- ผนังหลัก ----------------
const wallGeometry = new THREE.BoxGeometry(15, 10, 15);
const wallMaterial = new THREE.MeshStandardMaterial({
	color: 0xffe4b5, // สีครีมอ่อน
	roughness: 0.9,
	metalness: 0.1
});

const wall = new THREE.Mesh(wallGeometry, wallMaterial);
wall.position.y = 5;
wall.castShadow = true;
wall.receiveShadow = true;
houseGroup.add(wall);

// ---------------- หลังคา ----------------
const roofGeometry = new THREE.ConeGeometry(9, 6, 4);
const roofMaterial = new THREE.MeshStandardMaterial({
	color: 0x8b0000,
	roughness: 0.8
});
const roof = new THREE.Mesh(roofGeometry, roofMaterial);
roof.position.y = 10.5;
roof.rotation.y = Math.PI / 4;
roof.castShadow = true;
roof.receiveShadow = true;
houseGroup.add(roof);

// ---------------- ประตู ----------------
const doorGeometry = new THREE.BoxGeometry(3, 5, 0.3);
const doorMaterial = new THREE.MeshStandardMaterial({
	color: 0x8b4513, // สีน้ำตาลไม้
	roughness: 0.9
});
const door = new THREE.Mesh(doorGeometry, doorMaterial);
door.position.set(0, 2.5, 7.6); // ด้านหน้าบ้าน
door.castShadow = true;
houseGroup.add(door);

// กรอบประตูเล็กน้อย (ตกแต่ง)
const doorFrameGeometry = new THREE.BoxGeometry(3.2, 5.2, 0.1);
const doorFrameMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
const doorFrame = new THREE.Mesh(doorFrameGeometry, doorFrameMaterial);
doorFrame.position.set(0, 2.5, 7.65);
houseGroup.add(doorFrame);

// ---------------- หน้าต่าง ----------------
function createWindow(x, y, z) {
	const windowFrameGeometry = new THREE.BoxGeometry(2.5, 2.5, 0.2);
	const windowFrameMaterial = new THREE.MeshStandardMaterial({
		color: 0x333333,
		metalness: 0.3,
		roughness: 0.6
	});
	const frame = new THREE.Mesh(windowFrameGeometry, windowFrameMaterial);
	frame.position.set(x, y, z);

	const glassGeometry = new THREE.PlaneGeometry(2.2, 2.2);
	const glassMaterial = new THREE.MeshStandardMaterial({
		color: 0x87ceeb,
		transparent: true,
		opacity: 0.5
	});
	const glass = new THREE.Mesh(glassGeometry, glassMaterial);
	glass.position.set(x, y, z + 0.11);

	houseGroup.add(frame);
	houseGroup.add(glass);
}

// หน้าต่างด้านหน้า
createWindow(-4, 6, 7.6);
createWindow(4, 6, 7.6);

// หน้าต่างด้านข้างซ้าย
createWindow(-7.6, 6, 4);
createWindow(-7.6, 6, -4);

// ---------------- พื้นบ้าน ----------------
const baseGeometry = new THREE.BoxGeometry(18, 1, 18);
const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xdeb887 });
const base = new THREE.Mesh(baseGeometry, baseMaterial);
base.position.y = 0.5;
base.receiveShadow = true;
houseGroup.add(base);

// ---------------- ตำแหน่งรวมของบ้าน ----------------
houseGroup.position.set(-50, 0, 40);
houseGroup.castShadow = true;
houseGroup.receiveShadow = true;
M3D.scene.add(houseGroup);

const riverMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x1e90ff,         // สีฟ้าใสน้ำ
  roughness: 0.2,          // ความขรุขระน้อย → ผิวน้ำเงา
  metalness: 0.1,
  transmission: 0.8,       // ทำให้เหมือนน้ำใส (ใช้ได้ใน MeshPhysicalMaterial)
  transparent: true,
  opacity: 0.9,
  clearcoat: 1.0,          // ผิวน้ำมีเงาเคลือบ
  clearcoatRoughness: 0.1
});

// =============== รูปร่างแม่น้ำ (แบ่งละเอียดเพื่อดัดคลื่น) ===============
const riverGeometry = new THREE.PlaneGeometry(200, 40, 100, 20); // 100x20 segments
const river = new THREE.Mesh(riverGeometry, riverMaterial);
river.rotation.x = -Math.PI / 2;
river.position.set(0, 0.1, 120);
river.receiveShadow = true;
M3D.scene.add(river);

// =============== แสงสว่างสำหรับแม่น้ำ ===============
const riverLight = new THREE.PointLight(0xffffff, 1, 400);
riverLight.position.set(0, 80, 100);
M3D.scene.add(riverLight);

// =============== สะพานข้ามแม่น้ำ ===============
const bridgeMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 }); // สีน้ำตาลไม้

// ตัวสะพาน (พื้นไม้)
const bridge = new THREE.Mesh(
  new THREE.BoxGeometry(90, 2, 10),
  bridgeMaterial
);
bridge.position.set(0, 5.5, 120); // วางเหนือแม่น้ำเล็กน้อย
bridge.receiveShadow = true;
bridge.castShadow = true;
M3D.scene.add(bridge);

// เสาสะพาน (4 ต้น)
const poleGeometry = new THREE.BoxGeometry(2, 6, 2);
const polePositions = [
  [-25, 3, 115],
  [25, 3, 115],
  [-25, 3, 125],
  [25, 3, 125],
];

for (let pos of polePositions) {
  const pole = new THREE.Mesh(poleGeometry, bridgeMaterial);
  pole.position.set(...pos);
  pole.castShadow = true;
  pole.receiveShadow = true;
  M3D.scene.add(pole);
}


// =============== แสงสว่าง ===============
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
M3D.scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(-100, 100, -100);
sunLight.castShadow = true;
M3D.scene.add(sunLight);

// =============== กล้องและคอนโทรล ===============
M3D.camera.position.set(80, 60, 120);
M3D.controls.target.set(0, 0, 0);
M3D.controls.update();

	
	// Stats
	const stats = new Stats(); // สร้าง Stats เพื่อตรวจสอบประสิทธิภาพ
	document.body.appendChild(stats.dom); // เพิ่ม Stats ลงใน body ของ HTML

	// GUI
	const gui = new GUI(); // สร้าง GUI สำหรับปรับแต่งค่าต่างๆ 

   let clock = new THREE.Clock();
	function animate() {
		M3D.controls.update(); // อัปเดต controls
		stats.update(); // อัปเดต Stats
		FPS.update(); // อัปเดต FPS
          
		// UPDATE state of objects here
		// TODO: อัปเดตสถานะของวัตถุต่างๆ ที่ต้องการในแต่ละเฟรม (เช่น การเคลื่อนที่, การหมุน ฯลฯ)
          cloudGroup.rotation.y += 0.0005; // หมุนเมฆเบา ๆ
          angle += 0.005;
          const radius = 200;
          const heightOffset = 100;

          sun.position.x = radius * Math.cos(angle);
          sun.position.z = radius * Math.sin(angle);
          sun.position.y = heightOffset + 50 * Math.sin(angle * 0.5); // ขึ้นลงแบบโค้ง
		const time = clock.getElapsedTime();
         const positionAttribute = river.geometry.attributes.position;
 
         for (let i = 0; i < positionAttribute.count; i++) {
         const x = positionAttribute.getX(i);
        const y = positionAttribute.getY(i);
         const wave = Math.sin(x * 0.2 + time * 1.5) * 0.3 + Math.sin(y * 0.5 + time) * 0.2;

        positionAttribute.setZ(i, wave); // เปลี่ยนความสูงคลื่น
  }

  positionAttribute.needsUpdate = true;
  river.geometry.computeVertexNormals(); // อัปเดต normals ให้แสงเงาเปลี่ยนตามผิวน้ำ


		// RENDER scene and camera
		M3D.renderer.render(M3D.scene, M3D.camera); // เรนเดอร์ฉาก
		M3D.cssRenderer.render(M3D.scene, M3D.camera); // เรนเดอร์ CSS2DRenderer
		console.log(`FPS: ${FPS.fps}`); // แสดงค่า FPS ในคอนโซล
	}
}