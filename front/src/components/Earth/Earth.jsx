import Spline from '@splinetool/react-spline';
import gsap from 'gsap';
import React, { useEffect } from 'react';

const Earth = () => {
  const onLoad = (spline) => {
    console.log('spline loaded', spline);
    const Earth = spline.getObjectByName('Earth');

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
    tl.to(Earth.rotation, { duration: 10, y: Math.PI * 2, ease: 'none' });
    
  }
  return (
    <Spline
      scene="https://prod.spline.design/TL5szlxyHPLIBYJf/scene.splinecode"
      onLoad={onLoad}
    />
  );
}

export default Earth;
