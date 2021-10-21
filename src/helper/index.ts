import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

type Branch = {
  id: number;
  angle: number;
  rotationAngle: number;
  points: THREE.Vector3[];
  width: number;
  color: string;
}

const generateSentence = (axiom: string, generations: number, rules: any) => {
  try {
    let sentence = axiom;

    for (let generation = 1; generation < generations; generation++) {
      let nextSentence = '';

      for (let index = 0; index < sentence.length; index++) {
        const letter = sentence[index];

        nextSentence += rules[letter] || letter;
      }    

      sentence = nextSentence;
    }

    return sentence;
  } catch (err) {
    console.error('Erro ao gerar sentença', err)
  }
}

const stackColorHelper = (number: number) => {
  switch(number) {
    case 0: return '#171010';
    case 1: return '#171010';
    case 2: return '#211616';
    case 3: return '#211616';
    case 4: return '#27ae60';
    case 5: return '#9b59b6';
    case 6: return 'green';
    case 7: return 'purple';
    case 8: return '#c0392b';
    case 9: return 'white';
    default: return '#fff';
  }
}

const stackSizeHelper = (number: number) => {
  switch(number) {
    case 0: return 1;
    case 1: return 0.8;
    case 2: return 0.6;
    case 3: return 0.4;
    case 4: return 0.2;
    default: return 0.1;
  }
}

export const setupGame = () => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#fff');
  const camera = new THREE.PerspectiveCamera(70, 1280/720, 1, 1000);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(1200, 720);

  const controls = new OrbitControls(camera, renderer.domElement);

  const GENERATIONS = 7;
  const AXIOM = 'F';
  const BASE_ANGLE = Math.PI / 12;
  const RULES: any = {
    'F': 'F[+F]+F[-F]-[F]',
  }

  const LENGTH = 1;

  const SENTENCE = generateSentence(AXIOM, GENERATIONS, RULES);

  const Branch = (origin: THREE.Vector3, length: number, angle: number) => {
    const STATE_STACK: Branch[] = [];

    const BASE_BRANCH: Branch = {
      id: 0,
      angle: BASE_ANGLE,
      rotationAngle: 0,
      points: [origin],
      width: (GENERATIONS / 2) - (STATE_STACK.length / 10),
      color: stackColorHelper(STATE_STACK.length)
    }

    for (let index = 0; index < SENTENCE.length; index++) {
      const letter = SENTENCE[index];

      const stack_branch = STATE_STACK[STATE_STACK.length - 1];

      const branch = stack_branch ? stack_branch : BASE_BRANCH;

      const initialPosition = branch.points[branch.points.length - 1];

      const { x: finalX, z: finalZ } = ((rotationAngle: number, length: number) => {
        if(rotationAngle === 0) return { x: length, z: 0 };
        if(rotationAngle === 90) return { x: 0, z: 1 };
        if(rotationAngle === 180) return { x: -length, z: 0 };
        if(rotationAngle === 270) return { x: 0, z: 1 };
        
        const z = Math.sin(rotationAngle) * length;
        const x = Math.cos(rotationAngle) * length;

        if(rotationAngle < 90) return { z, x }

        if(rotationAngle < 180 && rotationAngle > 90) return { z, x: x * -1 }

        if(rotationAngle < 270 && rotationAngle > 180) return { z: z * -1, x: x * -1 }

        if(rotationAngle < 360 && rotationAngle > 270) return { z: z * -1, x }

        return { z: z * -1, x }
      })(branch.rotationAngle, length);

      let finalPosition = {
        x: 0,
        y: Math.cos(branch.angle) * length + initialPosition.y,
        z: 0
      }

      if(stack_branch) {
        finalPosition.x = finalX + initialPosition.x;
        finalPosition.z = finalZ + initialPosition.z;
      }

      switch(letter) {
        case 'F': {
          // const originPoint = new THREE.Vector3(initialPosition.x, initialPosition.y, initialPosition.z);
          const finalPoint = new THREE.Vector3(finalPosition.x, finalPosition.y, finalPosition.z);

          branch.points.push(finalPoint);
          break;
        }
        case '+': {
          branch.angle += angle;
          break;
        }
        case '-': {
          branch.angle -= angle;
          break;
        }
        case '[': {
          const a = [0, 45, 90, 135, 180, 225, 270, 315];

          const branch = stack_branch ? stack_branch : BASE_BRANCH;
          const branchLastPoint = branch.points[branch.points.length - 1];

          const newBranch: Branch = {
            ...branch,
            id: STATE_STACK.length + 1,
            points: [branchLastPoint],
            rotationAngle: a[Math.floor(Math.random() * 8)],
            width: stackSizeHelper(STATE_STACK.length),
            color: stackColorHelper(STATE_STACK.length)
          }

          STATE_STACK.push(newBranch);
          break;
        }
        case ']': {
          const curve = new THREE.CatmullRomCurve3(STATE_STACK[STATE_STACK.length - 1].points);
          const branchGeometry = new THREE.TubeGeometry(curve, 20, branch.width, 8, false);
          const branchMaterial = new THREE.MeshBasicMaterial({ color: branch.color, side: THREE.DoubleSide });
          const mesh = new THREE.Mesh(branchGeometry, branchMaterial);

          scene.add(mesh)

          STATE_STACK.pop();
          break;
        }
      }
    }

    const curve = new THREE.CatmullRomCurve3(BASE_BRANCH.points);
    const branchGeometry = new THREE.TubeGeometry(curve, 20, BASE_BRANCH.width, 8, false);
    const branchMaterial = new THREE.MeshBasicMaterial({ color: BASE_BRANCH.color, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(branchGeometry, branchMaterial);

    scene.add(mesh);
  }

  Branch(new THREE.Vector3(0, -55, 0), LENGTH, BASE_ANGLE);
  
  camera.position.z = 80;
  const gameContainer = document.querySelector('.game-container');

  if(gameContainer) {
    gameContainer.innerHTML = '';
    gameContainer.appendChild(renderer.domElement);
  }

  controls.update();
  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}