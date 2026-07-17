import { useState } from 'react';
import { router } from '@inertiajs/react';
import ModalShell from '@/Components/ModalShell';

const SUBJECT_COLORS = [
    '#fecaca', '#fed7aa', '#fef08a', '#d9f99d', '#bbf7d0',
    '#a7f3d0', '#99f6e4', '#a5f3fc', '#bae6fd', '#bfdbfe',
    '#c7d2fe', '#ddd6fe', '#e9d5ff', '#f5d0fe', '#fbcfe8',
];

const CloseXIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const TrashIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.74 9l-.346 9m-4.788 0L9.26 9M19.228 5.79c.342.052.682.107 1.022.166m-1.022-.166L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56.397c.34-.059.68-.114 1.022-.166m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
        />
    </svg>
);

const inputClass =
    'mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 ' +
    'focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500';
const labelClass = 'block text-xs font-medium uppercase tracking-wide text-slate-400';

/**
 * Edit a subject's name, color and top-level topics in one popup — used from
 * both the plan's discipline cards (/planos/{id}) and the edital
 * verticalizado checklist, so both stay pixel-for-pixel identical.
 */
export default function EditDisciplinaModal({ subject, onClose, onDelete }) {
    const [name, setName] = useState(subject.name);
    const [color, setColor] = useState(subject.color);
    const [topics, setTopics] = useState(() =>
        subject.topics.map((t) => ({ key: `id-${t.id}`, id: t.id, name: t.name })),
    );
    const [newTopicName, setNewTopicName] = useState('');
    const [saving, setSaving] = useState(false);

    const addTopic = () => {
        const trimmed = newTopicName.trim();
        if (!trimmed) return;
        setTopics((prev) => [...prev, { key: `new-${Date.now()}-${prev.length}`, id: null, name: trimmed }]);
        setNewTopicName('');
    };

    const renameTopic = (key, value) =>
        setTopics((prev) => prev.map((t) => (t.key === key ? { ...t, name: value } : t)));

    const removeTopic = (key) => setTopics((prev) => prev.filter((t) => t.key !== key));

    const submit = () => {
        if (!name.trim()) return;
        setSaving(true);
        router.patch(
            `/disciplinas/${subject.id}`,
            {
                name,
                color,
                topics: topics
                    .map((t) => ({ id: t.id, name: t.name.trim() }))
                    .filter((t) => t.name !== ''),
            },
            { preserveScroll: true, onSuccess: onClose, onFinish: () => setSaving(false) },
        );
    };

    return (
        <ModalShell onClose={onClose} busy={saving} maxWidth="max-w-lg">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Editar disciplina</h2>
                <button type="button" onClick={onClose} className="text-slate-400 transition hover:text-slate-600">
                    <CloseXIcon />
                </button>
            </div>

            <label className={`${labelClass} mt-5`}>Nome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />

            <label className={`${labelClass} mt-4`}>Cor</label>
            <div className="mt-2 flex flex-wrap gap-2">
                {SUBJECT_COLORS.map((c) => (
                    <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        aria-label={c}
                        className={
                            'h-7 w-7 rounded-full transition ' +
                            (color === c ? 'ring-2 ring-brand-600 ring-offset-2' : '')
                        }
                        style={{ backgroundColor: c }}
                    />
                ))}
            </div>

            <label className={`${labelClass} mt-4`}>Tópicos</label>
            <div className="mt-1.5 max-h-52 space-y-1.5 overflow-y-auto pr-1">
                {topics.map((t) => (
                    <div key={t.key} className="flex items-center gap-2">
                        <input
                            value={t.name}
                            onChange={(e) => renameTopic(t.key, e.target.value)}
                            className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                        <button
                            type="button"
                            onClick={() => removeTopic(t.key)}
                            title="Remover tópico"
                            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                            <TrashIcon />
                        </button>
                    </div>
                ))}
                {topics.length === 0 && (
                    <p className="px-1 py-1 text-sm text-slate-400">Nenhum tópico cadastrado.</p>
                )}
            </div>

            <div className="mt-2 flex items-center gap-2">
                <input
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            addTopic();
                        }
                    }}
                    placeholder="Novo tópico"
                    className="flex-1 rounded-lg border border-dashed border-slate-300 px-2.5 py-1.5 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <button
                    type="button"
                    onClick={addTopic}
                    disabled={!newTopicName.trim()}
                    className="shrink-0 rounded-lg border border-brand-200 px-3 py-1.5 text-sm font-medium text-brand-700 transition hover:bg-brand-50 disabled:opacity-40"
                >
                    Adicionar
                </button>
            </div>

            <div className="mt-6 flex items-center justify-between gap-2">
                <button
                    type="button"
                    onClick={onDelete}
                    disabled={saving}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                    Remover
                </button>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={submit}
                        disabled={saving || !name.trim()}
                        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
                    >
                        {saving ? 'Salvando…' : 'Salvar'}
                    </button>
                </div>
            </div>
        </ModalShell>
    );
}
