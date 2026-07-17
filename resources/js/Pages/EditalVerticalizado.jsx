import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Link, router } from '@inertiajs/react';
import ModalShell from '@/Components/ModalShell';
import DeleteConfirmModal from '@/Components/DeleteConfirmModal';
import EditDisciplinaModal from '@/Components/EditDisciplinaModal';

const ChevronDownIcon = ({ className = 'h-4 w-4' }) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

const CheckIcon = ({ className = 'h-3.5 w-3.5' }) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

const PencilIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11 15H8v-3l8.586-8.586z"
        />
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

const CloseXIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const inputClass =
    'w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-800 ' +
    'focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500';

const colClass = 'w-16 shrink-0 px-1 text-center';

/* --- Popup de links de um tópico ----------------------------------------- */
function TopicLinksModal({ topic, onClose }) {
    const [links, setLinks] = useState(() =>
        topic.links.length > 0
            ? topic.links.map((l) => ({ key: `id-${l.id}`, id: l.id, title: l.title, url: l.url }))
            : [{ key: 'new-0', id: null, title: '', url: '' }],
    );
    const [saving, setSaving] = useState(false);

    const addLink = () =>
        setLinks((prev) => [
            ...prev,
            { key: `new-${Date.now()}-${prev.length}`, id: null, title: '', url: '' },
        ]);

    const updateLink = (key, patch) =>
        setLinks((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));

    const removeLink = (key) => setLinks((prev) => prev.filter((l) => l.key !== key));

    const submit = () => {
        setSaving(true);
        router.patch(
            `/edital-verticalizado/topicos/${topic.id}/links`,
            {
                links: links
                    .map((l) => ({ id: l.id, title: l.title.trim(), url: l.url.trim() }))
                    .filter((l) => l.title !== '' && l.url !== ''),
            },
            { preserveScroll: true, preserveState: true, onSuccess: onClose, onFinish: () => setSaving(false) },
        );
    };

    return (
        <ModalShell onClose={onClose} busy={saving} maxWidth="max-w-lg">
            <div className="flex items-center justify-between">
                <h2 className="truncate text-lg font-bold text-slate-800">Links — {topic.name}</h2>
                <button
                    type="button"
                    onClick={onClose}
                    className="shrink-0 text-slate-400 transition hover:text-slate-600"
                >
                    <CloseXIcon />
                </button>
            </div>

            <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
                {links.map((l, i) => (
                    <div key={l.key} className="flex items-start gap-2">
                        <span className="mt-2 shrink-0 text-xs font-semibold text-slate-400">#{i + 1}</span>
                        <div className="flex-1 space-y-1.5">
                            <input
                                value={l.title}
                                onChange={(e) => updateLink(l.key, { title: e.target.value })}
                                placeholder="Título"
                                className={inputClass}
                            />
                            <input
                                value={l.url}
                                onChange={(e) => updateLink(l.key, { url: e.target.value })}
                                placeholder="https://..."
                                className={inputClass}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => removeLink(l.key)}
                            title="Remover link"
                            className="mt-1 shrink-0 rounded-lg p-1.5 text-red-500 transition hover:bg-red-50"
                        >
                            <TrashIcon />
                        </button>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={addLink}
                className="mt-3 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-brand-400 hover:text-brand-700"
            >
                + Novo link
            </button>

            <div className="mt-5 flex justify-end gap-2">
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
                    disabled={saving}
                    className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
                >
                    {saving ? 'Salvando…' : 'Salvar'}
                </button>
            </div>
        </ModalShell>
    );
}

/* --- Linha de tópico-folha: nome + acertos/erros/total/desempenho + ... - */
function TopicRow({ topic, onManageLinks }) {
    const toggle = () =>
        router.post(
            `/edital-verticalizado/topicos/${topic.id}/alternar`,
            {},
            { preserveScroll: true, preserveState: true },
        );

    return (
        <li className="flex items-center gap-1 rounded-lg px-2 py-2 transition hover:bg-slate-50">
            <button type="button" onClick={toggle} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <span
                    className={
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ' +
                        (topic.completed
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-slate-300 text-transparent')
                    }
                >
                    <CheckIcon />
                </span>
                <span
                    className={
                        'min-w-0 flex-1 truncate text-sm ' +
                        (topic.completed ? 'text-slate-400 line-through' : 'text-slate-700')
                    }
                >
                    <span className="mr-1.5 tabular-nums text-slate-400">{topic.number}.</span>
                    {topic.name}
                </span>
            </button>

            <span className={colClass + ' tabular-nums text-emerald-600'}>{topic.acertos}</span>
            <span className={colClass + ' tabular-nums text-red-500'}>{topic.erros}</span>
            <span className={colClass + ' tabular-nums text-slate-600'}>{topic.total_questoes}</span>
            <span className={colClass + ' tabular-nums font-semibold text-slate-700'}>{topic.desempenho}%</span>
            <span className={colClass + ' text-[11px] text-slate-500'}>{topic.last_studied_at ?? '—'}</span>
            <span className={colClass + ' tabular-nums text-slate-600'}>{topic.times_studied}x</span>
            <span className={colClass}>
                <button
                    type="button"
                    onClick={() => onManageLinks(topic)}
                    className="text-xs font-medium text-brand-600 hover:underline"
                >
                    Adicionar
                </button>
            </span>
        </li>
    );
}

function TopicNode({ topic, onManageLinks }) {
    const [open, setOpen] = useState(true);

    if (topic.subtopics.length === 0) {
        return <TopicRow topic={topic} onManageLinks={onManageLinks} />;
    }

    return (
        <li>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-slate-50"
            >
                <ChevronDownIcon
                    className={
                        'h-5 w-5 shrink-0 text-slate-400 transition-transform ' + (open ? '' : '-rotate-90')
                    }
                />
                <span className="flex-1 text-sm font-semibold text-slate-800">
                    <span className="mr-1.5 tabular-nums text-slate-400">{topic.number}.</span>
                    {topic.name}
                </span>
            </button>

            {open && (
                <ul className="ml-6 space-y-0.5 border-l border-slate-100 pl-3">
                    {topic.subtopics.map((st) => (
                        <TopicRow key={st.id} topic={st} onManageLinks={onManageLinks} />
                    ))}
                </ul>
            )}
        </li>
    );
}

/* --- Pílula com os agregados da disciplina (só os valores) --------------- */
function SubjectStatsPill({ stats }) {
    return (
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs tabular-nums sm:flex">
            <span className="text-emerald-600">{stats.acertos}</span>
            <span className="text-slate-300">/</span>
            <span className="text-red-500">{stats.erros}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-600">{stats.total}</span>
            <span className="mx-0.5 text-slate-300">·</span>
            <span className="font-semibold text-slate-700">{stats.desempenho}%</span>
        </span>
    );
}

function SubjectSection({ subject, expanded, onToggle, onEdit, onManageLinks }) {
    const pct = subject.topics_total > 0
        ? Math.round((subject.topics_completed / subject.topics_total) * 100)
        : 0;

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 px-5 py-4">
                <button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: subject.color }} />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">
                        {subject.name}
                    </span>
                    <span className="shrink-0 text-xs font-medium tabular-nums text-slate-500">
                        {subject.topics_completed}/{subject.topics_total} vistos
                    </span>
                </button>

                <SubjectStatsPill stats={subject.stats} />

                <button
                    type="button"
                    onClick={() =>
                        onEdit({
                            id: subject.id,
                            name: subject.name,
                            color: subject.color,
                            topics: subject.topics.map((t) => ({ id: t.id, name: t.name })),
                        })
                    }
                    title="Editar disciplina"
                    className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                    <PencilIcon />
                </button>

                <button type="button" onClick={onToggle} className="shrink-0 text-slate-400">
                    <ChevronDownIcon className={'h-4 w-4 transition-transform ' + (expanded ? 'rotate-180' : '')} />
                </button>
            </div>

            <div className="px-5 pb-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: subject.color }}
                    />
                </div>
            </div>

            {expanded && (
                <div className="border-t border-slate-100 px-3 py-3">
                    {subject.topics.length > 0 && (
                        <div className="flex items-center gap-1 px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            <span className="flex-1">Tópico</span>
                            <span className={colClass}>Acertos</span>
                            <span className={colClass}>Erros</span>
                            <span className={colClass}>Total</span>
                            <span className={colClass}>Desemp.</span>
                            <span className={colClass}>Últ. estudo</span>
                            <span className={colClass}>Vezes</span>
                            <span className={colClass}>Link</span>
                        </div>
                    )}
                    <ul className="space-y-0.5">
                        {subject.topics.length === 0 ? (
                            <li className="px-2 py-2 text-xs text-slate-400">Sem tópicos cadastrados.</li>
                        ) : (
                            subject.topics.map((t) => (
                                <TopicNode key={t.id} topic={t} onManageLinks={onManageLinks} />
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default function EditalVerticalizado({
    hasPlan = false,
    total_topics: totalTopics = 0,
    completed_topics: completedTopics = 0,
    subjects = [],
}) {
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [editingSubject, setEditingSubject] = useState(null);
    const [removingSubject, setRemovingSubject] = useState(null);
    const [linksTopic, setLinksTopic] = useState(null);

    const toggleSubject = (id) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    if (!hasPlan) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="text-slate-500">
                    Crie um plano de estudos para acompanhar seu avanço no edital.
                </p>
                <Link
                    href="/planos"
                    className="mt-3 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
                >
                    Criar meu plano
                </Link>
            </div>
        );
    }

    const overallPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return (
        <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-800">Avanço no edital</span>
                    <span className="tabular-nums text-slate-500">
                        {completedTopics} de {totalTopics} tópicos concluídos
                    </span>
                </div>
                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${overallPct}%` }}
                    />
                </div>
            </section>

            <section className="space-y-3">
                {subjects.map((s) => (
                    <SubjectSection
                        key={s.id}
                        subject={s}
                        expanded={expandedIds.has(s.id)}
                        onToggle={() => toggleSubject(s.id)}
                        onEdit={setEditingSubject}
                        onManageLinks={setLinksTopic}
                    />
                ))}
            </section>

            {editingSubject && (
                <EditDisciplinaModal
                    subject={editingSubject}
                    onClose={() => setEditingSubject(null)}
                    onDelete={() => {
                        setEditingSubject(null);
                        setRemovingSubject(editingSubject);
                    }}
                />
            )}
            {removingSubject && (
                <DeleteConfirmModal
                    url={`/disciplinas/${removingSubject.id}`}
                    title="Remover disciplina?"
                    message={`Todos os tópicos de "${removingSubject.name}" e o progresso registrado serão removidos. Esta ação não pode ser desfeita.`}
                    onClose={() => setRemovingSubject(null)}
                />
            )}
            {linksTopic && <TopicLinksModal topic={linksTopic} onClose={() => setLinksTopic(null)} />}
        </div>
    );
}

EditalVerticalizado.layout = (page) => <AppLayout title="Edital Verticalizado">{page}</AppLayout>;
