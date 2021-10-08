import * as THREE from 'three';

export const setupGame = () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1280/720, 0.1, 1000);
  
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(854, 480);

  const Cube = (color: string) => {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color });
    const cube = new THREE.Mesh(geometry, material);
    
    scene.add(cube);

    return cube;
  }

  const Line = () => {
    const material = new THREE.LineBasicMaterial({ color: '#686de0' });

    const points = [];
    points.push(new THREE.Vector3( 0, 0, 0 ));
    points.push(new THREE.Vector3( 2.5, 0, 0 ));
    points.push(new THREE.Vector3( 1.25, 2.5, 0 ));
    points.push(new THREE.Vector3( 0, 0, 0 ));

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const line = new THREE.Line(geometry, material);

    scene.add(line);

    return line;
  }

  const cube = Cube('#e84393');

  const line = Line();
  
  camera.position.z = 5;

  const gameContainer = document.querySelector('.game-container');

  gameContainer?.appendChild(renderer.domElement);

  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render( scene, camera );
  
    cube.rotation.y += 0.01;  
    cube.rotation.x -= 0.01;

    line.rotation.y += 0.01;
    line.rotation.x += 0.01;
  }

  animate();
}