import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react';

import { setupGame } from '../helper';

const Home: NextPage = () => {
  const [variables, setVariables] = useState({
    generation: 1,
    wireframe: false
  });

  useEffect(() => {
    setupGame(variables);
  }, [variables]);

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
          <p>Generation: {variables.generation}</p>
          <input 
            type="range" 
            min="1" 
            max="5" 
            step="1"
            value={variables.generation} 
            onChange={(event) => setVariables({
              ...variables,
              generation: Number(event.target.value)
            })}/>
          <hr />
          <p>Wireframe: {variables.generation}</p>
          <input 
            type="checkbox" 
            checked={variables.wireframe} 
            onChange={(event) => setVariables({
              ...variables,
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
