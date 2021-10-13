import * as THREE from 'three';

interface Plant {
  axiom: string;
  rules: any;
}

// F -> Draw line (line, translate)
// G -> Move foward (translate)
// + -> Turn right (rotate)
// - -> Turn left (rotate)
// [ -> Save state (push matrix)
// ] -> End state (pop matrix)

const plant: Plant = {
  axiom: 'F',
  rules: {
    'F': 'F[F]-F',
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

  console.log(drawList);


  const Line = () => {
    const material = new THREE.LineBasicMaterial({ color: '#686de0' });

    const points = [];

    points.push(new THREE.Vector3(0, 0, 0));
    points.push(new THREE.Vector3(2, 0, 0));
    points.push(new THREE.Vector3(2, 3, 0));

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const line = new THREE.Line(geometry, material);

    scene.add(line);

    return line;
  }

  const line = Line();
  
  camera.position.z = 5;

  const gameContainer = document.querySelector('.game-container');

  gameContainer?.appendChild(renderer.domElement);

  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render( scene, camera );
  }

  animate();
}