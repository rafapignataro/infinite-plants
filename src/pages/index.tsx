import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react';

import { createPlantScene, generateSentence, NewPlantProps, createPlant, PlantProps } from '../helper/Plant';

type Rule = {
  odds: number;
  letter: string;
  sentence: string;
}

const RULES: Rule[] = [
  { odds: 0.4, letter: 'F', sentence: 'F[+FF]F' },
  { odds: 0.3, letter: 'F', sentence: 'F[−FF]F' },
  { odds: 0.3, letter: 'F', sentence: 'F[+FF+FF]+[−FF-FF]FF-' }
];

const PLANT: NewPlantProps = {
  axiom: 'F',
  rules: RULES,
  angle: Math.PI / 10,
  branchSize: 1.5,
  generation: 0,
  sentences: [],
  branches: []
}

const firstPlant = createPlant(PLANT)

const Home: NextPage = () => {
  const [options, setOptions] = useState({
    wireframe: false,
  });
  const [plant, setPlant] = useState<PlantProps>(firstPlant);

  useEffect(() => {
    createPlantScene(createPlant(plant), options);
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
          <hr />
          <p className="controller-topic">Generation: {plant.generation}</p>
          <input 
            type="range" 
            min="0" 
            max="5" 
            step="1"
            value={plant.generation} 
            onChange={(event) => handleChangeGeneration(Number(event.target.value))}/>
          <hr />
          <p className="controller-topic">Wireframe: {options.wireframe ? 'ON' : 'OFF'}</p>
          <input 
            type="checkbox" 
            checked={options.wireframe} 
            onChange={(event) => setOptions({
              ...options,
              wireframe: event.target.checked
            })}/>
          <hr />
          <button
            onClick={() => setPlant(firstPlant)}
          >NEW PLANT</button>
        </div>
        <div className="game-container">
          
        </div>
      </div>
    </>
  )
}

export default Home
