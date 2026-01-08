import { useState } from 'react'
import { api } from '../services/api'
import { X } from 'lucide-react'

export default function AlertRuleModal({ onClose, refresh, userId, initialData }) {
    const [formData, setFormData] = useState(initialData ? {
        name: initialData.name,
        kind: initialData.condition.kind,
        op: initialData.condition.op,
        value: initialData.condition.value,
        windowMinutes: initialData.condition.windowMinutes || 0
    } : {
        name: '',
        kind: 'RAIN_PROB',
        op: '>=',
        value: 50,
        windowMinutes: 0
    })

    // Conversion "User Friendly" des types
    const KIND_OPTIONS = [
        { value: 'RAIN_PROB', label: 'Proba Pluie (%)' },
        { value: 'WIND', label: 'Vent (km/h)' },
        { value: 'UV', label: 'Indice UV' },
        { value: 'TEMP', label: 'Température (°C)' }
    ]

    const handleSubmit = async (e) => {
        e.preventDefault()
        const payload = {
            userId,
            name: formData.name,
            condition: {
                kind: formData.kind,
                op: formData.op,
                value: Number(formData.value),
                windowMinutes: Number(formData.windowMinutes)
            },
            enabled: true
        }

        try {
            if (initialData) {
                await api.put(`/alerts/rules/${initialData._id}`, payload)
            } else {
                await api.post('/alerts/rules', payload)
            }
            refresh()
            onClose()
        } catch (err) {
            alert('Erreur: ' + err.message)
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
            <div className="card w-full max-w-md relative" style={{ boxShadow: 'var(--shadow-lg)' }}>
                <button onClick={onClose} className="absolute text-muted hover:text-white" style={{ top: '1rem', right: '1rem' }}>
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-6">{initialData ? 'Modifier la règle' : 'Nouvelle Alerte'}</h2>

                <form onSubmit={handleSubmit} className="flex-col" style={{ gap: '1rem' }}>
                    <div>
                        <label className="block text-sm text-muted mb-1">Nom de la règle</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Ex: Alerte Tempête"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid-2">
                        <div>
                            <label className="block text-sm text-muted mb-1">Type</label>
                            <select
                                className="input"
                                value={formData.kind}
                                onChange={e => setFormData({ ...formData, kind: e.target.value })}
                            >
                                {KIND_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-muted mb-1">Opérateur</label>
                            <select
                                className="input"
                                value={formData.op}
                                onChange={e => setFormData({ ...formData, op: e.target.value })}
                            >
                                <option value=">=">{'>='}</option>
                                <option value=">">{'>'}</option>
                                <option value="<=">{'<='}</option>
                                <option value="<">{'<'}</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid-2">
                        <div>
                            <label className="block text-sm text-muted mb-1">Valeur seuil</label>
                            <input
                                type="number"
                                className="input"
                                value={formData.value}
                                onChange={e => setFormData({ ...formData, value: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-muted mb-1">Horizon (minutes)</label>
                            <input
                                type="number"
                                className="input"
                                placeholder="0 = Maintenant"
                                value={formData.windowMinutes}
                                onChange={e => setFormData({ ...formData, windowMinutes: e.target.value })}
                            />
                            <p className="text-xs text-muted mt-1">0 = Météo actuelle</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full mt-4"
                        style={{ padding: '0.75rem', justifyContent: 'center', fontSize: '1rem' }}
                    >
                        Sauvegarder
                    </button>
                </form>
            </div>
        </div>
    )
}
