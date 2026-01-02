import MainHeader from '../components/main-header';

export default function MealsLayout({ children }) {
    return (
        <main>
            <MainHeader />
            {children}
        </main>
    );
}