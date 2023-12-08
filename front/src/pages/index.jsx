import { useEffect } from "react";
import Link from "next/link";
import Earth from "@/components/Earth/Earth";
import Footer from "@/components/Footer/Footer";
import Leaderboard from "@/components/Leaderboard/Leaderboard";

const Home = () => {

    return (
        <>
            <div className="index">
            <Earth />

                <header className="landing-header">
                    <h1>
                        Planète Danette
                    </h1>
                    <h4>Créons un monde plus durable</h4>
                    <br />
                    <Link className="primary" href="/game">
                        Jouez maintenant
                    </Link>
                </header>
        
                <section id="about" >
                    <h2 >Qu'est-ce que c'est ?</h2>
                    <br />
                    <h4>
                        Bienvenue dans l'ÉcoChallenge, une expérience de jeu immersive conçue pour sensibiliser et éduquer sur les enjeux cruciaux du réchauffement climatique. Plongez dans un univers virtuel en 3D où chaque clic compte pour façonner l'avenir de notre planète.
                    </h4>
                </section>
                <section id="how">
                    <h2 >Comment ça marche ?</h2>
                    <br />
                    <h3>Au cœur de l'ÉcoChallenge se trouve une scène en 3D, représentant des environnements naturels tels que des forêts, des océans et des villes. L'objectif est simple : cliquez sur un élément de la scène et répondez à une question cruciale sur le changement climatique.
                    </h3>

                </section>

            </div>

            <section id="why">
                <h1>Votre mission : rendre la planète meilleure en accumulant des réponses correctes.</h1>
                <h4>
                    Explorez les différents environnements, découvrez les réalités du changement climatique et apprenez comment chaque geste compte dans la préservation de notre planète.
                </h4>
            </section>

            <Leaderboard/>

            <Footer />

        </>
    )
}
export default Home