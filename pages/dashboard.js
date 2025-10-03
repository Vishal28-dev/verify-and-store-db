import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

// A function to draw a star shape for our confetti
const drawStar = (ctx) => {
  const numPoints = 5;
  const outerRadius = 10;
  const innerRadius = 5;
  ctx.beginPath();
  ctx.moveTo(0, 0 - outerRadius);

  for (let n = 1; n < numPoints * 2; n++) {
    const radius = n % 2 === 0 ? outerRadius : innerRadius;
    const angle = (n * Math.PI) / numPoints;
    ctx.lineTo(radius * Math.sin(angle), -radius * Math.cos(angle));
  }
  ctx.closePath();
  ctx.fill();
};

export default function DashboardPage() {
  const router = useRouter();
  const { name } = router.query;

  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <Head>
        <title>Welcome! - AMU</title>
        {/* This is where the new font is imported */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet" />
      </Head>
      
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={800}
        gravity={0.1}
        drawShape={drawStar}
      />
      
      <main 
        className="min-h-screen flex items-center justify-center font-inter text-white relative"
      >
        <div className="text-center z-10 animate-fade-in-up">
          <h1 
            className="text-6xl lg:text-8xl font-bold text-accent mb-4" 
            // This is where the new font is applied
            style={{ fontFamily: "'Pacifico', cursive" }}
          >
            Welcome, {name || 'User'}!
          </h1>
          <p className="text-lg lg:text-2xl text-placeholder">You have successfully logged in.</p>
        </div>
      </main>
    </>
  );
}