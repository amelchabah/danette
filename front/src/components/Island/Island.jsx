import Spline from '@splinetool/react-spline';
import gsap from 'gsap';
import React, { useEffect } from 'react';
import { useRef, useState } from 'react';
import s from "./Island.module.scss"

export const Island = () => {
  const [sceneSize, setSceneSize] = useState({ width: 0, height: 0 });
  const splineRef = useRef(null);

  const onLoad = (spline) => {
    console.log('Spline chargé', spline);
  }

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
      className={s.Island}
      scene="https://prod.spline.design/0viHa2-YJ66KwAi5/scene.splinecode"
      onLoad={onLoad}
      width={sceneSize.width}
      height={sceneSize.height}
    />
  );
}