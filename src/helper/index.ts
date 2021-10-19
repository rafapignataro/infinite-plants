import * as THREE from 'three';

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

export const setupGame = () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1280/720, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(1200, 720);

  const AXIOM = 'F';
  const BASE_ANGLE = Math.PI / 16;
  const RULES: any = { 'F' : 'FF-[-F+F+F]+[+F-F-F]' };
  const LENGTH = 3;

  const SENTENCE = generateSentence(AXIOM, 4, RULES);
  console.log(SENTENCE)
  // Criar um array do helper position e helper angle
  
  const Branch = (origin: Position, length: number, angle: number) => {
    let ACTUAL_ANGLE = 0;
    let ACTUAL_POSITION = origin;
    const STATE_STACK: { position: Position, angle: number}[] = [];
    // let STATE_STACK = F[+F]F[-F]F[+F[+F]F[-F]F]F[+F]F[-F]F[-F[+F]F[-F]F]F[+F]F[-F]F;

    for (let index = 0; index < SENTENCE.length; index++) {
      const letter = SENTENCE[index];
      
      const stack_branch = STATE_STACK[STATE_STACK.length - 1];
      
      switch(letter) {
        case 'F': {
          const branchPoints = [];

          if(stack_branch) console.log('position', stack_branch.position)
          const initialPosition = stack_branch ? stack_branch.position : ACTUAL_POSITION;
          const finalPosition = { 
            x: Math.sin(stack_branch ? stack_branch.angle : ACTUAL_ANGLE) * length + initialPosition.x, 
            y: Math.cos(stack_branch ? stack_branch.angle : ACTUAL_ANGLE) * length + initialPosition.y, 
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
          
          if(stack_branch) {
            stack_branch.position = finalPosition;
          } else {
            ACTUAL_POSITION = finalPosition;
          }
          break;
        }
        case '+': {
          if(stack_branch) {
            console.log('B+', stack_branch.angle)
            stack_branch.angle += angle;
          } else {
            ACTUAL_ANGLE += angle;
          }
          break;
        }
        case '-': {
          if(stack_branch) {
            console.log('B-', stack_branch.angle)
            stack_branch.angle -= angle;
          } else {
            ACTUAL_ANGLE -= angle;
          }
          break;
        }
        case '[': {

          STATE_STACK.push({ 
            position: stack_branch ? stack_branch.position : ACTUAL_POSITION, 
            angle: stack_branch ? stack_branch.angle : ACTUAL_ANGLE 
          })
          break;
        }
        case ']': {
          STATE_STACK.pop()
          break;
        }
      }

      console.log('INDEX', index)
      console.log('STATE_STACK', STATE_STACK.length, STATE_STACK)
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