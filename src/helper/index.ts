import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

type Position = {
  x: number;
  y: number;
  z: number
}

const generateSentence = (axiom: string, generations: number, rules: any) => {
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
}

const getRandomColor = () =>{
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const stackColorHelper = (number: number) => {
  switch(number) {
    case 0: return '#832A0D';
    case 1: return '#832A0D';
    case 2: return '#832A0D';
    case 3: return '#832A0D';
    case 4: return '#832A0D';
    case 5: return '#832A0D';
    case 6: return 'green';
    case 7: return 'purple';
    case 8: return '#c0392b';
    case 9: return 'white';
    default: return '#fff';
  }
}

export const setupGame = () => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#2f3542');
  const camera = new THREE.PerspectiveCamera(70, 1280/720, 1, 1000);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(1200, 720);

  const controls = new OrbitControls(camera, renderer.domElement);

  const AXIOM = 'X';
  const BASE_ANGLE = - Math.PI / 6;
  const RULES: any = { 'X': 'F[-F[-X]][-F[-X]][-F[-X]]', 'F': 'FF'};
  const LENGTH = 5;

  const SENTENCE = generateSentence(AXIOM, 7, RULES);
  console.log(SENTENCE)

  const Branch = (origin: Position, length: number, angle: number) => {
    let ACTUAL_ANGLE = 0;
    let ACTUAL_POSITION = origin;
    let ACTUAL_ROTATION_ANGLE = 0;
    const STATE_STACK: { id: number, position: Position, angle: number, rotation_angle: number}[] = [];

    for (let index = 0; index < SENTENCE.length; index++) {
      const letter = SENTENCE[index];
      
      const stack_branch = STATE_STACK[STATE_STACK.length - 1];
      const initialAngle = stack_branch ? stack_branch.angle : ACTUAL_ANGLE;
      const rotationAngle = stack_branch ? stack_branch.rotation_angle : ACTUAL_ROTATION_ANGLE;
      const initialPosition = stack_branch ? stack_branch.position : ACTUAL_POSITION;

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
      })(rotationAngle, length)

      let finalPosition = {
        x: 0,
        y: Math.cos(initialAngle) * length + initialPosition.y,
        z: 0
      }

      if(stack_branch) {
        finalPosition.x = finalX + initialPosition.x;
        finalPosition.z = finalZ + initialPosition.z;
      }

      switch(letter) {
        case 'F': {
          const branchPoints = [];

          const originPoint = new THREE.Vector3(initialPosition.x, initialPosition.y, initialPosition.z);
          const finalPoint = new THREE.Vector3(finalPosition.x, finalPosition.y, finalPosition.z);
          branchPoints.push(originPoint);
          branchPoints.push(finalPoint);
          const geometry = new THREE.BufferGeometry().setFromPoints(branchPoints);
          const material = new THREE.LineBasicMaterial({ color: stackColorHelper(STATE_STACK.length) });
          const branch = new THREE.Line(geometry, material);
          
          setTimeout(() => {
            // console.log('teste', index);
            scene.add(branch)
          }, 1 * index)
          
          if(stack_branch) {
            stack_branch.position = finalPosition;
          } else {
            ACTUAL_POSITION = finalPosition;
          }
          break;
        }
        case '+': {
          if(stack_branch) {
            stack_branch.angle += angle;
          } else {
            ACTUAL_ANGLE += angle;
          }
          break;
        }
        case '-': {
          if(stack_branch) {
            stack_branch.angle -= angle;
          } else {
            ACTUAL_ANGLE -= angle;
          }
          break;
        }
        case '[': {
          const a = [0, 45, 90, 135, 180, 225, 270, 315, 360];

          STATE_STACK.push({ 
            id: STATE_STACK.length + 1,
            position: stack_branch ? stack_branch.position : ACTUAL_POSITION, 
            angle: stack_branch ? stack_branch.angle : ACTUAL_ANGLE,
            rotation_angle: a[Math.floor(Math.random() * 9)]
          });

          // console.log(STATE_STACK.reduce((string, elt) => string += `${index}[ x:${elt.position.x.toFixed(1)}|y:${elt.position.y.toFixed(1)}|a:${elt.angle.toFixed(1)} ], `, ''))
          break;
        }
        case ']': {
          STATE_STACK.pop()
          break;
        }
      }
    }

    console.log(scene)
  }
    
  Branch({ x: 0, y: -55, z: 0 }, LENGTH, BASE_ANGLE);
  
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