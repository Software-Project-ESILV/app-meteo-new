import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'
import { useUser } from '../hooks/useUser'
import { usePushNotifications } from '../hooks/usePushNotifications' // Import hook
import { Trash2, Edit2, PlayCircle, Plus, AlertTriangle, Bell } from 'lucide-react'
import AlertRuleModal from './AlertRuleModal'

export default function AlertsManager() {
    const { userId } = useUser()
    const { isSubscribed, subscribe } = usePushNotifications(userId) // Hook
    const [rules, setRules] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRule, setEditingRule] = useState(null)
    const [testResult, setTestResult] = useState(null)

    const fetchRules = useCallback(async () => {
        try {
            const data = await api.get('/alerts/rules', { userId })
            setRules(data)
        } catch (err) {
            console.error('Failed to load rules')
        }
    }, [userId])

    useEffect(() => {
        if (userId) fetchRules()
    }, [userId, fetchRules])

    const handleDelete = useCallback(async (id) => {
        if (!confirm('Supprimer cette règle ?')) return
        await api.delete(`/alerts/rules/${id}`)
        fetchRules()
    }, [fetchRules])

    const handleToggle = useCallback(async (rule) => {
        await api.put(`/alerts/rules/${rule._id}`, { enabled: !rule.enabled })
        fetchRules()
    }, [fetchRules])

    const handleTest = useCallback(async () => {
        setTestResult(null)
        const res = await api.get('/alerts/evaluate', { userId, lat: 48.85, lon: 2.35 })
        setTestResult(res)
    }, [userId])

    return (
        <div className="flex-col" style={{ gap: '1.5rem' }}>
            <div className="card">
                <div className="flex-between mb-2">
                    <h2 className="text-xl font-bold">Vos Règles de Surveillance</h2>
                    <div className="flex-gap">
                        {/* Bouton Notification */}
                        {!isSubscribed ? (
                            <button onClick={subscribe} className="btn btn-primary" style={{ backgroundColor: '#9333ea', borderColor: '#9333ea' }}>
                                <Bell size={16} style={{ marginRight: '0.5rem' }} /> Activer Notifs
                            </button>
                        ) : (
                            <div className="badge badge-green flex-gap">
                                <Bell size={16} /> Notifications Actives
                            </div>
                        )}

                        <button
                            onClick={handleTest}
                            className="btn"
                            title="Lancer une simulation maintenant"
                        >
                            <PlayCircle size={16} style={{ marginRight: '0.5rem' }} /> Tester
                        </button>
                        <button
                            onClick={() => { setEditingRule(null); setIsModalOpen(true) }}
                            className="btn btn-primary"
                        >
                            <Plus size={16} style={{ marginRight: '0.5rem' }} /> Nouvelle
                        </button>
                    </div>
                </div>
                <p className="text-muted text-sm mb-4">Gérez vos seuils critiques pour recevoir des alertes push instantanées.</p>

                {/* Zone de Résultat Test */}
                {testResult && (
                    <div className={`p-4 rounded-md border text-sm mb-6 ${testResult.triggeredCount > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                        <h4 className={`font-bold flex-gap mb-2 ${testResult.triggeredCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {testResult.triggeredCount > 0 ? <AlertTriangle size={16} /> : <div />}
                            Résultat du test: {testResult.triggeredCount > 0 ? '🚨 ALERTE !' : '✅ Calme'}
                        </h4>
                        {testResult.alerts.map((alert, i) => (
                            <div key={i} className="text-muted">
                                [Simulé] {alert.name} : Détecté {alert.valueDetected} (Seuil: {alert.condition.op} {alert.condition.value})
                            </div>
                        ))}
                        {testResult.triggeredCount === 0 && <p className="text-muted opacity-80">Aucune alerte déclenchée avec la météo actuelle.</p>}
                    </div>
                )}

                {/* Liste Règles (Condensed) */}
                <div className="grid-2" style={{ gap: '0.75rem' }}>
                    {rules.map(rule => (
                        <div key={rule._id} className={`p-4 rounded-md border flex-between transition ${rule.enabled ? 'bg-app border-border' : 'bg-app border-border opacity-60'}`}>
                            <div>
                                <div className="flex-gap mb-1">
                                    <h3 className="font-bold">{rule.name}</h3>
                                    {!rule.enabled && <span className="badge badge-gray">Inactif</span>}
                                </div>
                                <p className="text-xs text-muted font-mono">
                                    <span className="text-primary">{rule.condition.kind}</span> {rule.condition.op} {rule.condition.value}
                                    {rule.condition.windowMinutes > 0 && ` (${rule.condition.windowMinutes}m)`}
                                </p>
                            </div>

                            <div className="flex-gap">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={rule.enabled} onChange={() => handleToggle(rule)} />
                                    <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>

                                <button
                                    onClick={() => { setEditingRule(rule); setIsModalOpen(true) }}
                                    className="btn btn-icon"
                                    title="Modifier"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(rule._id)}
                                    className="btn btn-icon btn-danger"
                                    title="Supprimer"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {rules.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-border rounded-xl">
                        <p className="text-muted mb-4">Aucune règle définie.</p>
                        <button onClick={() => { setEditingRule(null); setIsModalOpen(true) }} className="btn btn-primary">
                            <Plus size={16} style={{ marginRight: 6 }} /> Créer ma première règle
                        </button>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <AlertRuleModal
                    onClose={() => setIsModalOpen(false)}
                    refresh={fetchRules}
                    userId={userId}
                    initialData={editingRule}
                />
            )}
        </div>
    )
}
