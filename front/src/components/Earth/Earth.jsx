import Spline from '@splinetool/react-spline';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import React, { useEffect } from 'react';
import { useRef, useState } from 'react';

import styles from './Earth.module.scss';

gsap.registerPlugin(ScrollTrigger);

const Earth = () => {
  const [sceneSize, setSceneSize] = useState({ width: 0, height: 0 });
  const splineRef = useRef(null);

  const onLoad = (spline) => {
    console.log('Spline chargé', spline);


    const earthObject = spline?.findObjectByName('Earth');

    if (earthObject) {


      gsap.to(earthObject.scale, {
        x: 1.5,
        y: 1.5,
        z: 1.5,
      });

      gsap.to(earthObject.rotation, {
        y: 0,
        x: 0,
      });

      gsap.to(earthObject.position, {
        x: 0,
        y: -200,
        z: 10,
      });

      gsap.timeline({
        scrollTrigger: {
          trigger: '#about',
          start: ' center',
          end: 'bottom center',
          scrub: true,
        },
      }).to(earthObject.scale, {
        x: 1,
        y: 1,
        z: 1,
      }).to(earthObject.position, {
        x: 300,
        y: 0,
        z: 0,
      }, 0).to(earthObject.rotation, {
        y: -0.5,
        x: 0,
      }, 0);
    }

    gsap.timeline({
      scrollTrigger: {
        trigger: '#how',
        start: ' center',
        end: 'bottom center',
        scrub: true,
        smoothChildTiming: true,
      },
    }).to(earthObject.scale, {
      x: 1.5,
      y: 1.5,
      z: 1.5,
    }).to(earthObject.position, {
      x: 200,
      y: 0,
      z: 0,
    }, 0).to(earthObject.rotation, {
      y: -0.5,
      x: 0,
    }, 0);


  };

  useEffect(() => {
    const handleResize = () => {
      if (splineRef.current) {
        const { clientWidth, clientHeight } = splineRef.current;

        // Mettre à jour la taille de la scène
        setSceneSize({ width: clientWidth, height: clientHeight });
      }
    };

    // Ajouter un écouteur d'événement pour le redimensionnement de la fenêtre
    window.addEventListener('resize', handleResize);

    // Appeler la fonction de redimensionnement au chargement initial
    handleResize();

    // Retirer l'écouteur d'événement lors du démontage du composant
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Spline
      className={styles.earth}
      scene="https://prod.spline.design/TL5szlxyHPLIBYJf/scene.splinecode"
      onLoad={onLoad}
      width={sceneSize.width}
      height={sceneSize.height}
    />

  );
};

export default Earth;
