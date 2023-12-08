// Footer component
import Link from 'next/link';
import styles from './Footer.module.scss';

const Footer = () => {

    return (
        <footer className={styles.footer}>
            <div className={styles.footer__container}>
                <div className={styles.footer__container__logo}>
                    {/* <img src="/images/logo.png" alt="logo" /> */}
                </div>
                <div className={styles.footer__container__links}>
                    <Link href="/">Home</Link>
                </div>
                <div className={styles.footer__container__social}>
                    {/* <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
                        <img src="/images/facebook.svg" alt="facebook" />
                    </a>
                    <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
                        <img src="/images/instagram.svg" alt="instagram" />
                    </a>
                    <a href="https://www.twitter.com/" target="_blank" rel="noopener noreferrer">
                        <img src="/images/twitter.svg" alt="twitter" />
                    </a> */}
                </div>
            </div>
        </footer>
    );
}

export default Footer;