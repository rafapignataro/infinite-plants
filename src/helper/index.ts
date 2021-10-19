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
    case 0: return '#16a085';
    case 1: return '#27ae60';
    case 2: return '#1abc9c';
    case 3: return '#2ecc71';
    case 4: return '#8e44ad';
    case 5: return '#9b59b6';
    case 6: return 'white';
    case 7: return '#c0392b';
    case 8: return '#e74c3c';
    case 9: return 'white';
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
  const BASE_ANGLE = - Math.PI / 14.4;
  const RULES: any = { 'X': 'F+[[X]-X]-F[-FX]+X', 'F': 'FF' };
  const LENGTH = 1;

  const SENTENCE = generateSentence(AXIOM, 6, RULES);
  console.log(SENTENCE)

  const Branch = (origin: Position, length: number, angle: number) => {
    let ACTUAL_ANGLE = 0;
    let ACTUAL_POSITION = origin;
    const STATE_STACK: { id: number, position: Position, angle: number}[] = [];
    // let STATE_STACK = F[+F]F[-F]F[+F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F]F[+F]F[-F]F[+F[+F]F[-F]F[+F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F]F[+F]F[-F]F]F[+F]F[-F]F[+F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F[+F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F]F[+F]F[-F]F]F[+F]F[-F]F[+F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F]F[+F]F[-F]F[+F[+F]F[-F]F[+F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F]F[+F]F[-F]F[+F[+F]F[-F]F[+F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F]F[+F]F[-F]F]F[+F]F[-F]F[+F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F[+F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F]F[+F]F[-F]F]F[+F]F[-F]F[+F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F]F[+F]F[-F]F]F[+F]F[-F]F[+F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F]F[+F]F[-F]F[+F[+F]F[-F]F[+F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F]F[+F]F[-F]F]F[+F]F[-F]F[+F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F[+F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F]F[+F]F[-F]F]F[+F]F[-F]F[+F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F[+F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F]F[+F]F[-F]F[+F[+F]F[-F]F[+F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F]F[+F]F[-F]F]F[+F]F[-F]F[+F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F[+F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F]F[+F]F[-F]F]F[+F]F[-F]F[+F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F]F[+F]F[-F]F]F[+F]F[-F]F[+F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F]F[+F]F[-F]F[+F[+F]F[-F]F[+F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F]F[+F]F[-F]F]F[+F]F[-F]F[+F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F[+F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F]F[+F]F[-F]F]F[+F]F[-F]F[+F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F]F[+F]F[-F]F

    for (let index = 0; index < SENTENCE.length; index++) {
      const letter = SENTENCE[index];
      
      const stack_branch = STATE_STACK[STATE_STACK.length - 1];
      if(!stack_branch) console.log('-- TRONCO --')
      const initialAngle = stack_branch ? stack_branch.angle : ACTUAL_ANGLE;
      const initialPosition = stack_branch ? stack_branch.position : ACTUAL_POSITION;
      const finalPosition = { 
        x: Math.sin(initialAngle) * length + initialPosition.x, 
        y: Math.cos(initialAngle) * length + initialPosition.y, 
        z: 0 
      };

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
          }, 10 * index)
          
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

          STATE_STACK.push({ 
            id: STATE_STACK.length + 1,
            position: stack_branch ? stack_branch.position : ACTUAL_POSITION, 
            angle: stack_branch ? stack_branch.angle : ACTUAL_ANGLE 
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
    
  Branch({ x: 0, y: -40, z: 0 }, LENGTH, BASE_ANGLE);
  
  camera.position.z = 40;
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