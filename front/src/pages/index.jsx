import { socket } from "@/utils/socket";
import { useEffect } from "react";
import Link from "next/link";
import Earth from "@/components/Earth/Earth";
import Footer from "@/components/Footer/Footer";

const Home = () => {

    useEffect(() => {
        socket.connect();

        socket.on("connect", () => {
            console.log("connected");
        });

        return () => {
            socket.off("connect");
        }
    }, []);

    return (
        <>
            <header className="landing-header">
                <h1>
                    Planète Danette
                </h1>
                <h4>Bienvenue sur la terre</h4>
                <br />
                <Link className="primary" href="/game">
                    Jouez maintenant
                </Link>
                {/* <img src="https://cdn3d.iconscout.com/3d/premium/thumb/happy-earth-8304873-6618318.png?f=webp" alt="" /> */}
            </header>
            <Earth />
          <Footer/>

        </>
    )
}
export default Home