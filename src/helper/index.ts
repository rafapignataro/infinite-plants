import * as THREE from 'three';

export const setupGame = () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1280/720, 0.1, 1000);
  
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(854, 480);
  
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: '#e84393' });
  const cube = new THREE.Mesh(geometry, material);
  
  scene.add(cube);
  
  camera.position.z = 5;

  const gameContainer = document.querySelector('.game-container');

  gameContainer?.appendChild(renderer.domElement);

  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render( scene, camera );
  
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
  }

  animate();
}