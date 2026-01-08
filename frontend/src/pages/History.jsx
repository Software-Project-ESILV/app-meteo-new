
import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useUser } from '../hooks/useUser'
import { Clock, AlertTriangle, Lightbulb, ChevronLeft, ChevronRight, RefreshCw, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function History() {
    const { userId } = useUser()
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [filterType, setFilterType] = useState('') // '' | 'ALERT' | 'ADVICE'

    useEffect(() => {
        if (userId) fetchHistory()
    }, [userId, page, filterType])

    const fetchHistory = async () => {
        setLoading(true)
        try {
            const params = { userId, page, limit: 20 }
            if (filterType) params.type = filterType

            const data = await api.get('/history', params)
            setHistory(data.items)
            setTotalPages(data.totalPages)
            // Correction si page > totalPages (ex: suppression de items)
            if (data.page > data.totalPages && data.totalPages > 0) {
                setPage(data.totalPages)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const clearHistory = async () => {
        if (!confirm('Tout effacer ? Cette action est irréversible.')) return
        try {
            await api.request(`/history?userId=${userId}`, { method: 'DELETE' })
            setPage(1)
            fetchHistory()
        } catch (err) {
            alert('Erreur: ' + err.message)
        }
    }

    return (
        <div className="container-centered">
            {/* Header */}
            <div className="flex-between mb-8">
                <div className="flex-gap">
                    <Clock className="text-muted" />
                    <h1 className="text-2xl">Historique</h1>
                </div>
                <div className="flex-gap">
                    <button onClick={fetchHistory} className="btn btn-icon" title="Rafraîchir">
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    {/* DEV ONLY DELETE btn */}
                    <button onClick={clearHistory} className="btn btn-icon btn-danger" title="Tout effacer">
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            {/* Filtres */}
            <div className="flex-gap mb-6" style={{ gap: '1rem' }}>
                <button
                    onClick={() => { setFilterType(''); setPage(1) }}
                    className={`btn ${!filterType ? 'btn-primary' : ''}`}
                >
                    Tous
                </button>
                <button
                    onClick={() => { setFilterType('ALERT'); setPage(1) }}
                    className={`btn ${filterType === 'ALERT' ? 'btn-primary' : ''}`}
                >
                    <AlertTriangle size={14} style={{ marginRight: 6 }} /> Alertes
                </button>
                <button
                    onClick={() => { setFilterType('ADVICE'); setPage(1) }}
                    className={`btn ${filterType === 'ADVICE' ? 'btn-primary' : ''}`}
                >
                    <Lightbulb size={14} style={{ marginRight: 6 }} /> Conseils
                </button>
            </div>

            {/* Liste */}
            {loading && history.length === 0 ? (
                <div className="text-center py-20 text-muted">Chargement...</div>
            ) : history.length === 0 ? (
                <div className="card text-center py-20 text-muted">
                    Aucun historique pour le moment.
                </div>
            ) : (
                <div className="flex-col" style={{ gap: '1rem' }}>
                    {history.map(item => (
                        <HistoryItem key={item._id} item={item} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-4 mt-8">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="btn"
                    >
                        <ChevronLeft />
                    </button>
                    <span className="flex items-center px-4 font-mono text-muted">
                        Page {page} / {totalPages}
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="btn"
                    >
                        <ChevronRight />
                    </button>
                </div>
            )}
        </div>
    )
}

function HistoryItem({ item }) {
    const isAlert = item.type === 'ALERT'
    const date = new Date(item.createdAt)
    const payload = item.payload || {}

    return (
        <div className="card" style={{ padding: '1rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className={`btn-icon ${isAlert ? 'badge-red' : 'badge-green'}`} style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                {isAlert ? <AlertTriangle size={20} /> : <Lightbulb size={20} />}
            </div>

            <div style={{ flex: 1 }}>
                <div className="flex-between">
                    <div>
                        <span className={`badge ${isAlert ? 'badge-red' : 'badge-green'}`} style={{ marginRight: '0.5rem' }}>
                            {isAlert ? 'ALERTE' : 'CONSEIL'}
                        </span>
                        <span className="text-muted text-xs font-mono">
                            {format(date, 'dd MMM HH:mm', { locale: fr })}
                        </span>
                    </div>
                </div>

                <div className="mt-2 text-xl font-bold">
                    {isAlert ? payload.name : payload.title}
                </div>

                <div className="text-muted">
                    {isAlert ? (
                        `Valeur détectée : ${payload.valueDetected}`
                    ) : (
                        payload.action || payload.reason || '...'
                    )}
                </div>
            </div>
        </div>
    )
}
