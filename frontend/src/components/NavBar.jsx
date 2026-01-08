import { NavLink } from 'react-router-dom'

export default function NavBar() {
    return (
        <nav className="navbar">
            <div className="container-centered flex-between">
                <div className="text-xl" style={{ fontWeight: 800, background: 'linear-gradient(to right, #60a5fa, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Aether
                </div>
                <div className="flex-gap" style={{ gap: '2rem' }}>
                    <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Conseils</NavLink>
                    <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Carte</NavLink>
                    <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Historique</NavLink>
                    <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Profil</NavLink>
                </div>
            </div>
        </nav>
    )
}
