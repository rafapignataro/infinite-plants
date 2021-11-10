import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react';

import { createPlantScene, NewPlantProps, createPlant, PlantProps } from '../helper/Plant';

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
  angle: Math.PI / 13,
  branchSize: 1,
  generation: 0,
  sentences: [],
  branches: [],
  grownUp: 0
}

const firstPlant = createPlant(PLANT)

const Home: NextPage = () => {
  const [options, setOptions] = useState({
    wireframe: false,
  });
  const [plant, setPlant] = useState<PlantProps>(firstPlant);

  const handleChangeGrownUp = (grownUp: number) => {
    setPlant({ ...plant, grownUp });
  }

  const handleGrowButton = () => {
    createPlantScene(plant, options);
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
          <p className="controller-topic">Grown up: {plant.grownUp}</p>
          <input 
            type="range" 
            min="0" 
            max="100" 
            step="0.01"
            value={plant.grownUp} 
            onChange={(event) => handleChangeGrownUp(Number(event.target.value))}/>
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
          <button onClick={handleGrowButton}>GROW</button>
        </div>
        <div className="game-container">
          
        </div>
      </div>
    </>
  )
}

export default Home
