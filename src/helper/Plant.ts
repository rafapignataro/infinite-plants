import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

type Position = {
  x: number
  y: number;
  z: number;
}

type Branch = {
  angle: number;
  rotationAngle: number;
  points: Position[];
  width: number;
  color: string;
}

type Rule = {
  odds: number;
  letter: string;
  sentence: string;
}

export interface NewPlantProps {
  axiom: string;
  rules: Rule[];
  angle: number;
  branchSize: number;
  generation: number;
  sentences: { sentence: string, current: number }[];
  branches: Branch[];
}

export interface PlantProps extends NewPlantProps {
  baseBranch: Branch;
}

const getBranchColor = (generation: number, branchesLength: number) => {
  const colorsMatrix = [
    ['#4c6a2f'],
    ['#4c6a2f', '#618A3C'],
    ['#53350A', '#4c6a2f', '#618A3C'],
    ['#53350A', '#5c3a0a', '#4c6a2f', '#618A3C'],
    ['#53350A', '#5c3a0a', '#4c6a2f', '#618A3C', '#618A3B'],
    ['#53350A', '#5c3a0a', '#4c6a2f', '#618A3C', '#618A3B', '#9b59b6'],
  ];
  
  if(generation === 0) return colorsMatrix[0][branchesLength]

  return colorsMatrix[generation - 1][branchesLength];
}

export const generateSentence = (plant: PlantProps) => {
  const pastSentence = plant.sentences[plant.sentences.length - 1];
  let nextSentence = '';

  if(!pastSentence) return {
    sentence: plant.axiom,
    current: 0
  }

  for (let letterIndex = 0; letterIndex < pastSentence.sentence.length; letterIndex++) {
    const letter = pastSentence.sentence[letterIndex];

    const rules = plant.rules.filter(rule => rule.letter === letter);

    switch(rules.length) {
      case 0:
        nextSentence += letter;
        break;
      case 1:
        nextSentence += rules[0].sentence;
        break;
      default: 
        // Multiple rules, random sentence
        const random = Number(Math.random().toFixed(2));

        let testText = '';
        let initialRange = 0;
        let selectedRule = null;

        if(random === 1) {
          selectedRule = rules[rules.length - 1];
          break;
        }

        for (let ruleIndex = 0; ruleIndex < rules.length; ruleIndex++) {
          const rule = rules[ruleIndex];

          const finalRange = initialRange + rule.odds;

          testText += `${initialRange}-${finalRange} `;

          if(random >= initialRange && random < finalRange) {
            selectedRule = rule;
            break;
          }
          
          initialRange = finalRange;
        }

        if(!selectedRule) {
          console.info(testText)
          console.info(initialRange, random)
          console.error('Rule does not exists')
        }

        nextSentence += selectedRule?.sentence;

        break;
    }
  }    
  
  return {
    sentence: nextSentence,
    current: 0
  }
};

export const growStep = (plant: PlantProps, letter: string) => {
  const stack_branch = plant.branches[plant.branches.length - 1];

  const branch = stack_branch ? stack_branch : plant.baseBranch;

  const initialPosition = branch.points[branch.points.length - 1];

  const { x: finalX, z: finalZ } = ((rotationAngle: number, length: number) => {
    if(rotationAngle === 0) return { x: length, z: 0 };
    if(rotationAngle === 90) return { x: 0, z: 1 };
    if(rotationAngle === 180) return { x: -length, z: 0 };
    if(rotationAngle === 270) return { x: 0, z: 1 };
    
    const z = Math.sin(rotationAngle) * length;
    const x = Math.cos(rotationAngle) * length;

    if(rotationAngle < 90) return { z, x }

    if(rotationAngle >= 90 && rotationAngle < 180) return { z, x: x * -1 }

    if(rotationAngle >= 180 && rotationAngle < 270) return { z: z * -1, x: x * -1 }

    if(rotationAngle >= 270 && rotationAngle < 360) return { z: z * -1, x }

    return { z: z * -1, x }
  })(branch.rotationAngle, plant.branchSize);

  let finalPosition = {
    x: 0,
    y: Math.cos(branch.angle) * plant.branchSize + initialPosition.y,
    z: 0
  }

  if(stack_branch) {
    finalPosition.x = finalX + initialPosition.x;
    finalPosition.z = finalZ + initialPosition.z;
  }

  switch(letter) {
    case 'F': {
      const finalPoint = new THREE.Vector3(finalPosition.x, finalPosition.y, finalPosition.z);
      branch.points.push(finalPoint);
      
      break;
    }
    case '+': {
      branch.angle += plant.angle;
      branch.rotationAngle += plant.angle;
      break;
    }
    case '-': {
      branch.angle -= plant.angle;
      branch.rotationAngle += plant.angle;
      break;
    }
    case '[': {
      const branch = stack_branch ? stack_branch : plant.baseBranch;
      const branchLastPoint = branch.points[branch.points.length - 1];
      
      const rotationAngle = Math.floor(Math.random() * 360);

      const newBranch: Branch = {
        ...branch,
        points: [branchLastPoint],
        rotationAngle,
        width: (plant.generation / 10) - (0.1 * plant.branches.length),
        color: getBranchColor(plant.generation, plant.branches.length)
      }

      plant.branches.push(newBranch);
      break;
    }
    case ']': {
      plant.branches.pop();
      break;
    }
  }
}

export const createPlant = (newPlant: NewPlantProps) => {
  const plant: PlantProps = {
    ...newPlant,
    baseBranch: {
      angle: newPlant.angle,
      rotationAngle: 0,
      points: [new THREE.Vector3(0, 0, 0)],
      width: (newPlant.generation / 4),
      color: getBranchColor(newPlant.generation, 0)
    }
  }

  return plant;
}

const drawPlant = (plant: PlantProps, options: any, scene: THREE.Scene) => {
  const brancheeeees: Branch[] = [];
  const drawBranch = (branch: Branch) => {
    const Vector3Points = branch.points.map(point => new THREE.Vector3(point.x, point.y, point.z));

    const curve = new THREE.CatmullRomCurve3(Vector3Points);
    const branchGeometry = new THREE.TubeGeometry(curve, branch.points.length * 3, branch.width, 8, false);
    const branchMaterial = new THREE.MeshPhysicalMaterial({ color: branch.color, side: THREE.DoubleSide, wireframe: options.wireframe  });
    const branchMesh = new THREE.Mesh(branchGeometry, branchMaterial);

    branchMesh.castShadow = true;
    scene.add(branchMesh);
  }

  const plantGrowFunction = (letter: string) => {
    const stack_branch = plant.branches[plant.branches.length - 1];

    const branch = stack_branch ? stack_branch : plant.baseBranch;

    const initialPosition = branch.points[branch.points.length - 1];

    const { x: finalX, z: finalZ } = ((rotationAngle: number, length: number) => {
      if(rotationAngle === 0) return { x: length, z: 0 };
      if(rotationAngle === 90) return { x: 0, z: 1 };
      if(rotationAngle === 180) return { x: -length, z: 0 };
      if(rotationAngle === 270) return { x: 0, z: 1 };
      
      const z = Math.sin(rotationAngle) * length;
      const x = Math.cos(rotationAngle) * length;

      if(rotationAngle < 90) return { z, x }

      if(rotationAngle >= 90 && rotationAngle < 180) return { z, x: x * -1 }

      if(rotationAngle >= 180 && rotationAngle < 270) return { z: z * -1, x: x * -1 }

      if(rotationAngle >= 270 && rotationAngle < 360) return { z: z * -1, x }

      return { z: z * -1, x }
    })(branch.rotationAngle, plant.branchSize);

    let finalPosition = {
      x: 0,
      y: Math.cos(branch.angle) * plant.branchSize + initialPosition.y,
      z: 0
    }

    if(stack_branch) {
      finalPosition.x = finalX + initialPosition.x;
      finalPosition.z = finalZ + initialPosition.z;
    }

    switch(letter) {
      case 'F': {
        const finalPoint = new THREE.Vector3(finalPosition.x, finalPosition.y, finalPosition.z);
        branch.points.push(finalPoint);
        
        break;
      }
      case '+': {
        branch.angle += plant.angle;
        break;
      }
      case '-': {
        branch.angle -= plant.angle;
        break;
      }
      case '<': {
        branch.rotationAngle += plant.angle;
        break;
      }
      case '>': {
        branch.rotationAngle += plant.angle;
        break;
      }
      case '[': {
        const branch = stack_branch ? stack_branch : plant.baseBranch;
        const branchLastPoint = branch.points[branch.points.length - 1];

        const random = Math.floor(Math.random() * 2) ? 1 : -1;

        const lastBranchRotationAngle = stack_branch ? stack_branch.rotationAngle + (((Math.random() * plant.angle) + plant.angle * 1.5) * random) : Math.floor(Math.random() * 360)
        
        const newBranch: Branch = {
          ...branch,
          points: [branchLastPoint],
          rotationAngle: lastBranchRotationAngle,
          width: (plant.generation / 10) - (0.1 * plant.branches.length),
          color: getBranchColor(plant.generation, plant.branches.length)
        }

        plant.branches.push(newBranch);
        brancheeeees.push(newBranch)
        break;
      }
      case ']': {
        const branch = plant.branches[plant.branches.length - 1];

        drawBranch(branch); 
        if(plant.generation > 4 && (branch.color === '#4c6a2f' || branch.color === '#618A3C' || branch.color === '#618A3B')) {
          const geometry = new THREE.SphereGeometry(plant.generation * 0.15, 32, 16 );
          const material = new THREE.MeshPhysicalMaterial({ color: '#ff4757' });
          const sphere = new THREE.Mesh(geometry, material);
          const spherePosition = branch.points[branch.points.length - 1];
          sphere.position.set(spherePosition.x, spherePosition.y, spherePosition.z)
          scene.add(sphere);       
        }

        plant.branches.pop();
        break;
      }
    }
  }

  const { sentence } = plant.sentences[plant.generation - 1] || { sentence: 'F', current: 0 };

  for(let letterIndex = 0; letterIndex < sentence.length; letterIndex++) {
    plantGrowFunction(sentence[letterIndex]) 
  }

  drawBranch(plant.baseBranch);
}

export const createPlantScene = (plant: PlantProps, options: any) => {
  const gameContainer = document.querySelector('.game-container');

  if(!gameContainer) return;

  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#74b9ff');

  const GENERATION = plant.generation;

  // GROUND
  (() => {
    const floorMesh = new THREE.Mesh(
      new THREE.CircleGeometry(2000, 10),
      new THREE.MeshPhongMaterial({ color: '#6ab04c', side: THREE.DoubleSide, depthWrite: false })
    );
    floorMesh.position.setY(0);
    floorMesh.rotation.x = - Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);
  })();

  drawPlant(plant, options, scene);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  hemiLight.position.set( 0, 15, 0 );
  scene.add(hemiLight);
  
  camera.position.z = GENERATION * 15 + 15;
  camera.position.y = GENERATION * 15 + 15;

  const renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(gameContainer.clientWidth, gameContainer?.clientHeight);
  renderer.shadowMap.enabled = true;

  const controls = new OrbitControls(camera, renderer.domElement);

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