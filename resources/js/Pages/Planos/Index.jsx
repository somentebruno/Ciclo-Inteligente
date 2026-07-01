import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

function PlanCard({ plan }) {
    return (
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="font-semibold text-slate-900">{plan.name}</p>
                    <p className="text-sm text-slate-500">
                        {plan.orgao ?? 'Órgão não informado'}
                        {plan.exam_board ? ` · ${plan.exam_board}` : ''}
                    </p>
                </div>
            </div>

            {plan.cargos.length > 0 && (
                <div className="mt-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Cargos</p>
                    <ul className="mt-1 space-y-1">
                        {plan.cargos.map((cargo) => (
                            <li key={cargo.id} className="text-sm text-slate-700">
                                • {cargo.name}
                                {cargo.code ? ` (${cargo.code})` : ''}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="mt-4 flex gap-4 border-t border-slate-100 pt-3 text-sm text-slate-500">
                <span>
                    <strong className="text-slate-800">{plan.subjects_count}</strong> disciplinas
                </span>
                <span>
                    <strong className="text-slate-800">{plan.topics_count}</strong> tópicos
                </span>
            </div>
        </div>
    );
}

export default function PlanosIndex({ plans = [] }) {
    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Criar Novo Plano — abre em nova aba */}
                <a
                    href="/planos/novo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-40 flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-300 bg-brand-50/50 p-5 text-center transition hover:border-brand-500 hover:bg-brand-50"
                >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold leading-none text-white">
                        +
                    </span>
                    <p className="mt-3 font-semibold text-brand-700">Criar Novo Plano</p>
                    <p className="mt-1 text-sm text-slate-500">
                        Crie um novo plano para adicionar disciplinas a partir ou não de um edital.
                    </p>
                </a>

                {plans.map((plan) => (
                    <PlanCard key={plan.id} plan={plan} />
                ))}
            </div>

            {plans.length === 0 && (
                <p className="text-center text-sm text-slate-400">
                    Você ainda não tem planos criados. Clique em “Criar Novo Plano” para começar.
                </p>
            )}
        </div>
    );
}

PlanosIndex.layout = (page) => <AppLayout title="Planos">{page}</AppLayout>;
