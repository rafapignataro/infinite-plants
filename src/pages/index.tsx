import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react';

import { createPlantScene, generateSentence } from '../helper/infinitePlant';

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


const RULES: Rule[] = [];
RULES.push({ odds: 0.4, letter: 'F', sentence: 'F[+FF]F' });
RULES.push({ odds: 0.3, letter: 'F', sentence: 'F[−FF]F' });
RULES.push({ odds: 0.3, letter: 'F', sentence: 'F[+FF+FF]+[−FF-FF]FF-' });

const Plant1: Plant = {
  axiom: 'F',
  rules: RULES,
  angle: Math.PI / 10,
  branchSize: 1,
  generation: 0,
  sentences: []
}

const Home: NextPage = () => {
  const [options, setOptions] = useState({
    wireframe: false
  });
  const [plant, setPlant] = useState<Plant>(Plant1);

  useEffect(() => {
    console.log("SENTENCES", plant.sentences)
    createPlantScene(plant, options);
  }, [plant, options]);

  const handleChangeGeneration = (generation: number) => {
    let sentences = plant.sentences;

    if(generation > sentences.length) {

      const newSentence = generateSentence(plant);

      sentences.push(newSentence);
    }

    setPlant({
      ...plant,
      sentences,
      generation,
    })
  }

  return (
    <>
      <Head>
        <title>Infinite Plants</title>
      </Head>
      <div className="container">
        <div className="controller-container">
          <h1>Infinite Plants</h1>
          <h2>Variables</h2>
          <hr />
          <p>Generation: {plant.generation}</p>
          <input 
            type="range" 
            min="0" 
            max="5" 
            step="1"
            value={plant.generation} 
            onChange={(event) => handleChangeGeneration(Number(event.target.value))}/>
          <hr />
          <p>Wireframe: {plant.generation}</p>
          <input 
            type="checkbox" 
            checked={options.wireframe} 
            onChange={(event) => setOptions({
              ...options,
              wireframe: event.target.checked
            })}/>
        </div>
        <div className="game-container">
          
        </div>
      </div>
    </>
  )
}

export default Home
