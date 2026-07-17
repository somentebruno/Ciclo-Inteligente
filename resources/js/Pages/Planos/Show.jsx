import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import DisciplinaCard from '@/Components/DisciplinaCard';
import ModalShell from '@/Components/ModalShell';
import DeleteConfirmModal from '@/Components/DeleteConfirmModal';
import EditDisciplinaModal from '@/Components/EditDisciplinaModal';

const SUBJECT_COLORS = [
    '#fecaca', '#fed7aa', '#fef08a', '#d9f99d', '#bbf7d0',
    '#a7f3d0', '#99f6e4', '#a5f3fc', '#bae6fd', '#bfdbfe',
    '#c7d2fe', '#ddd6fe', '#e9d5ff', '#f5d0fe', '#fbcfe8',
];

const ChevronLeftIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);

const CloseXIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ArchiveIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 8h14M5 8a2 2 0 01-2-2V4a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 01-2 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
        />
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

const EyeIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const inputClass =
    'mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 ' +
    'focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500';
const labelClass = 'block text-xs font-medium uppercase tracking-wide text-slate-400';

function EditPlanModal({ plan, onClose }) {
    const [name, setName] = useState(plan.name);
    const [observacoes, setObservacoes] = useState(plan.observacoes ?? '');
    const [saving, setSaving] = useState(false);

    const submit = () => {
        if (!name.trim()) return;
        setSaving(true);
        router.patch(
            `/planos/${plan.id}`,
            { name, observacoes },
            { preserveScroll: true, onSuccess: onClose, onFinish: () => setSaving(false) },
        );
    };

    return (
        <ModalShell onClose={onClose} busy={saving}>
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Editar plano</h2>
                <button type="button" onClick={onClose} className="text-slate-400 transition hover:text-slate-600">
                    <CloseXIcon />
                </button>
            </div>

            <label className={`${labelClass} mt-5`}>Nome do plano</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />

            <label className={`${labelClass} mt-4`}>Observações</label>
            <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={4}
                className={inputClass}
            />

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
                    disabled={saving || !name.trim()}
                    className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
                >
                    {saving ? 'Salvando…' : 'Salvar'}
                </button>
            </div>
        </ModalShell>
    );
}

function NovaDisciplinaModal({ planId, onClose }) {
    const [name, setName] = useState('');
    const [color, setColor] = useState(SUBJECT_COLORS[0]);
    const [saving, setSaving] = useState(false);

    const submit = () => {
        if (!name.trim()) return;
        setSaving(true);
        router.post(
            `/planos/${planId}/disciplinas`,
            { name, color },
            { preserveScroll: true, onSuccess: onClose, onFinish: () => setSaving(false) },
        );
    };

    return (
        <ModalShell onClose={onClose} busy={saving}>
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Nova disciplina</h2>
                <button type="button" onClick={onClose} className="text-slate-400 transition hover:text-slate-600">
                    <CloseXIcon />
                </button>
            </div>

            <label className={`${labelClass} mt-5`}>Nome</label>
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                placeholder="Ex: Direito Constitucional"
                className={inputClass}
            />

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
                    disabled={saving || !name.trim()}
                    className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
                >
                    {saving ? 'Criando…' : 'Criar'}
                </button>
            </div>
        </ModalShell>
    );
}

/* --- Card de disciplina com slide-in de ações no hover ------------------- */
function InteractiveDisciplinaCard({ subject, onEdit, onRemove }) {
    return (
        <div className="group relative overflow-hidden rounded-xl">
            <DisciplinaCard subject={subject} />

            <div
                className={
                    'absolute inset-0 flex translate-y-full items-center justify-center gap-2 rounded-xl bg-white/95 ' +
                    'opacity-0 shadow-sm transition-all duration-200 ease-out ' +
                    'group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100'
                }
            >
                <Link
                    href={`/disciplinas/${subject.id}`}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-400 hover:text-brand-700"
                >
                    <EyeIcon />
                    Visualizar
                </Link>
                <button
                    type="button"
                    onClick={() => onEdit(subject)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-400 hover:text-brand-700"
                >
                    <PencilIcon />
                    Editar
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(subject)}
                    className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                    <TrashIcon />
                    Remover
                </button>
            </div>
        </div>
    );
}

/* --- Card principal: título + editais/cargo/disciplinas/tópicos/obs ----- */
function PlanInfoBadge({ label, value }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-xs">
            <span className="text-slate-400">{label}:</span>
            <span className="font-semibold text-slate-700">{value}</span>
        </span>
    );
}

function PlanInfoCard({ plan, onArchive, onEdit, onDelete, onNewSubject }) {
    return (
        <div className="flex h-full flex-col justify-center rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-base font-semibold text-slate-900">{plan.name}</p>
                    {plan.is_archived && (
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                            Arquivado
                        </span>
                    )}
                </div>

                <div className="flex shrink-0 items-center gap-0.5 text-slate-400">
                    <button
                        type="button"
                        onClick={onArchive}
                        title={plan.is_archived ? 'Desarquivar' : 'Arquivar'}
                        className="rounded-lg p-1 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        <ArchiveIcon />
                    </button>
                    <button
                        type="button"
                        onClick={onEdit}
                        title="Editar"
                        className="rounded-lg p-1 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        <PencilIcon />
                    </button>
                    <button
                        type="button"
                        onClick={onDelete}
                        title="Excluir"
                        className="rounded-lg p-1 transition hover:bg-red-50 hover:text-red-600"
                    >
                        <TrashIcon />
                    </button>
                </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <PlanInfoBadge label="Editais" value={plan.edital} />
                <PlanInfoBadge label="Cargos" value={plan.cargo_name ?? '—'} />
                <PlanInfoBadge label="Disciplinas" value={plan.subjects_count} />
                <PlanInfoBadge label="Tópicos" value={plan.topics_count} />
            </div>

            {plan.observacoes && (
                <p className="mt-1.5 truncate text-xs text-slate-500" title={plan.observacoes}>
                    <span className="text-slate-400">Observações: </span>
                    {plan.observacoes}
                </p>
            )}

            <button
                type="button"
                onClick={onNewSubject}
                className="mt-2.5 self-start rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
                + Nova Disciplina
            </button>
        </div>
    );
}

/* --- Card de resumo: horas de estudo / questões / desempenho ------------ */
function StatsCard({ stats }) {
    return (
        <div className="flex h-full flex-col justify-center rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="text-center">
                <p className="text-xl font-bold leading-tight text-slate-900">{stats.study_time}</p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Horas de Estudo
                </p>
            </div>

            <div className="mt-2 grid grid-cols-2 divide-x divide-slate-200 border-t border-slate-100 pt-2 text-center">
                <div>
                    <p className="text-lg font-bold leading-tight text-slate-900">{stats.questions_total}</p>
                    <p className="text-[11px] text-slate-500">questões</p>
                </div>
                <div>
                    <p className="text-lg font-bold leading-tight text-slate-900">{stats.accuracy}%</p>
                    <p className="text-[11px] text-slate-500">Desempenho</p>
                </div>
            </div>
        </div>
    );
}

export default function PlanoShow({ plan, stats, subjects = [] }) {
    const [editing, setEditing] = useState(false);
    const [creatingSubject, setCreatingSubject] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [removingSubject, setRemovingSubject] = useState(null);

    const toggleArchive = () =>
        router.post(`/planos/${plan.id}/arquivar`, {}, { preserveScroll: true });

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <Link
                href="/planos"
                className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-brand-600"
            >
                <ChevronLeftIcon />
                Planos
            </Link>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-10">
                <div className="lg:col-span-7">
                    <PlanInfoCard
                        plan={plan}
                        onArchive={toggleArchive}
                        onEdit={() => setEditing(true)}
                        onDelete={() => setDeleting(true)}
                        onNewSubject={() => setCreatingSubject(true)}
                    />
                </div>
                <div className="lg:col-span-3">
                    <StatsCard stats={stats} />
                </div>
            </div>

            <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Disciplinas</p>
                {subjects.length === 0 ? (
                    <p className="mt-3 text-center text-sm text-slate-400">
                        Nenhuma disciplina cadastrada neste plano.
                    </p>
                ) : (
                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {subjects.map((subject) => (
                            <InteractiveDisciplinaCard
                                key={subject.id}
                                subject={subject}
                                onEdit={setEditingSubject}
                                onRemove={setRemovingSubject}
                            />
                        ))}
                    </div>
                )}
            </div>

            {editing && <EditPlanModal plan={plan} onClose={() => setEditing(false)} />}
            {creatingSubject && (
                <NovaDisciplinaModal planId={plan.id} onClose={() => setCreatingSubject(false)} />
            )}
            {deleting && (
                <DeleteConfirmModal
                    url={`/planos/${plan.id}`}
                    title="Apagar plano?"
                    message="As tarefas e revisões deste plano serão removidas. Esta ação não pode ser desfeita."
                    onClose={() => setDeleting(false)}
                />
            )}
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
        </div>
    );
}

PlanoShow.layout = (page) => <AppLayout title={page.props.plan?.name ?? 'Plano'}>{page}</AppLayout>;
