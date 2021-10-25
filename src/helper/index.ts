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

type Position = {
  x: number;
  y: number;
  z: number;
}

type Rule = {
  odds: number;
  letter: string;
  sentence: string;
}

class InfinitTree {
  private initialPosition: Position;
  private baseBranch: Branch;
  private branches: Branch[] = [];
  private axiom: string;
  private angle: number;
  private rules: Rule[];
  private branchSize: number;
  private sentence: string;
  private generations: number;
  private scene: THREE.Scene;

  constructor(
    initialPosition: Position, 
    axiom: string, 
    rules: any,
    angle: number, 
    branchSize: number, 
    generations: number, 
    scene: THREE.Scene
  ) {
    this.initialPosition = initialPosition;
    this.axiom = axiom;
    this.rules = rules;
    this.angle = angle;
    this.initialPosition = initialPosition;
    this.branchSize = branchSize;
    this.generations = generations;
    this.scene = scene;

    this.sentence = this.generateSequence();

    this.baseBranch = {
      id: 0,
      angle: this.angle,
      rotationAngle: 0,
      points: [new THREE.Vector3(this.initialPosition.x, initialPosition.y, initialPosition.z)],
      width: (this.generations / 10) - (0.1 * this.branches.length),
      color: this.getBranchColor(this.branches.length)
    }
  }

  private getBranchColor = (number: number) => {
    switch(number) {
      case 0: return '#53350A';
      case 1: return '#5c3a0a';
      case 2: return '#4c6a2f';
      case 3: return '#618A3C';
      case 4: return '#618A3B';
      case 5: return '#9b59b6';
      case 6: return 'green';
      case 7: return 'purple';
      case 8: return '#c0392b';
      case 9: return 'white';
      default: return '#fff';
    }
  }

  private drawBranch = (branch: Branch) => {
    const curve = new THREE.CatmullRomCurve3(branch.points);
    const branchGeometry = new THREE.TubeGeometry(curve, 20, branch.width, 8, false);
    const branchMaterial = new THREE.MeshBasicMaterial({ color: branch.color, side: THREE.DoubleSide });
    const branchMesh = new THREE.Mesh(branchGeometry, branchMaterial);

    this.scene.add(branchMesh);
  }

  private generateSequence = () => {
    let sentence = this.axiom;

    for (let generation = 0; generation < this.generations; generation++) {
      let nextSentence = '';

      for (let letterIndex = 0; letterIndex < sentence.length; letterIndex++) {
        const letter = sentence[letterIndex];

        const rules = this.rules.filter(rule => rule.letter === letter);

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
              console.log(testText)
              console.log(initialRange, random)
              console.error('Rule does not exists')
            }

            nextSentence += selectedRule?.sentence;

            break;
        }
      }    
      
      sentence = nextSentence;
    }

    console.log(sentence)
    return sentence;
  };

  public grow = () => {
    for (let index = 0; index < this.sentence.length; index++) {
      const letter = this.sentence[index];

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

        if(rotationAngle < 180 && rotationAngle > 90) return { z, x: x * -1 }

        if(rotationAngle < 270 && rotationAngle > 180) return { z: z * -1, x: x * -1 }

        if(rotationAngle < 360 && rotationAngle > 270) return { z: z * -1, x }

        return { z: z * -1, x }
      })(branch.rotationAngle, this.branchSize);

      let finalPosition = {
        x: 0,
        y: Math.cos(branch.angle) * this.branchSize + initialPosition.y,
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
          branch.angle += this.angle;
          branch.rotationAngle += this.angle;
          break;
        }
        case '-': {
          branch.angle -= this.angle;
          branch.rotationAngle += this.angle;
          break;
        }
        case '[': {
          const a = [0, 45, 90, 135, 180, 225, 270, 315];

          const branch = stack_branch ? stack_branch : this.baseBranch;
          const branchLastPoint = branch.points[branch.points.length - 1];
          
          const random = Math.floor(Math.random() * 8)
          const rotationAngle = a[random];

          const newBranch: Branch = {
            ...branch,
            id: this.branches.length + 1,
            points: [branchLastPoint],
            rotationAngle,
            width: (this.generations / 10) - (0.1 * this.branches.length),
            color: this.getBranchColor(this.branches.length)
          }

          this.branches.push(newBranch);
          break;
        }
        case ']': {
          const branch = this.branches[this.branches.length - 1];

          this.drawBranch(branch);

          this.branches.pop();
          break;
        }
      }
    }

    this.drawBranch(this.baseBranch);
  };
}

export const setupGame = () => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#fff');
  const camera = new THREE.PerspectiveCamera(70, 1280/720, 1, 1000);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(1200, 720);

  const controls = new OrbitControls(camera, renderer.domElement);

  const INITIAL_POSITION: Position = { x: 0, y: -80, z: 0 };
  const GENERATIONS = 6;
  const AXIOM = 'F';
  const BASE_ANGLE = Math.PI / 10;
  const BRANCH_SIZE = 1;
  const RULES: Rule[] = [];

  RULES.push({ odds: 0.4, letter: 'F', sentence: 'F[+FF]F' });
  RULES.push({ odds: 0.3, letter: 'F', sentence: 'F[−FF]F' });
  RULES.push({ odds: 0.3, letter: 'F', sentence: 'F[+FF+FF]+[−FF-FF]FF-' });

  const tree = new InfinitTree(INITIAL_POSITION, AXIOM, RULES, BASE_ANGLE, BRANCH_SIZE, GENERATIONS, scene);

  tree.grow();
  
  camera.position.z = 100;
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