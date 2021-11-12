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
  depth: number;
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
  grownUp: number
}

export interface PlantProps extends NewPlantProps {
  baseBranch: Branch;
}

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  return color;
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

const generateSentence = (plant: PlantProps) => {
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

const getPlantBranches = (plant: PlantProps) => {
  const branches: Branch[] = [];
  const branchesStack: Branch[] = [];
  const { sentence } = plant.sentences[plant.generation - 1] || { sentence: 'F', current: 0 };

  for(let letterIndex = 0; letterIndex < sentence.length; letterIndex++) {
    const stackBranch = branchesStack[branchesStack.length - 1];

    const branch = stackBranch ? stackBranch : plant.baseBranch;

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
      y: Math.cos(branch.angle) * plant.branchSize + initialPosition.y,
      x: 0,
      z: 0
    }

    if(stackBranch) {
      finalPosition.x = finalX + initialPosition.x;
      finalPosition.z = finalZ + initialPosition.z;
    }

    const letter = sentence[letterIndex];

    switch(letter) {
      case 'F': {
        branch.points.push(finalPosition);
        
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
        const branch = stackBranch ? stackBranch : plant.baseBranch;
        const branchLastPoint = branch.points[branch.points.length - 1];

        const random = Math.floor(Math.random() * 2) ? 1 : -1;

        const lastBranchRotationAngle = stackBranch ? stackBranch.rotationAngle + (((Math.random() * plant.angle) + plant.angle * 1.5) * random) : Math.floor(Math.random() * 360)
        
        const newBranch: Branch = {
          angle: branch.angle,
          rotationAngle: lastBranchRotationAngle,
          points: [branchLastPoint],
          width: (plant.generation / 10) - (0.1 * branchesStack.length),
          color: getBranchColor(plant.generation, branchesStack.length),
          depth: branchesStack.length
        }

        branchesStack.push(newBranch);
        break;
      }
      case ']': {
        const branch = branchesStack[branchesStack.length - 1];

        branches.push(branch);

        branchesStack.pop();
        break;
      }
    }
  }

  branches.sort((branchA: Branch, branchB: Branch) => {
    if (branchA.depth < branchB.depth) return -1;

    if (branchA.depth > branchB.depth) return 1;

    return 0;
  });

  return branches;
}

export const createPlant = (newPlant: NewPlantProps) => {
  const generation = 5;

  // Create base plant
  const plant: PlantProps = {
    ...newPlant,
    branchSize: 1.5, 
    generation: generation,
    baseBranch: {
      angle: newPlant.angle,
      rotationAngle: 0,
      points: [{ x: 0, y: 0, z: 0 }],
      width: (generation / 4),
      color: getBranchColor(generation, 0),
      depth: 0,
    }
  }

  // Generate sentences
  for (let i = 0; i < 5; i++) {
    const newSentence = generateSentence(plant);

    plant.sentences.push(newSentence);
  }

  // Set plant branches
  plant.branches = getPlantBranches(plant);

  console.log('plant', plant)

  return plant;
}

const drawPlant = (plant: PlantProps, options: any, scene: THREE.Scene) => {
  const drawBranch = (branch: Branch, index: number) => {
    const Vector3Points = branch.points.map(point => {
      // drawSphere(0.3, '#eb4d4b', point);
      return new THREE.Vector3(point.x, point.y, point.z)
    });

    const curve = new THREE.CatmullRomCurve3(Vector3Points);
    const branchGeometry = new THREE.TubeBufferGeometry(curve, branch.points.length * 10, branch.width , 8, false);
    // branchGeometry.setDrawRange(0, 3600);
    const branchMaterial = new THREE.MeshPhysicalMaterial({ color: branch.color, side: THREE.DoubleSide, wireframe: options.wireframe  });
    const branchMesh = new THREE.Mesh(branchGeometry, branchMaterial);
    branchMesh.castShadow = true;

    setTimeout(() => scene.add(branchMesh), 50 * index);
    // scene.add(branchMesh);
  }

  const drawSphere = (radius: number, color: string, position: Position) => {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshPhysicalMaterial({ color });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(position.x, position.y, position.z);

    scene.add(sphere);   
  }

  drawBranch(plant.baseBranch, 0);

  const stepsCounter = plant.grownUp / 100 * plant.branches.length;

  for (let i = 0; i < stepsCounter; i++) {
    drawBranch(plant.branches[i], i);
  }

  // plant.branches.forEach((branch, index) => drawBranch(branch, index));


  // const grow = (letter: string) => {
  //   const stackBranch = branchesStack[branchesStack.length - 1];

  //   const branch = stackBranch ? stackBranch : plant.baseBranch;

  //   const initialPosition = branch.points[branch.points.length - 1];

  //   const { x: finalX, z: finalZ } = ((rotationAngle: number, length: number) => {
  //     if(rotationAngle === 0) return { x: length, z: 0 };
  //     if(rotationAngle === 90) return { x: 0, z: 1 };
  //     if(rotationAngle === 180) return { x: -length, z: 0 };
  //     if(rotationAngle === 270) return { x: 0, z: 1 };
      
  //     const z = Math.sin(rotationAngle) * length;
  //     const x = Math.cos(rotationAngle) * length;

  //     if(rotationAngle < 90) return { z, x }

  //     if(rotationAngle >= 90 && rotationAngle < 180) return { z, x: x * -1 }

  //     if(rotationAngle >= 180 && rotationAngle < 270) return { z: z * -1, x: x * -1 }

  //     if(rotationAngle >= 270 && rotationAngle < 360) return { z: z * -1, x }

  //     return { z: z * -1, x }
  //   })(branch.rotationAngle, plant.branchSize);

  //   let finalPosition = {
  //     x: 0,
  //     y: Math.cos(branch.angle) * plant.branchSize + initialPosition.y,
  //     z: 0
  //   }

  //   if(stackBranch) {
  //     finalPosition.x = finalX + initialPosition.x;
  //     finalPosition.z = finalZ + initialPosition.z;
  //   }

  //   switch(letter) {
  //     case 'F': {
  //       const finalPoint = new THREE.Vector3(finalPosition.x, finalPosition.y, finalPosition.z);
  //       branch.points.push(finalPoint);

  //       const geometry = new THREE.SphereGeometry(0.1, 32, 16 );
  //       const material = new THREE.MeshPhysicalMaterial({ color: '#ff4757' });
  //       const sphere = new THREE.Mesh(geometry, material);
  //       sphere.position.set(finalPoint.x, finalPoint.y, finalPoint.z)
  //       scene.add(sphere);     
        
  //       break;
  //     }
  //     case '+': {
  //       branch.angle += plant.angle;
  //       break;
  //     }
  //     case '-': {
  //       branch.angle -= plant.angle;
  //       break;
  //     }
  //     case '<': {
  //       branch.rotationAngle += plant.angle;
  //       break;
  //     }
  //     case '>': {
  //       branch.rotationAngle += plant.angle;
  //       break;
  //     }
  //     case '[': {
  //       const branch = stackBranch ? stackBranch : plant.baseBranch;
  //       const branchLastPoint = branch.points[branch.points.length - 1];

  //       const random = Math.floor(Math.random() * 2) ? 1 : -1;

  //       const lastBranchRotationAngle = stackBranch ? stackBranch.rotationAngle + (((Math.random() * plant.angle) + plant.angle * 1.5) * random) : Math.floor(Math.random() * 360)
        
  //       const newBranch: Branch = {
  //         ...branch,
  //         points: [branchLastPoint],
  //         rotationAngle: lastBranchRotationAngle,
  //         width: (plant.generation / 10) - (0.1 * branchesStack.length),
  //         color: getBranchColor(plant.generation, branchesStack.length)
  //       }

  //       branchesStack.push(newBranch);
  //       break;
  //     }
  //     case ']': {
  //       const branch = branchesStack[branchesStack.length - 1];

  //       drawBranch(branch); 
  //       // if(plant.generation > 4 && (branch.color === '#4c6a2f' || branch.color === '#618A3C' || branch.color === '#618A3B')) {
  //       //   const colors = ['#B53471', '#618A3C']
  //       //   const geometry = new THREE.SphereGeometry(plant.generation * 0.15, 32, 16 );
  //       //   const material = new THREE.MeshPhysicalMaterial({ color: colors[Math.floor(Math.random() * colors.length)] });
  //       //   const sphere = new THREE.Mesh(geometry, material);
  //       //   const spherePosition = branch.points[branch.points.length - 1];
  //       //   sphere.position.set(spherePosition.x, spherePosition.y, spherePosition.z)
  //       //   scene.add(sphere);       
  //       // }

  //       plant.branches.push(branch);

  //       branchesStack.pop();
  //       break;
  //     }
  //   }
  // }
}

export const createPlantScene = (plant: PlantProps, options: any) => {
  const gameContainer = document.querySelector('.game-container');

  if(!gameContainer) return;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#74b9ff');
  
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
  
  const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d);
  hemiLight.position.set(0, 15, 0);
  scene.add(hemiLight);
    
  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 300;
  camera.position.y = 300;

  const axesHelper = new THREE.AxesHelper( 5 );
  scene.add(axesHelper);

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

