import Link from 'next/link';
import Image from 'next/image';
import logoImg from '@/assets/logo.png';
import classes from './main-header.module.css';

export default function MainHeader() {
    return (
        <header className={classes.header}>
            <Link className={classes.logo} href="/">
                <Image src={logoImg} alt="A server surrounded by magic sparkles." priority/>
                NextLevel Food
            </Link>
            <nav className={classes.nav}>
                <ul className={classes.navLinks}>
                    <li>
                        <Link className={classes.navLink} href="/meals">Browse Meals</Link>
                    </li>
                    <li>
                        <Link className={classes.navLink} href="/community">Community</Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
}