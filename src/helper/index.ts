import * as THREE from 'three';

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

export const setupGame = () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1280/720, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(1200, 720);

  const AXIOM = 'F';
  const BASE_ANGLE = Math.PI / 16;
  const RULES: any = { 'F' : 'FF-[-F+F+F]+[+F-F-F]' };
  const LENGTH = 3;

  const SENTENCE = generateSentence(AXIOM, 2, RULES);
  // Criar um array do helper position e helper angle
  
  const Branch = (origin: { x: number, y: number, z: number }, length: number, angle: number) => {
    let BRANCHING = false;
    let ACTUAL_ANGLE = 0;
    let HELPER_ANGLE = 0;
    let ACTUAL_POSITION = origin;
    let HELPER_POSITION = ACTUAL_POSITION;
    let ANGLE_STACK = [];
    let POSITION_STACK = [];

    for (let index = 0; index < SENTENCE.length; index++) {
      const letter = SENTENCE[index];
  
      switch(letter) {
        case 'F': {
          const branchPoints = [];

          const initialPosition = BRANCHING ? HELPER_POSITION : ACTUAL_POSITION;
          const finalPosition = { 
            x: Math.sin(BRANCHING ? HELPER_ANGLE : ACTUAL_ANGLE) * length + initialPosition.x, 
            y: Math.cos(BRANCHING ? HELPER_ANGLE : ACTUAL_ANGLE) * length + initialPosition.y, 
            z: 0 
          };
          
          const originPoint = new THREE.Vector3(initialPosition.x, initialPosition.y, initialPosition.z);
          const finalPoint = new THREE.Vector3(finalPosition.x, finalPosition.y, finalPosition.z);
          branchPoints.push(originPoint);
          branchPoints.push(finalPoint);
          const geometry = new THREE.BufferGeometry().setFromPoints(branchPoints);
          const material = new THREE.LineBasicMaterial({ color: getRandomColor() });
          const branch = new THREE.Line(geometry, material);
          
          scene.add(branch);
          
          if(BRANCHING) {
            HELPER_POSITION = finalPosition;
          } else {
            ACTUAL_POSITION = finalPosition;
          }
          break;
        }
        case '+': {
          if(BRANCHING) {
            HELPER_ANGLE += angle;
            ANGLE_STACK.push(HELPER_ANGLE);
          } else {
            ACTUAL_ANGLE += angle;
          }
          break;
        }
        case '-': {
          if(BRANCHING) {
            HELPER_ANGLE -= angle;
            ANGLE_STACK.push(HELPER_ANGLE);
          } else {
            ACTUAL_ANGLE -= angle;
          }
          break;
        }
        case '[': {
          BRANCHING = true;
          HELPER_POSITION = ACTUAL_POSITION;
          break;
        }
        case ']': {
          BRANCHING = false;
          HELPER_POSITION = ACTUAL_POSITION;
          HELPER_ANGLE = 0;
          break;
        }
      }
    }
  }
    
  Branch({ x: 0, y: -15, z: 0 }, LENGTH, BASE_ANGLE);
  
  camera.position.z = 20;
  const gameContainer = document.querySelector('.game-container');

  if(gameContainer) {
    gameContainer.innerHTML = '';
    gameContainer.appendChild(renderer.domElement);
  }

  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  animate();
}