import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const TYPE_LABEL = { theory: 'Teoria', review: 'Revisão' };
const FORMAT_LABEL = { pdf: 'PDF', video: 'Vídeo' };

function durationLabel(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h && m) return `~${h}h${String(m).padStart(2, '0')}`;
    if (h) return `~${h}h`;
    return `~${m}min`;
}

function clock(totalSeconds) {
    const pad = (n) => String(n).padStart(2, '0');
    const hh = Math.floor(totalSeconds / 3600);
    const mm = Math.floor((totalSeconds % 3600) / 60);
    const ss = totalSeconds % 60;
    return hh ? `${hh}:${pad(mm)}:${pad(ss)}` : `${pad(mm)}:${pad(ss)}`;
}

function InfoRow({ label, value }) {
    return (
        <div className="flex items-center justify-between py-2 text-sm">
            <span className="text-slate-500">{label}</span>
            <span className="font-medium text-slate-800">{value}</span>
        </div>
    );
}

export default function TaskDetails({ task, progress, externalUrl }) {
    const isReview = task.type === 'review';

    // Cronômetro de estudo
    const [seconds, setSeconds] = useState(0);
    const [running, setRunning] = useState(false);
    const [processing, setProcessing] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (running) {
            intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
        }
        return () => clearInterval(intervalRef.current);
    }, [running]);

    const progressPct = progress.total ? Math.round((progress.current / progress.total) * 100) : 0;

    const complete = () => {
        setRunning(false);
        setProcessing(true);
        router.post(
            `/tarefas/${task.id}/concluir`,
            { duration_seconds: seconds },
            { onFinish: () => setProcessing(false) },
        );
    };

    return (
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Corpo */}
            <div className="lg:col-span-2">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2">
                        <span
                            className={
                                'rounded-full px-2.5 py-0.5 text-xs font-medium ' +
                                (isReview ? 'bg-amber-100 text-amber-700' : 'bg-brand-100 text-brand-700')
                            }
                        >
                            {TYPE_LABEL[task.type] ?? task.type}
                        </span>
                        {task.subject && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                <span
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: task.subject.color ?? '#94a3b8' }}
                                />
                                {task.subject.name}
                            </span>
                        )}
                    </div>

                    <h1 className="mt-3 text-2xl font-bold text-slate-900">{task.title}</h1>

                    <div className="mt-6 rounded-lg border border-slate-100 bg-slate-50 p-4">
                        <h2 className="text-sm font-semibold text-slate-700">Orientação da aula</h2>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                            {isReview ? (
                                <>
                                    Hoje é um dia de <strong>revisão</strong>. Retome o conteúdo desta aula
                                    para fixá-lo na memória de longo prazo. O material oficial está no seu{' '}
                                    <strong>curso preparatório</strong> — use o botão{' '}
                                    <em>“Acessar aula no curso”</em> ao lado. Ao terminar, registre a
                                    conclusão em <em>“Concluir e continuar”</em>.
                                </>
                            ) : (
                                <>
                                    Hoje é um dia de <strong>estudo</strong>. O material oficial desta aula
                                    está no seu <strong>curso preparatório</strong> — use o botão{' '}
                                    <em>“Acessar aula no curso”</em> ao lado para abri-la. Ao terminar,
                                    registre a conclusão em <em>“Concluir e continuar”</em>.
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Sidebar direita */}
            <aside className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-600">
                            Tarefa {progress.current} de {progress.total}
                        </span>
                        <span className="text-slate-400">{progressPct}%</span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-brand-600 transition-all"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>

                    <div className="mt-4 divide-y divide-slate-100">
                        <InfoRow label="Duração" value={durationLabel(task.planned_minutes)} />
                        <InfoRow label="Formato" value={FORMAT_LABEL[task.format] ?? task.format} />
                        <InfoRow label="Tipo" value={TYPE_LABEL[task.type] ?? task.type} />
                    </div>
                </div>

                {/* Cronômetro */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-slate-700">Cronômetro de estudo</h2>
                    <p className="mt-3 text-center font-mono text-3xl font-bold tabular-nums text-slate-900">
                        {clock(seconds)}
                    </p>
                    <div className="mt-3 flex gap-2">
                        <button
                            type="button"
                            onClick={() => setRunning((r) => !r)}
                            className={
                                'flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white transition ' +
                                (running ? 'bg-amber-500 hover:bg-amber-600' : 'bg-brand-600 hover:bg-brand-700')
                            }
                        >
                            {running ? 'Pausar' : seconds > 0 ? 'Retomar' : 'Iniciar'}
                        </button>
                        {seconds > 0 && (
                            <button
                                type="button"
                                onClick={() => {
                                    setRunning(false);
                                    setSeconds(0);
                                }}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                            >
                                Zerar
                            </button>
                        )}
                    </div>
                </div>

                <a
                    href={externalUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-400 hover:text-brand-600"
                >
                    Acessar aula no curso ↗
                </a>

                <button
                    type="button"
                    onClick={complete}
                    disabled={processing}
                    className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
                >
                    {processing ? 'Registrando…' : 'Concluir e continuar'}
                </button>
            </aside>
        </div>
    );
}

TaskDetails.layout = (page) => (
    <AppLayout title={page.props.task?.title ?? 'Tarefa'}>{page}</AppLayout>
);
