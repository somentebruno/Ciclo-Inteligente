import AppLayout from '@/Layouts/AppLayout';
import { Link, usePage } from '@inertiajs/react';

function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
}

/** Minutes → "1h30" / "1h" / "45min". */
function formatMinutes(m) {
    if (!m) return '';
    const h = Math.floor(m / 60);
    const min = m % 60;
    if (h && min) return `${h}h${String(min).padStart(2, '0')}`;
    if (h) return `${h}h`;
    return `${min}min`;
}

const TYPE_LABELS = { theory: 'Teoria', review: 'Revisão' };

const BoltIcon = ({ className = 'h-5 w-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
);

const ClockIcon = ({ className = 'h-4 w-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default function Home() {
    const { currentPlan, userPlans = [], auth, focus, nextTask } = usePage().props;
    const firstName = auth.user?.name?.split(' ')[0];

    const pct =
        focus && focus.goal > 0
            ? Math.min(100, Math.round((focus.completed / focus.goal) * 100))
            : 0;

    const subjectPct =
        nextTask && nextTask.subject_total > 0
            ? Math.min(100, Math.round((nextTask.subject_done / nextTask.subject_total) * 100))
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

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* Left column — próxima tarefa */}
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        {nextTask ? (
                            <>
                                <div className="flex items-center gap-2 text-brand-600">
                                    <BoltIcon />
                                    <span className="text-sm font-medium">Próxima tarefa</span>
                                </div>

                                <div className="mt-3 flex items-center gap-2">
                                    <span
                                        className="h-2.5 w-2.5 rounded-full"
                                        style={{ backgroundColor: nextTask.subject?.color }}
                                    />
                                    <span className="text-sm font-medium text-slate-400">
                                        {nextTask.subject?.name}
                                    </span>
                                </div>

                                <h3 className="mt-1 text-lg font-bold leading-snug text-slate-800">
                                    Aula {String(nextTask.lesson_number).padStart(2, '0')}:{' '}
                                    {nextTask.title}
                                </h3>

                                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-brand-500 transition-all"
                                        style={{ width: `${subjectPct}%` }}
                                    />
                                </div>
                                <p className="mt-2 text-xs text-slate-400">
                                    {nextTask.subject_done} de {nextTask.subject_total} aulas
                                    concluídas nesta disciplina
                                </p>

                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-medium text-white">
                                        {TYPE_LABELS[nextTask.type] ?? nextTask.type}
                                    </span>
                                    <span className="text-xs font-medium text-slate-500">
                                        Tarefa {nextTask.day_current}/{nextTask.day_total}
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                        <ClockIcon className="h-3.5 w-3.5" />
                                        {formatMinutes(nextTask.planned_minutes)}
                                    </span>
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium uppercase text-slate-600">
                                        {nextTask.format}
                                    </span>
                                </div>

                                <div className="mt-6 flex flex-wrap items-center gap-4">
                                    <Link
                                        href={`/tarefas/${nextTask.id}`}
                                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
                                    >
                                        Iniciar tarefa
                                    </Link>
                                    <Link
                                        href="/tarefas"
                                        className="text-sm font-semibold text-slate-600 transition hover:text-brand-600"
                                    >
                                        Ver todas as tarefas
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                                <p className="text-slate-500">
                                    Nenhuma tarefa pendente por aqui 🎉
                                </p>
                                <Link
                                    href="/tarefas"
                                    className="mt-2 text-sm font-semibold text-brand-700 hover:underline"
                                >
                                    Ver todas as tarefas
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Right column — reservada para o próximo card */}
                    <div className="hidden lg:block" />
                </div>

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
