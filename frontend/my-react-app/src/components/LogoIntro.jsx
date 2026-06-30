import { useEffect, useState } from 'react';
import './LogoIntro.css';

export default function LogoIntro({ onComplete }) {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
      if (onComplete) onComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!showIntro) return null;

  return (
    <div className="logo-intro-container">
      {/* Black background with gradient overlay */}
      <div className="intro-background" />
      
      {/* Cinematic lighting elements */}
      <div className="cinematic-light top-left" />
      <div className="cinematic-light bottom-right" />
      
      {/* Main logo container with 3D effects */}
      <div className="logo-wrapper">
        {/* Bloom/Glow effect layers */}
        <div className="glow-layer glow-1" />
        <div className="glow-layer glow-2" />
        <div className="glow-layer glow-3" />
        
        {/* Main logo box with 3D tilt and floating motion */}
        <div className="logo-container">
          {/* Glossy reflection */}
          <div className="reflection-overlay" />
          
          {/* The actual logo */}
          <div className="logo-box">
            {/* Neon blue background glow */}
            <div className="neon-glow" />
            
            {/* Logo content */}
            <div className="logo-content">
              <svg
                className="lightning-bolt"
                fill="white"
                viewBox="0 0 24 24"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Brand text with fade-in */}
        <div className="brand-text">
          <h1>cracKd</h1>
          <p>ai resume analyst</p>
        </div>
      </div>

      {/* Motion blur elements */}
      <div className="motion-blur-layer" />
    </div>
  );
}
