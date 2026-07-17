import { useEffect, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import CriarPlanejamentoModal from '@/Components/CriarPlanejamentoModal';

/* --- Seus planos: card por plano, com ativar / apagar ------------------- */
function PlanSummaryRow({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-2">
            <dt className="text-slate-500">{label}</dt>
            <dd className="font-medium text-slate-800">{value}</dd>
        </div>
    );
}

function PlanSummaryCard({ plan, onActivate, onDelete }) {
    const [confirming, setConfirming] = useState(false);
    const [busy, setBusy] = useState(false);

    const remove = () => {
        setBusy(true);
        onDelete(plan.id, () => {
            setBusy(false);
            setConfirming(false);
        });
    };

    return (
        <div
            className={
                'rounded-xl border bg-white p-5 shadow-sm ' +
                (plan.is_active
                    ? 'border-brand-300 ring-1 ring-brand-200'
                    : 'border-slate-200')
            }
        >
            <div className="flex items-start justify-between gap-2">
                <Link
                    href={`/planos/${plan.id}`}
                    className="font-semibold text-slate-900 transition hover:text-brand-700 hover:underline"
                >
                    {plan.name}
                </Link>
                <div className="flex shrink-0 items-center gap-1.5">
                    {plan.is_archived && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                            Arquivado
                        </span>
                    )}
                    {plan.is_active && (
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                            Ativo
                        </span>
                    )}
                </div>
            </div>

            <dl className="mt-4 space-y-1.5 text-sm">
                <PlanSummaryRow label="Cargo" value={plan.cargo_name ?? '—'} />
                <PlanSummaryRow label="Disciplinas" value={plan.subjects_count} />
                <PlanSummaryRow label="Tópicos" value={plan.topics_count} />
                <PlanSummaryRow label="Criado em" value={plan.created_at} />
            </dl>

            {confirming ? (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="text-sm font-medium text-red-800">
                        Tem certeza? As tarefas e revisões deste plano serão removidas.
                    </p>
                    <div className="mt-3 flex gap-2">
                        <button
                            type="button"
                            onClick={() => setConfirming(false)}
                            disabled={busy}
                            className="flex-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={remove}
                            disabled={busy}
                            className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
                        >
                            {busy ? 'Apagando…' : 'Sim, apagar'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mt-4 flex items-center gap-2">
                    {!plan.is_active && (
                        <button
                            type="button"
                            onClick={() => onActivate(plan.id)}
                            className="flex-1 rounded-lg px-3 py-1.5 text-sm font-medium text-brand-700 transition hover:bg-brand-50"
                        >
                            Tornar ativo
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setConfirming(true)}
                        className="flex-1 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                        Apagar
                    </button>
                </div>
            )}
        </div>
    );
}

function MyPlans({ plans }) {
    const activate = (id) =>
        router.post(`/planos/${id}/ativar`, {}, { preserveScroll: true });

    const remove = (id, onFinish) =>
        router.delete(`/planos/${id}`, { preserveScroll: true, onFinish });

    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Seus planos
            </p>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {plans.map((p) => (
                    <PlanSummaryCard key={p.id} plan={p} onActivate={activate} onDelete={remove} />
                ))}
            </div>
        </div>
    );
}

/* --- Catálogo: cards por órgão ------------------------------------------ */
function PlanCard({ plan, plannedCourseIds, selectedId, onSelect }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-base font-semibold text-slate-900">{plan.title}</p>

            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-400">Cargos</p>
            <ul className="mt-2 space-y-2">
                {plan.cargos.map((cargo) => {
                    const active = selectedId === cargo.id;
                    const planned = plannedCourseIds.includes(cargo.course_id);
                    return (
                        <li key={cargo.id}>
                            <button
                                type="button"
                                onClick={() => onSelect(plan, cargo)}
                                className={
                                    'flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition ' +
                                    (active
                                        ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600'
                                        : 'border-slate-200 hover:border-brand-400')
                                }
                            >
                                <span className="font-medium text-slate-800">
                                    {cargo.name}
                                    {cargo.code ? ` (${cargo.code})` : ''}
                                </span>
                                {planned ? (
                                    <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                        Plano criado
                                    </span>
                                ) : (
                                    <span className="ml-2 text-slate-400">›</span>
                                )}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

function CargoDetail({ selected, existingPlan, onCreatePlan }) {
    const [confirming, setConfirming] = useState(false);
    const [busy, setBusy] = useState(false);

    // Reset the confirmation whenever the selected cargo changes.
    useEffect(() => setConfirming(false), [selected?.cargo.id]);

    if (!selected) {
        return (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
                Selecione um cargo para ver os detalhes e criar o plano.
            </div>
        );
    }

    const { cargo, orgao } = selected;

    const removeExisting = () => {
        setBusy(true);
        router.delete(`/planos/${existingPlan.id}`, {
            preserveScroll: true,
            onFinish: () => setBusy(false),
        });
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-lg font-semibold text-slate-900">
                {cargo.name}
                {cargo.code ? ` (${cargo.code})` : ''}
            </p>
            <p className="mt-0.5 text-sm text-slate-500">{orgao}</p>

            <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-4 text-center">
                    <p className="text-2xl font-bold text-slate-900">{cargo.subjects_count}</p>
                    <p className="text-xs text-slate-500">disciplinas</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4 text-center">
                    <p className="text-2xl font-bold text-slate-900">{cargo.topics_count}</p>
                    <p className="text-xs text-slate-500">tópicos</p>
                </div>
            </div>

            {existingPlan ? (
                <div className="mt-5 space-y-3">
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Você já tem um plano para este cargo. Para criar um novo, apague o atual
                        primeiro.
                    </div>
                    {!confirming ? (
                        <button
                            type="button"
                            onClick={() => setConfirming(true)}
                            className="w-full rounded-lg border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                            Apagar plano deste cargo
                        </button>
                    ) : (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                            <p className="text-sm font-medium text-red-800">
                                Tem certeza? As tarefas e revisões serão removidas.
                            </p>
                            <div className="mt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setConfirming(false)}
                                    disabled={busy}
                                    className="flex-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={removeExisting}
                                    disabled={busy}
                                    className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
                                >
                                    {busy ? 'Apagando…' : 'Sim, apagar'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => onCreatePlan(cargo)}
                    className="mt-5 block w-full rounded-lg bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
                >
                    Avançar para criar o plano →
                </button>
            )}
        </div>
    );
}

export default function PlanosIndex({ catalog = [], myPlans = [] }) {
    const [selected, setSelected] = useState(null);
    const [creatingCargo, setCreatingCargo] = useState(null);
    const plannedCourseIds = myPlans.map((p) => p.course_id);
    const selectedPlan = selected
        ? myPlans.find((p) => p.course_id === selected.cargo.course_id) ?? null
        : null;

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            {/* Seus planos (um por cargo) */}
            {myPlans.length > 0 && <MyPlans plans={myPlans} />}

            {/* Criar Novo Plano */}
            <Link
                href="/planos/novo"
                className="flex items-center gap-4 rounded-xl border-2 border-dashed border-brand-300 bg-brand-50/50 p-5 transition hover:border-brand-500 hover:bg-brand-50"
            >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold leading-none text-white">
                    +
                </span>
                <div>
                    <p className="font-semibold text-brand-700">Criar Novo Plano</p>
                    <p className="text-sm text-slate-500">
                        Crie um novo plano para adicionar disciplinas a partir ou não de um edital.
                    </p>
                </div>
            </Link>

            {catalog.length === 0 ? (
                <p className="text-center text-sm text-slate-400">
                    Nenhum plano disponível no momento.
                </p>
            ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        {catalog.map((plan) => (
                            <PlanCard
                                key={plan.orgao}
                                plan={plan}
                                plannedCourseIds={plannedCourseIds}
                                selectedId={selected?.cargo.id}
                                onSelect={(p, cargo) => setSelected({ cargo, orgao: p.orgao })}
                            />
                        ))}
                    </div>

                    <div className="lg:sticky lg:top-20 lg:self-start">
                        <CargoDetail
                            selected={selected}
                            existingPlan={selectedPlan}
                            onCreatePlan={setCreatingCargo}
                        />
                    </div>
                </div>
            )}

            {creatingCargo && (
                <CriarPlanejamentoModal
                    course={{
                        id: creatingCargo.course_id,
                        name: creatingCargo.name,
                        subjects: creatingCargo.subjects ?? [],
                    }}
                    onClose={() => setCreatingCargo(null)}
                />
            )}
        </div>
    );
}

PlanosIndex.layout = (page) => <AppLayout title="Planos">{page}</AppLayout>;
