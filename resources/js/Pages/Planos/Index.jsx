import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

function CurrentPlanBanner({ plan }) {
    const [confirming, setConfirming] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const remove = () => {
        setDeleting(true);
        router.delete(`/planos/${plan.id}`, {
            preserveScroll: true,
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Seu plano atual
                    </p>
                    <p className="mt-0.5 text-base font-semibold text-slate-900">{plan.name}</p>
                </div>

                {!confirming ? (
                    <button
                        type="button"
                        onClick={() => setConfirming(true)}
                        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                        Apagar plano
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setConfirming(false)}
                            disabled={deleting}
                            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={remove}
                            disabled={deleting}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
                        >
                            {deleting ? 'Apagando…' : 'Sim, apagar'}
                        </button>
                    </div>
                )}
            </div>
            {confirming && (
                <p className="mt-3 text-sm text-red-700">
                    Tem certeza? As tarefas e revisões deste plano serão removidas. Esta ação não
                    pode ser desfeita.
                </p>
            )}
        </div>
    );
}

function PlanCard({ plan, selectedId, onSelect }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-base font-semibold text-slate-900">{plan.title}</p>

            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-400">Cargos</p>
            <ul className="mt-2 space-y-2">
                {plan.cargos.map((cargo) => {
                    const active = selectedId === cargo.id;
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
                                <span className="ml-2 text-slate-400">›</span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

function CargoDetail({ selected, hasPlan }) {
    if (!selected) {
        return (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
                Selecione um cargo para ver os detalhes e criar o plano.
            </div>
        );
    }

    const { cargo, orgao } = selected;

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

            {hasPlan ? (
                <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
                    Você já tem um plano. Apague o plano atual acima para criar um novo.
                </div>
            ) : (
                <Link
                    href={`/onboarding?course=${cargo.course_id}`}
                    className="mt-5 block w-full rounded-lg bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
                >
                    Avançar para criar o plano →
                </Link>
            )}
        </div>
    );
}

export default function PlanosIndex({ plans = [], currentPlan = null }) {
    const [selected, setSelected] = useState(null);
    const hasPlan = !!currentPlan;

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            {/* Plano atual do aluno (se houver) — com opção de apagar */}
            {hasPlan && <CurrentPlanBanner plan={currentPlan} />}

            {/* Criar Novo Plano — abre em nova aba */}
            {hasPlan ? (
                <div className="flex items-center gap-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-300 text-2xl font-bold leading-none text-white">
                        +
                    </span>
                    <div>
                        <p className="font-semibold text-slate-500">Criar Novo Plano</p>
                        <p className="text-sm text-slate-400">
                            Apague o plano atual acima para poder criar um novo.
                        </p>
                    </div>
                </div>
            ) : (
                <a
                    href="/planos/novo"
                    target="_blank"
                    rel="noopener noreferrer"
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
                </a>
            )}

            {plans.length === 0 ? (
                <p className="text-center text-sm text-slate-400">
                    Nenhum plano disponível no momento.
                </p>
            ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        {plans.map((plan) => (
                            <PlanCard
                                key={plan.orgao}
                                plan={plan}
                                selectedId={selected?.cargo.id}
                                onSelect={(p, cargo) => setSelected({ cargo, orgao: p.orgao })}
                            />
                        ))}
                    </div>

                    <div className="lg:sticky lg:top-20 lg:self-start">
                        <CargoDetail selected={selected} hasPlan={hasPlan} />
                    </div>
                </div>
            )}
        </div>
    );
}

PlanosIndex.layout = (page) => <AppLayout title="Planos">{page}</AppLayout>;
