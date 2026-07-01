import { useState } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

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

function CargoDetail({ selected }) {
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

            <Link
                href={`/onboarding?course=${cargo.course_id}`}
                className="mt-5 block w-full rounded-lg bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
                Avançar para criar o plano →
            </Link>
        </div>
    );
}

export default function PlanosIndex({ plans = [] }) {
    const [selected, setSelected] = useState(null);

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            {/* Criar Novo Plano — abre em nova aba */}
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
                        <CargoDetail selected={selected} />
                    </div>
                </div>
            )}
        </div>
    );
}

PlanosIndex.layout = (page) => <AppLayout title="Planos">{page}</AppLayout>;
