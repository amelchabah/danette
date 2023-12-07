// navbar component
import Link from 'next/link';
import styles from './Navbar.module.scss';

const Navbar = () => {

    return (
        <nav className={styles.navbar}>
            <h3>Logo</h3>
            <Link className='primary' href='/'>Jouer maintenant</Link>
        </nav>
    );
}

export default Navbar;