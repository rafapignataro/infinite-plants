import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect } from 'react';

import { setupGame } from '../helper';

const Home: NextPage = () => {
  useEffect(() => {
    setupGame();
  }, []);

  return (
    <>
      <Head>
        <title>Infinite Plants</title>
      </Head>
      <div className="container">
        <h1>INFINITE PLANTS</h1>
        <div className="game-container">
          
        </div>
      </div>
    </>
  )
}

export default Home
