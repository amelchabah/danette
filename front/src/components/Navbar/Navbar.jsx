// navbar component
import Link from 'next/link';
import styles from './Navbar.module.scss';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { ColorContext } from '@/context/ColorContext';

const Navbar = () => {
    const { theme, toggleTheme } = useContext(ColorContext);

    const { loggedIn } = useContext(AuthContext);
    const darkTheme = (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 384 512"><path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z" /></svg>
    );

    const lightTheme = (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z" /></svg>
    )

    return (
        <nav className={styles.navbar}>
            <Link href='/'>Home</Link>
            <button onClick={toggleTheme}>
                {
                    theme === "dark" ? lightTheme : darkTheme
                }
            </button>

            <div>
                {
                    loggedIn ? (
                        <>
                            <Link className='primary' href='/game'>Jouer maintenant</Link>
                        </>
                    ) : (
                        <>
                            {/* <Link href='/login'>Se connecter</Link> */}
                            <Link className='primary' href='/login'>Jouer maintenant</Link>
                        </>
                    )
                }
            </div>
        </nav >
    );
}

export default Navbar;