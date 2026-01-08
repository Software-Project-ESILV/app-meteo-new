import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'
import { useUser } from '../hooks/useUser'
import { AlertTriangle, MapPin, CheckCircle, Droplets, Wind, Sun, Thermometer } from 'lucide-react'

const DEFAULT_LOC = { lat: 48.85, lon: 2.35 }

export default function Home() {
    const { userId, loading: userLoading } = useUser()
    const [adviceData, setAdviceData] = useState(null)
    const [alertsData, setAlertsData] = useState(null)
    const [weatherData, setWeatherData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [userLoc, setUserLoc] = useState(DEFAULT_LOC)

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLoc({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                () => console.log('Loc refused')
            )
        }
    }, [])

    const fetchData = useCallback(async () => {
        if (!userId) return
        setLoading(true)
        try {
            const [adviceRes, alertsRes, weatherRes] = await Promise.all([
                api.get('/advice', { userId, lat: userLoc.lat, lon: userLoc.lon }),
                api.get('/alerts/evaluate', { userId, lat: userLoc.lat, lon: userLoc.lon }),
                api.get('/weather/forecast', { lat: userLoc.lat, lon: userLoc.lon })
            ])
            setAdviceData(adviceRes)
            setAlertsData(alertsRes)
            setWeatherData(weatherRes)
        } catch (err) {
            console.error('Data Error', err)
        } finally {
            setLoading(false)
        }
    }, [userId, userLoc])

    useEffect(() => {
        if (userId) fetchData()
    }, [userId, fetchData])

    if (userLoading) return <div className="text-center mt-10">Chargement...</div>

    return (
        <div className="container-centered flex-col" style={{ gap: '2rem' }}>
            <header className="flex-between">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Aether Dashboard
                    </h1>
                    <p className="text-muted text-sm flex-gap">
                        <MapPin size={14} /> Météo locale ({userLoc.lat.toFixed(2)}, {userLoc.lon.toFixed(2)})
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="btn btn-primary"
                >
                    {loading ? '...' : 'Rafraîchir'}
                </button>
            </header>

            {/* BLOCK 1: ALERTES CRITIQUES */}
            {alertsData && alertsData.triggeredCount > 0 && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <h3 className="text-lg font-bold text-red-400 mb-3 flex-gap">
                        <AlertTriangle className="text-red-500" />
                        Alertes Actives ({alertsData.triggeredCount})
                    </h3>
                    <div className="grid-2">
                        {alertsData.alerts.map((alert, i) => (
                            <div key={i} className="card border-red-500/50 bg-red-500/10 relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                                <div className="flex-between mb-2">
                                    <h4 className="font-bold text-red-200">{alert.name}</h4>
                                    <span className="badge badge-red animate-pulse">CRITIQUE</span>
                                </div>
                                <p className="text-sm text-red-100/80 mb-2">
                                    Condition : {alert.condition.kind} {alert.condition.op} {alert.condition.value}
                                </p>
                                <div className="text-xs bg-black/30 p-2 rounded text-red-300 font-mono">
                                    Valeur détectée : <strong>{alert.valueDetected}</strong>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* BLOCK 2: MÉTÉO ACTUELLE (Dashboard Grid) */}
            {weatherData && (
                <div>
                    <h3 className="text-lg font-bold mb-3 text-muted">En ce moment</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <WeatherStat icon={<Thermometer size={20} className="text-orange-400" />} label="Température" value={`${weatherData.current.temp}°C`} sub={weatherData.current.description} />
                        <WeatherStat icon={<Wind size={20} className="text-gray-400" />} label="Vent" value={`${weatherData.current.windSpeed} km/h`} sub="Rafales modérées" />
                        <WeatherStat icon={<Droplets size={20} className="text-blue-400" />} label="Pluie / Hum." value={`${weatherData.current.precipitation}%`} sub={`${weatherData.current.humidity}% Hum.`} />
                        <WeatherStat icon={<Sun size={20} className="text-yellow-400" />} label="Indice UV" value={weatherData.current.uv ?? '-'} sub={weatherData.current.uv > 5 ? 'Elevé' : 'Faible'} />
                    </div>
                </div>
            )}

            {/* BLOCK 3: CONSEILS IA */}
            <div>
                <h3 className="text-lg font-bold mb-3 flex-gap">
                    <CheckCircle className="text-blue-400" />
                    Conseils Intelligents
                </h3>

                {!adviceData?.advice?.length && !loading && (
                    <div className="card text-center p-8 bg-gray-800/50 border-dashed border-gray-700">
                        <p className="text-muted">Aucun conseil particulier pour le moment.</p>
                    </div>
                )}

                <div className="grid-2">
                    {adviceData?.advice?.map(item => (
                        <div key={item.id} className="card relative overflow-hidden transition hover:bg-gray-800">
                            <div style={{
                                position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
                                backgroundColor: getCategoryColor(item.category)
                            }}></div>
                            <div className="flex-between mb-2">
                                <span className={`badge ${getBadgeClass(item.category)}`}>{item.category}</span>
                            </div>
                            <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                            <p className="text-sm text-muted mb-3">{item.reason}</p>
                            <div className="bg-primary/10 text-primary-light p-2 rounded text-sm font-medium">
                                💪 {item.action}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function WeatherStat({ icon, label, value, sub }) {
    return (
        <div className="card p-4 flex-col gap-1 items-start bg-gray-800/40 border-gray-700/50">
            <div className="flex-between w-full mb-1">
                <span className="text-muted text-xs uppercase font-bold tracking-wider">{label}</span>
                {icon}
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-muted truncate w-full">{sub}</div>
        </div>
    )
}

function getBadgeClass(category) {
    switch (category) {
        case 'RAIN': return 'badge-blue'
        case 'WIND': return 'badge-gray'
        case 'UV': return 'badge-orange'
        case 'COLD': return 'badge-blue'
        default: return 'badge-gray'
    }
}

function getCategoryColor(category) {
    switch (category) {
        case 'RAIN': return '#3b82f6'
        case 'WIND': return '#9ca3af'
        case 'UV': return '#f97316'
        case 'COLD': return '#06b6d4'
        case 'HEAT': return '#ef4444'
        default: return '#6366f1'
    }
}
