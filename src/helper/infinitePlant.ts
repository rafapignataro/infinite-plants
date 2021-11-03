import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

type Branch = {
  id: number;
  angle: number;
  rotationAngle: number;
  points: THREE.Vector3[];
  width: number;
  color: string;
}

type Position = {
  x: number
  y: number;
  z: number;
}

type Rule = {
  odds: number;
  letter: string;
  sentence: string;
}

type Plant = {
  axiom: string,
  rules: Rule[],
  angle: number,
  branchSize: number,
  generation: number,
  sentences: { sentence: string, current: number }[]
}

class InfinitTree {
  private plant: Plant;
  // INTERNAL PLANT
  private initialPosition: Position;
  private baseBranch: Branch;
  private branches: Branch[] = [];
  private scene: THREE.Scene;
  private options: any;

  constructor(
    plant: Plant,
    initialPosition: Position, 
    scene: THREE.Scene,
    options: any
  ) {
    this.plant = plant;
    // INTERNAL PLANT
    this.initialPosition = initialPosition;
    this.scene = scene;
    this.options = options;

    this.baseBranch = {
      id: 0,
      angle: plant.angle,
      rotationAngle: 0,
      points: [new THREE.Vector3(this.initialPosition.x, initialPosition.y, initialPosition.z)],
      width: (plant.generation / 4) - (0.1 * this.branches.length),
      color: this.getBranchColor(this.branches.length)
    }
  }

  private getBranchColor = (number: number) => {
    const colorsMatrix = [
      ['#4c6a2f'],
      ['#4c6a2f', '#618A3C'],
      ['#53350A', '#4c6a2f', '#618A3C'],
      ['#53350A', '#5c3a0a', '#4c6a2f', '#618A3C'],
      ['#53350A', '#5c3a0a', '#4c6a2f', '#618A3C', '#618A3B'],
      ['#53350A', '#5c3a0a', '#4c6a2f', '#618A3C', '#618A3B', '#9b59b6'],
    ];
    
    if(this.plant.generation === 0) return colorsMatrix[0][number]

    return colorsMatrix[this.plant.generation - 1][number];
  }

  private drawBranch = (branch: Branch) => {
    const curve = new THREE.CatmullRomCurve3(branch.points);
    const branchGeometry = new THREE.TubeGeometry(curve, branch.points.length * 3, branch.width, 8, false);
    const branchMaterial = new THREE.MeshPhysicalMaterial({ color: branch.color, side: THREE.DoubleSide, wireframe: this.options.wireframe  });
    const branchMesh = new THREE.Mesh(branchGeometry, branchMaterial);
    branchMesh.castShadow = true
    this.scene.add(branchMesh);
  }

  public growStep = (letter: string) => {
    const stack_branch = this.branches[this.branches.length - 1];

    const branch = stack_branch ? stack_branch : this.baseBranch;

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
    })(branch.rotationAngle, this.plant.branchSize);

    let finalPosition = {
      x: 0,
      y: Math.cos(branch.angle) * this.plant.branchSize + initialPosition.y,
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

        const geometry = new THREE.SphereGeometry(0.1, 32, 16 );
          const material = new THREE.MeshLambertMaterial({ color: '#FC427B',  });
          const sphere = new THREE.Mesh( geometry, material );
          sphere.position.set(finalPoint.x, finalPoint.y, finalPoint.z)
          this.scene.add( sphere );
        
        break;
      }
      case '+': {
        branch.angle += this.plant.angle;
        branch.rotationAngle += this.plant.angle;
        break;
      }
      case '-': {
        branch.angle -= this.plant.angle;
        branch.rotationAngle += this.plant.angle;
        break;
      }
      case '[': {
        const a = [0, 45, 90, 135, 180, 225, 270, 315];

        const branch = stack_branch ? stack_branch : this.baseBranch;
        const branchLastPoint = branch.points[branch.points.length - 1];
        
        const rotationAngle = Math.floor(Math.random() * 360);

        const newBranch: Branch = {
          ...branch,
          id: this.branches.length + 1,
          points: [branchLastPoint],
          rotationAngle,
          width: (this.plant.generation / 10) - (0.1 * this.branches.length),
          color: this.getBranchColor(this.branches.length)
        }

        this.branches.push(newBranch);
        break;
      }
      case ']': {
        const branch = this.branches[this.branches.length - 1];

        setTimeout(() => {
          this.drawBranch(branch)            
        }, 100);

        this.branches.pop();
        break;
      }
    }
  }

  public grow = () => {
    const { sentence } = this.plant.sentences[this.plant.generation - 1] || { sentence: 'F', current: 0 };

    for(let letterIndex = 0; letterIndex < sentence.length; letterIndex++) {
      this.growStep(sentence[letterIndex]) 
    }

    this.drawBranch(this.baseBranch);
  }
}

export const generateSentence = (plant: Plant) => {
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


export const createPlantScene = (plant: Plant, options: any) => {
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
    floorMesh.position.setY(GENERATION !== 0 ? GENERATION * -GENERATION : 0);
    floorMesh.rotation.x = - Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);
  })();

  const INITIAL_POSITION: Position = { x: 0, y: (GENERATION * -GENERATION), z: 0 };

  const tree = new InfinitTree(plant,INITIAL_POSITION, scene, options);

  tree.grow();

  const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
  hemiLight.position.set( 0, 15, 0 );
  scene.add(hemiLight);
  
  camera.position.z = GENERATION !== 0 ? 15 * (GENERATION * 1) : 15;
  camera.position.y = 0;

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