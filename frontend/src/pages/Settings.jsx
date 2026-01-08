import { useState } from 'react'
import ProfileSettings from '../components/ProfileSettings'
import AlertsManager from '../components/AlertsManager'

export default function Settings() {
    const [activeTab, setActiveTab] = useState('alerts')

    return (
        <div className="container-centered">
            <h1 className="text-2xl mb-8">Paramètres</h1>

            <div className="flex-gap mb-6" style={{ borderBottom: '1px solid var(--border)' }}>
                <button
                    className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                    style={{ paddingBottom: '1rem', borderBottom: activeTab === 'profile' ? '2px solid var(--primary)' : 'none', marginBottom: -1 }}
                    onClick={() => setActiveTab('profile')}
                >
                    Profil & Seuils
                </button>
                <button
                    className={`nav-link ${activeTab === 'alerts' ? 'active' : ''}`}
                    style={{ paddingBottom: '1rem', borderBottom: activeTab === 'alerts' ? '2px solid var(--primary)' : 'none', marginBottom: -1 }}
                    onClick={() => setActiveTab('alerts')}
                >
                    Règles d'Alerte
                </button>
            </div>

            <div className="mt-4">
                {activeTab === 'profile' && <ProfileSettings />}
                {activeTab === 'alerts' && <AlertsManager />}
            </div>
        </div>
    )
}
