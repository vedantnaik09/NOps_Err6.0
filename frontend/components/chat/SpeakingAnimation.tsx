import React from 'react';

const SpeakingAnimation = () => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3].map((bar) => (
        <div
          key={bar}
          className="w-1 bg-[#e0a943] rounded-full animate-sound-wave"
          style={{
            height: '24px',
            animation: `soundWave 1s infinite ${bar * 0.2}s`
          }}
        />
      ))}
    </div>
  );
};

export default SpeakingAnimation;