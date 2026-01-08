
import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useUser } from '../hooks/useUser'
import { Save, Loader, MapPin, Trash2, Plus } from 'lucide-react'

export default function ProfileSettings() {
    const { userId, userProfile, loading: initLoading, refreshProfile } = useUser()
    const [formData, setFormData] = useState(null)
    const [locations, setLocations] = useState([])
    const [locInput, setLocInput] = useState({ label: '', city: 'Paris' }) // city -> geocoding placeholder
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState('thresholds') // 'thresholds' | 'locations'

    useEffect(() => {
        if (userProfile) {
            setFormData({
                name: userProfile.name || '',
                thresholds: {
                    rainProb: 50, windKmh: 40, uvIndex: 6, coldTemp: 5, hotTemp: 30,
                    ...userProfile.thresholds
                },
                quietHours: {
                    enabled: false, start: '22:00', end: '07:00',
                    ...userProfile.quietHours
                },
                sensitivities: {
                    respiratory: false, allergies: false, heat: false, cold: false,
                    ...userProfile.sensitivities
                }
            })
            setLocations(userProfile.favouriteLocations || [])
        }
    }, [userProfile])

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await api.put(`/profiles/${userId}`, formData)
            alert('Profil sauvegardé !')
            refreshProfile()
        } catch (err) {
            alert('Erreur: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleAddLocation = async (e) => {
        e.preventDefault()
        if (!locInput.label || !locInput.city) return

        // Simuler Geocoding via api.weather (ou on assume Paris pour MVP si pas de real geocoding endpoint)
        // Mais le contrat backend "POST locations" demande lat/lon.
        // On va tricher pour la UX démo : on utilise Paris/Lyon/Marseille en dur ou on demande lat/lon
        // Mieux : on appelle OpenMeteo Geocoding en direct (gratuit, pas de clé API normalement)

        try {
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${locInput.city}&count=1&language=fr&format=json`)
            const geoData = await geoRes.json()
            if (!geoData.results?.length) throw new Error('Ville introuvable')
            const { latitude, longitude } = geoData.results[0]

            await api.post(`/profiles/${userId}/locations`, {
                label: locInput.label,
                lat: latitude,
                lon: longitude
            })

            // Refresh local
            // (userProfile update necessite un fetch global ou on update localement)
            // On fait un quick hack: recharger tout le profil
            refreshProfile()
            setLocInput({ label: '', city: '' })
        } catch (err) {
            alert('Erreur: ' + err.message)
        }
    }

    const removeLocation = async (id) => {
        if (!confirm('Supprimer ce lieu ?')) return
        await api.delete(`/profiles/${userId}/locations/${id}`)
        refreshProfile()
    }

    if (initLoading || !formData) return <div className="text-center p-10"><Loader className="animate-spin mx-auto" /> Chargement...</div>

    return (
        <div className="card">
            <div className="flex-gap mb-6" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                <button
                    onClick={() => setActiveTab('thresholds')}
                    className={`btn ${activeTab === 'thresholds' ? 'btn-primary' : ''}`}
                >
                    Général & Seuils
                </button>
                <button
                    onClick={() => setActiveTab('locations')}
                    className={`btn ${activeTab === 'locations' ? 'btn-primary' : ''}`}
                >
                    Lieux Favoris
                </button>
            </div>

            {activeTab === 'thresholds' && (
                <form onSubmit={handleSave} className="flex-col" style={{ gap: '2rem' }}>
                    {/* Nom Public */}
                    <div className="card" style={{ backgroundColor: 'var(--bg-app)' }}>
                        <label className="block text-sm font-medium mb-1">Nom d'affichage</label>
                        <input
                            className="input"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    {/* Seuils Météo */}
                    <div className="grid-2">
                        <div>
                            <h3 className="text-xl mb-4" style={{ color: '#d8b4fe' }}>Seuils d'Alerte/Conseil</h3>
                            <div className="flex-col">
                                <div>
                                    <label className="text-sm text-muted">Pluie (Proba %)</label>
                                    <input type="number" className="input"
                                        value={formData.thresholds.rainProb}
                                        onChange={e => setFormData({ ...formData, thresholds: { ...formData.thresholds, rainProb: Number(e.target.value) } })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-muted">Vent (km/h)</label>
                                    <input type="number" className="input"
                                        value={formData.thresholds.windKmh}
                                        onChange={e => setFormData({ ...formData, thresholds: { ...formData.thresholds, windKmh: Number(e.target.value) } })}
                                    />
                                </div>
                                <div className="grid-2" style={{ gap: '0.5rem' }}>
                                    <div>
                                        <label className="text-sm text-muted">Seuil Froid (°C)</label>
                                        <input type="number" className="input"
                                            value={formData.thresholds.coldTemp}
                                            onChange={e => setFormData({ ...formData, thresholds: { ...formData.thresholds, coldTemp: Number(e.target.value) } })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-muted">Seuil Chaud (°C)</label>
                                        <input type="number" className="input"
                                            value={formData.thresholds.hotTemp}
                                            onChange={e => setFormData({ ...formData, thresholds: { ...formData.thresholds, hotTemp: Number(e.target.value) } })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quiet Hours & Sensibilités */}
                        <div className="flex-col" style={{ gap: '1.5rem' }}>
                            <div>
                                <h3 className="text-xl mb-4" style={{ color: '#93c5fd' }}>Quiet Hours (Ne pas déranger)</h3>
                                <div className="flex-gap mb-2">
                                    <input type="checkbox" id="qh_en"
                                        checked={formData.quietHours.enabled}
                                        onChange={e => setFormData({ ...formData, quietHours: { ...formData.quietHours, enabled: e.target.checked } })}
                                        style={{ accentColor: 'var(--primary)' }}
                                    />
                                    <label htmlFor="qh_en">Activer le mode nuit (bloque les alertes)</label>
                                </div>
                                {formData.quietHours.enabled && (
                                    <div className="flex-gap">
                                        <input type="time" className="input" style={{ width: 'auto' }}
                                            value={formData.quietHours.start}
                                            onChange={e => setFormData({ ...formData, quietHours: { ...formData.quietHours, start: e.target.value } })}
                                        />
                                        <span className="self-center">à</span>
                                        <input type="time" className="input" style={{ width: 'auto' }}
                                            value={formData.quietHours.end}
                                            onChange={e => setFormData({ ...formData, quietHours: { ...formData.quietHours, end: e.target.value } })}
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="text-xl mb-4" style={{ color: '#f9a8d4' }}>Sensibilités Santé</h3>
                                <div className="flex-col" style={{ gap: '0.5rem' }}>
                                    {[
                                        { k: 'heat', l: 'Sensible aux fortes chaleurs' },
                                        { k: 'cold', l: 'Sensible au froid (frileux)' },
                                        { k: 'respiratory', l: 'Problèmes respiratoires (Pollution)' },
                                        { k: 'allergies', l: 'Allergies (Pollen)' },
                                    ].map(s => (
                                        <div key={s.k} className="flex-gap">
                                            <input type="checkbox"
                                                checked={formData.sensitivities[s.k]}
                                                onChange={e => setFormData({ ...formData, sensitivities: { ...formData.sensitivities, [s.k]: e.target.checked } })}
                                                style={{ accentColor: 'var(--primary)' }}
                                            />
                                            <label>{s.l}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                    >
                        {saving ? <Loader className="animate-spin" /> : <Save />} Sauvegarder les préférences
                    </button>
                </form>
            )}

            {activeTab === 'locations' && (
                <div className="flex-col" style={{ gap: '1.5rem' }}>
                    {/* Liste */}
                    <div className="flex-col">
                        {locations.map(loc => (
                            <div key={loc._id} className="flex-between p-4 bg-app rounded-md border border-border" style={{ backgroundColor: 'var(--bg-app)' }}>
                                <div className="flex-gap">
                                    <MapPin className="text-danger" />
                                    <div>
                                        <div className="font-bold">{loc.label}</div>
                                        <div className="text-xs text-muted">{loc.location.coordinates[1].toFixed(2)}, {loc.location.coordinates[0].toFixed(2)}</div>
                                    </div>
                                </div>
                                <button onClick={() => removeLocation(loc._id)} className="btn btn-icon btn-danger">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {locations.length === 0 && <p className="text-muted text-center py-4">Aucun lieu favori.</p>}
                    </div>

                    {/* Ajout */}
                    <form onSubmit={handleAddLocation} className="p-4 rounded-xl border border-dashed border-border" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                        <h4 className="font-bold mb-3 flex-gap"><Plus size={18} /> Ajouter un lieu</h4>
                        <div className="grid-2">
                            <input
                                placeholder="Nom (ex: Maison)"
                                className="input"
                                value={locInput.label}
                                onChange={e => setLocInput({ ...locInput, label: e.target.value })}
                                required
                            />
                            <div className="flex-gap">
                                <input
                                    placeholder="Ville (ex: Lyon)"
                                    className="input"
                                    value={locInput.city}
                                    onChange={e => setLocInput({ ...locInput, city: e.target.value })}
                                    required
                                />
                                <button type="submit" className="btn btn-primary">
                                    OK
                                </button>
                            </div>
                        </div>
                        <p className="text-xs text-muted mt-2">La recherche de ville utilise Open-Meteo Geocoding API.</p>
                    </form>
                </div>
            )}
        </div>
    )
}
