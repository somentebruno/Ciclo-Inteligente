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

const DURATIONS = [
    { label: '30min', minutes: 30 },
    { label: '45min', minutes: 45 },
    { label: '1h', minutes: 60 },
    { label: '1h15', minutes: 75 },
    { label: '1h30', minutes: 90 },
    { label: '1h45', minutes: 105 },
    { label: '2h', minutes: 120 },
    { label: '2h30', minutes: 150 },
    { label: '3h+', minutes: 180 },
];

function ModeOption({ selected, onSelect, title, desc }) {
    return (
        <button
            type="button"
            onClick={onSelect}
            className={
                'flex w-full gap-3 rounded-lg border p-3 text-left transition ' +
                (selected
                    ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                    : 'border-slate-200 hover:border-brand-300')
            }
        >
            <span
                className={
                    'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ' +
                    (selected ? 'border-brand-600' : 'border-slate-300')
                }
            >
                {selected && <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />}
            </span>
            <span>
                <span className="block text-sm font-semibold text-slate-800">{title}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{desc}</span>
            </span>
        </button>
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

    // Modal "Registrar conclusão"
    const [showModal, setShowModal] = useState(false);
    const [mode, setMode] = useState(null); // 'partial' | 'full'
    const [minutes, setMinutes] = useState(null);
    const [stopPoint, setStopPoint] = useState('');
    const [qTotal, setQTotal] = useState('');
    const [qCorrect, setQCorrect] = useState('');

    const openModal = () => {
        setRunning(false);
        // Prefill the study time from the running timer, if any.
        if (seconds > 0 && minutes == null) {
            const mins = Math.max(1, Math.round(seconds / 60));
            const nearest = DURATIONS.reduce((a, b) =>
                Math.abs(b.minutes - mins) < Math.abs(a.minutes - mins) ? b : a,
            );
            setMinutes(nearest.minutes);
        }
        setShowModal(true);
    };

    const total = parseInt(qTotal, 10);
    const correct = parseInt(qCorrect, 10);
    const aproveitamento =
        total > 0 && correct >= 0 ? Math.round((Math.min(correct, total) / total) * 100) : null;

    const canSave = !!mode && minutes != null;

    const submit = () => {
        if (!canSave) return;
        setProcessing(true);
        router.post(
            `/tarefas/${task.id}/concluir`,
            {
                mode,
                duration_minutes: minutes ?? 0,
                stop_point: stopPoint || null,
                questions_total: qTotal !== '' ? total : null,
                questions_correct: qCorrect !== '' ? correct : null,
            },
            {
                onSuccess: () => setShowModal(false),
                onFinish: () => setProcessing(false),
            },
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
                    onClick={openModal}
                    className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
                >
                    Concluir e continuar
                </button>
            </aside>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/50"
                        onClick={() => !processing && setShowModal(false)}
                    />
                    <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
                        <h2 className="text-lg font-bold text-slate-900">Registrar conclusão</h2>
                        <p className="mt-1 text-sm text-slate-400">
                            {task.subject?.name}
                            {task.subject ? ' · ' : ''}
                            {task.title} · Parte {progress.current}/{progress.total}
                        </p>

                        <hr className="my-4 border-slate-100" />

                        {/* Como deseja concluir */}
                        <h3 className="text-sm font-bold text-slate-900">
                            Como deseja concluir esta tarefa?
                        </h3>
                        <div className="mt-3 space-y-2">
                            <ModeOption
                                selected={mode === 'partial'}
                                onSelect={() => setMode('partial')}
                                title="Ainda não terminei a parte teórica"
                                desc="Registra apenas esta sessão de estudo e mantém as próximas tarefas de estudo teórico."
                            />
                            <ModeOption
                                selected={mode === 'full'}
                                onSelect={() => setMode('full')}
                                title="Já concluí toda a teoria da aula"
                                desc="Use esta opção se você já estudou todo o conteúdo teórico. As próximas partes serão dispensadas e as revisões serão geradas."
                            />
                        </div>

                        <hr className="my-4 border-slate-100" />

                        {/* Tempo de estudo */}
                        <h3 className="text-sm font-bold text-slate-900">Tempo de estudo</h3>
                        <p className="mt-0.5 text-sm text-slate-500">Quanto tempo você estudou?</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {DURATIONS.map((d) => (
                                <button
                                    key={d.minutes}
                                    type="button"
                                    onClick={() => setMinutes(d.minutes)}
                                    className={
                                        'rounded-lg border px-3 py-1.5 text-sm font-medium transition ' +
                                        (minutes === d.minutes
                                            ? 'border-brand-600 bg-brand-600 text-white'
                                            : 'border-slate-300 bg-white text-slate-600 hover:border-brand-400')
                                    }
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>

                        <hr className="my-4 border-slate-100" />

                        {/* Onde você parou */}
                        <h3 className="text-sm font-bold text-slate-900">Onde você parou?</h3>
                        <input
                            type="text"
                            value={stopPoint}
                            onChange={(e) => setStopPoint(e.target.value)}
                            placeholder="Página 52 ou min do vídeo"
                            className="mt-2 w-full rounded-lg border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500"
                        />

                        <hr className="my-4 border-slate-100" />

                        {/* Desempenho */}
                        <h3 className="text-sm font-bold text-slate-900">
                            Desempenho{' '}
                            <span className="font-bold text-slate-400">(opcional)</span>
                        </h3>
                        <div className="mt-3 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700">
                                    Quantas questões você fez?
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={qTotal}
                                    onChange={(e) => setQTotal(e.target.value)}
                                    className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700">
                                    Quantas você acertou?
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={qCorrect}
                                    onChange={(e) => setQCorrect(e.target.value)}
                                    className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500"
                                />
                                {aproveitamento != null && (
                                    <p className="mt-1 text-xs font-semibold text-emerald-600">
                                        {aproveitamento}% de aproveitamento
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                disabled={processing}
                                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={submit}
                                disabled={!canSave || processing}
                                className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
                            >
                                {processing ? 'Salvando…' : 'Salvar e concluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

TaskDetails.layout = (page) => (
    <AppLayout title={page.props.task?.title ?? 'Tarefa'}>{page}</AppLayout>
);
