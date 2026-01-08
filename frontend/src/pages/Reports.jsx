import { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { api } from '../services/api'
import { useUser } from '../hooks/useUser'
import L from 'leaflet'

// ... (Icons setup)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Paris (Défaut)
const PARIS_CENTER = [48.8566, 2.3522]

function Recenter({ lat, lon }) {
    const map = useMap()
    useEffect(() => {
        map.setView([lat, lon], 13)
    }, [lat, lon, map])
    return null
}

export default function Reports() {
    const { userId } = useUser()
    const [reports, setReports] = useState([])
    const [isAdding, setIsAdding] = useState(false)
    const [newReportType, setNewReportType] = useState('OTHER')

    // Geo State
    const [userLocation, setUserLocation] = useState(null)
    const [mapCenter, setMapCenter] = useState(PARIS_CENTER)
    const [geoError, setGeoError] = useState(null)
    const [isLoadingGeo, setIsLoadingGeo] = useState(true)

    const fetchReports = useCallback(async (lat, lon) => {
        try {
            const data = await api.get('/reports', { lat, lon, radius: 10000 })
            setReports(data)
        } catch (err) { console.error(err) }
    }, [])

    const finishGeo = useCallback((center) => {
        setIsLoadingGeo(false)
        fetchReports(center[0], center[1])
    }, [fetchReports])

    const askLocation = useCallback(() => {
        setIsLoadingGeo(true)
        setGeoError(null)

        if (!navigator.geolocation) {
            setGeoError("Géolocalisation non supportée.")
            finishGeo(PARIS_CENTER)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords
                const loc = [latitude, longitude]
                setUserLocation({ lat: latitude, lon: longitude })
                setMapCenter(loc)
                finishGeo(loc)
            },
            (err) => {
                let msg = "Localisation refusée."
                if (err.code === err.TIMEOUT) msg = "Délai d'attente dépassé."
                setGeoError(msg)
                finishGeo(PARIS_CENTER)
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
        )
    }, [finishGeo])

    useEffect(() => {
        askLocation()
         
    }, [askLocation])

    const handleAddReport = async () => {
        if (!userId) return alert('Erreur user')

        // Si localisation précise dispo, on l'utilise
        // Sinon, on fallback sur le centre de la map (qui est par défaut Paris si refus)
        const lat = userLocation ? userLocation.lat : mapCenter[0]
        const lon = userLocation ? userLocation.lon : mapCenter[1]

        try {
            await api.post('/reports', {
                type: newReportType,
                lat,
                lon,
                userId,
                description: 'Signalé depuis Aether Web'
            })
            setIsAdding(false)
            fetchReports(mapCenter[0], mapCenter[1])
        } catch (err) { alert(err.message) }
    }

    const handleVote = async (id, type) => {
        await api.post(`/reports/${id}/vote`, { type })
        fetchReports(mapCenter[0], mapCenter[1])
    }

    return (
        <div className="container-centered flex-col" style={{ gap: '1rem' }}>
            {/* Geo Status / Banner */}
            {isLoadingGeo && (
                <div className="bg-blue-900/30 text-blue-200 px-4 py-2 rounded text-sm text-center border border-blue-900 animate-pulse">
                    📡 Recherche de votre position...
                </div>
            )}

            {!isLoadingGeo && geoError && (
                <div className="bg-amber-900/30 text-amber-200 px-4 py-2 rounded text-sm flex-between border border-amber-900">
                    <span>⚠️ {geoError} Position par défaut utilisée (Paris).</span>
                    <button onClick={askLocation} className="text-xs underline hover:text-white">
                        Réessayer
                    </button>
                </div>
            )}

            {/* Header Control Card */}
            <div className="card flex-between">
                <div className="flex-col">
                    <h2 className="text-xl font-bold flex-gap">
                        <span>🌍</span> Carte Communautaire
                    </h2>
                    <p className="text-sm text-muted">
                        {reports.length} incident{reports.length > 1 ? 's' : ''} signalé{reports.length > 1 ? 's' : ''} dans la zone (10km)
                    </p>
                </div>

                <div className="flex-gap">
                    {!isAdding ? (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="btn btn-danger"
                            style={{ fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.2)' }}
                        >
                            📢 Signaler
                        </button>
                    ) : (
                        <div className="flex-gap p-1 rounded-md bg-app border border-border">
                            <span className="text-sm px-2 text-muted self-center">Type :</span>
                            <select
                                className="input py-1"
                                style={{ height: 'auto', minWidth: 120 }}
                                value={newReportType}
                                onChange={e => setNewReportType(e.target.value)}
                            >
                                <option value="FLOOD">Inondation 💧</option>
                                <option value="STORM">Tempête 🌪️</option>
                                <option value="ICE">Verglas ❄️</option>
                                <option value="ACCIDENT">Accident 🚗</option>
                                <option value="OTHER">Autre ❓</option>
                            </select>
                            <button onClick={handleAddReport} className="btn btn-primary py-1 px-3 text-sm">Valider</button>
                            <button onClick={() => setIsAdding(false)} className="btn py-1 px-3 text-sm">X</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Map Card */}
            <div className="card p-0 overflow-hidden relative" style={{ height: '600px', border: '1px solid var(--border)' }}>
                <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
                    <Recenter lat={mapCenter[0]} lon={mapCenter[1]} />
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {/* User Position Marker */}
                    {userLocation && (
                        <Marker position={[userLocation.lat, userLocation.lon]}>
                            <Popup>📍 Vous êtes ici</Popup>
                        </Marker>
                    )}

                    {reports.map(report => (
                        <Marker key={report._id} position={[report.location.coordinates[1], report.location.coordinates[0]]}>
                            <Popup>
                                <div className="text-gray-900 min-w-[200px]">
                                    <h3 className="font-bold flex items-center justify-between border-b pb-2 mb-2">
                                        {report.type}
                                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-600">
                                            {formatTime(report.createdAt)}
                                        </span>
                                    </h3>
                                    <p className="text-sm mb-3">{report.description || 'Aucune description'}</p>

                                    {report.confirmations > 1 && (
                                        <div className="text-green-600 text-xs font-bold mb-2">✅ Confirmé {report.confirmations} fois</div>
                                    )}

                                    <div className="flex gap-2 justify-between mt-2 pt-2 border-t">
                                        <button onClick={() => handleVote(report._id, 'up')} className="bg-green-100 hover:bg-green-200 px-2 py-1 rounded text-xs flex-1">
                                            👍 ({report.votes.up})
                                        </button>
                                        <button onClick={() => handleVote(report._id, 'down')} className="bg-red-100 hover:bg-red-200 px-2 py-1 rounded text-xs flex-1">
                                            👎 ({report.votes.down})
                                        </button>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                {/* Empty State Overlay */}
                {reports.length === 0 && !isLoadingGeo && (
                    <div className="absolute inset-0 flex items-center justify-center z-[1000] pointer-events-none">
                        <div className="card p-6 text-center pointer-events-auto shadow-2xl bg-gray-900/90 backdrop-blur">
                            <h3 className="text-xl font-bold mb-2">Aucun incident signalé 🛡️</h3>
                            <p className="text-muted mb-4">La zone semble calme pour le moment.</p>
                            <button onClick={() => setIsAdding(true)} className="btn btn-primary">
                                Être le premier à signaler
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function formatTime(isoString) {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
