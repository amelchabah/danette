// navbar component
import Link from 'next/link';
import styles from './Navbar.module.scss';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

const Navbar = () => {
    const { loggedIn } = useContext(AuthContext);
    return (
        <nav className={styles.navbar}>
            <Link href='/'>
                <img src="https://cdn3d.iconscout.com/3d/premium/thumb/flower-earth-8304872-6618317.png" alt="icon" />
            </Link>
            <div>
                <Link className='primary' href='/game'>Jouer maintenant</Link>
                {
                    loggedIn ? (
                        <Link href='/user/me'>Mon compte</Link>
                    ) : (
                        <Link href='/login'>Se connecter</Link>
                    )
                }
            </div>
        </nav>
    );
}

export default Navbar;