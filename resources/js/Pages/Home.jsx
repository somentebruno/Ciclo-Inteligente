import AppLayout from '@/Layouts/AppLayout';
import { Link, usePage } from '@inertiajs/react';

function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
}

export default function Home() {
    const { currentPlan, userPlans = [], auth, focus } = usePage().props;
    const firstName = auth.user?.name?.split(' ')[0];

    const pct =
        focus && focus.goal > 0
            ? Math.min(100, Math.round((focus.completed / focus.goal) * 100))
            : 0;

    return (
        <AppLayout title="Início">
            <div className="space-y-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        {getGreeting()}, {firstName} 👊
                    </h1>
                    <p className="mt-1 text-slate-600">
                        Foque na próxima tarefa para manter o ritmo.
                    </p>
                </div>

                {focus && (
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                            Foco de hoje
                        </span>

                        <span className="text-sm text-slate-500">
                            Meta:{' '}
                            <span className="font-semibold text-slate-700">
                                {focus.goal} {focus.goal === 1 ? 'tarefa' : 'tarefas'}
                            </span>
                        </span>

                        <span className="text-sm text-slate-500">
                            Concluídas hoje:{' '}
                            <span className="font-semibold text-slate-700">
                                {focus.completed}
                            </span>
                        </span>

                        <div className="flex min-w-[140px] flex-1 items-center gap-2">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className={
                                        'h-full rounded-full transition-all ' +
                                        (focus.done ? 'bg-emerald-500' : 'bg-brand-500')
                                    }
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <span className="text-xs font-medium tabular-nums text-slate-400">
                                {pct}%
                            </span>
                        </div>

                        {focus.done ? (
                            <span className="text-sm font-semibold text-emerald-600">
                                Meta do dia concluída 👏
                            </span>
                        ) : focus.goal === 0 ? (
                            <span className="text-sm text-slate-400">
                                Nenhuma tarefa para hoje
                            </span>
                        ) : (
                            <span className="text-sm font-medium text-slate-500">
                                Faltam {focus.goal - focus.completed}
                            </span>
                        )}
                    </div>
                )}

                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    {currentPlan ? (
                    <>
                        <p className="text-slate-600 mb-4">
                            Este é o seu plano de estudos atual:
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 rounded-lg font-medium border border-brand-200">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                            </svg>
                            {currentPlan.name}
                        </div>

                        <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500">
                            <p>
                                Todo o conteúdo do site (Metas, Tarefas, Revisões, Plano Semanal e
                                Desempenho) reflete este plano.
                            </p>
                            <p className="mt-2">
                                {userPlans.length > 1
                                    ? 'Você tem mais de um plano — troque o plano ativo pelo seletor no topo da página.'
                                    : 'Você pode ter um plano por cargo.'}{' '}
                                Para criar ou apagar planos, vá em{' '}
                                <Link href="/planos" className="font-medium text-brand-700 underline">
                                    Planos
                                </Link>
                                .
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-slate-600 mb-4">
                            Você ainda não tem um plano de estudos. Crie um para começar.
                        </p>
                        <Link
                            href="/planos"
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-brand-700"
                        >
                            Criar meu plano
                        </Link>
                    </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
