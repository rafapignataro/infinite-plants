import * as THREE from 'three';

interface Plant {
  axiom: string;
  rules: any;
  angle: number;
}

// F -> Draw line (line, translate)
// G -> Move foward (translate)
// + -> Turn right (rotate)
// - -> Turn left (rotate)
// [ -> Save state (push matrix)
// ] -> End state (pop matrix)

const plant: Plant = {
  axiom: 'F',
  angle: Math.PI / 4,
  rules: {
    'F': 'FF-[F+F+F]+[+F-F-F]',
  }
}


export const setupGame = () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1280/720, 0.1, 1000);
  
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(854, 480);

  // 'A'
  let result = plant.axiom;

  // Generations loop
  for (let generation = 1; generation <= 3; generation++) {
    let newString = '';
    for (let index = 0; index < result.length; index++) {
      const letter = result[index];

      newString += plant.rules[letter] || letter;
    }    

    result = newString;
    console.log('Generation: ', generation, 'String : ', result);
  }

  const drawList = [];

  // Draw loop
  for (let letter = 1; letter <= result.length; letter++) {
    switch(result[letter]) {
      case 'F': drawList.push('line');
      case '+': drawList.push('right');
      case '-': drawList.push('left');
    }
  }


  let ANGLE = Math.PI * 0;
  let SIZE = 3;

  let generation = 0;
  
  const Branch = ({ x, y, z }: any, size: number, angle: number) => {
    const points = [];
    generation++;

    const originPoint = new THREE.Vector3(x, y, z);

    const y1 = Math.cos(angle) * size;
    const x1 = Math.sin(angle) * size;

    const finalPoint = new THREE.Vector3(x1 + x, y1 + y, z);

    points.push(originPoint);
    points.push(finalPoint);

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
      color: '#e17055',
    });
    const branch = new THREE.Line(geometry, material);
    
    scene.add(branch);

    const random1 = Math.PI / (Math.floor(Math.random() * 10)  + 4)
    const random2 = Math.PI / (Math.floor(Math.random() * 10)  + 4)

    if(size > 0.1) {
      Branch({
        x: x1 + x,
        y: y1 + y,
        z: 0
      }, size / 2, (angle + random1))
      Branch({
        x: x1 + x,
        y: y1 + y,
        z: 0
      }, size / 2, (angle - random2))
    }
  }

  Branch({ x: 0, y: -3.5, z: 0 }, SIZE, ANGLE)

  camera.position.z = 5;

  const gameContainer = document.querySelector('.game-container');

  gameContainer?.appendChild(renderer.domElement);

  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  animate();
}