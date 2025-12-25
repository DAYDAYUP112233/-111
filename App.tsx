import React, { useState } from 'react';
import Scene from './components/Scene';
import { TreeState } from './types';
import { COLORS } from './constants';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>('CHAOS');

  const toggleState = () => {
    setTreeState(prev => prev === 'CHAOS' ? 'FORMED' : 'CHAOS');
  };

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Background Radial Gradient - Deep Red/Green vignette */}
      <div 
        className="absolute inset-0 -z-10" 
        style={{
          background: `radial-gradient(circle at center, ${COLORS.PINE_GREEN} 0%, #000000 90%)`
        }}
      />

      <Scene treeState={treeState} />

      {/* UI Overlay - Christmas Luxury Style */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-8 z-10">
        
        {/* Header */}
        <header className="text-center mt-4 md:mt-8 space-y-2 opacity-90">
            <h1 className="font-[Cinzel] text-5xl md:text-7xl font-bold tracking-widest text-christmas-gradient drop-shadow-xl">
                MERRY CHRISTMAS
            </h1>
            <p className="font-[Playfair Display] text-[#fff3cd] italic text-xl tracking-wider drop-shadow-md">
                The Grand Luxury Collection
            </p>
        </header>

        {/* Controls */}
        <div className="mb-12 pointer-events-auto">
          <button 
            onClick={toggleState}
            className="group relative px-12 py-4 bg-black/40 backdrop-blur-md overflow-hidden transition-all duration-500 hover:bg-black/60 border border-transparent"
          >
             {/* Gradient Border Trick */}
            <div className="absolute inset-0 rounded-none border border-christmas-gradient opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
            
            <span className="relative z-10 font-[Cinzel] text-xl font-bold text-[#ffd700] tracking-[0.2em] group-hover:tracking-[0.3em] transition-all duration-500 drop-shadow-lg">
              {treeState === 'CHAOS' ? 'DECORATE' : 'CELEBRATE'}
            </span>
            
            {/* Shine effect */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
          </button>
        </div>

        {/* Footer Credit */}
        <div className="absolute bottom-4 right-6 text-xs text-[#b8860b]/60 font-mono tracking-widest">
            SANTA'S WORKSHOP • 2024
        </div>
      </div>
      
      {/* Tailwind animation keyframes for custom shine */}
      <style>{`
        @keyframes shine {
            100% {
                left: 125%;
            }
        }
        .animate-shine {
            animation: shine 1s;
        }
      `}</style>
    </div>
  );
};

export default App;