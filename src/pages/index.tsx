import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect } from 'react';

import { setupGame } from '../helper';

const Home: NextPage = () => {
  useEffect(() => {
    setupGame();
  }, []);

  return (
    <div className="game-container">
      <Head>
        <title>Infinite Plants</title>
      </Head>
      <h1>INFINITE PLANTS</h1>
    </div>
  )
}

export default Home
