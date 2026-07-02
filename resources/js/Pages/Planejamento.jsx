import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Link, router } from '@inertiajs/react';

/** Minutes → "10h57min" / "12h" / "45min". */
function fmt(m) {
    const total = Math.max(0, Math.round(m || 0));
    const h = Math.floor(total / 60);
    const min = total % 60;
    if (h && min) return `${h}h${String(min).padStart(2, '0')}min`;
    if (h) return `${h}h`;
    return `${min}min`;
}

/* --- Ícones do submenu --------------------------------------------------- */
const PlayIcon = () => (
    <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86a1 1 0 00-1.5.86z" />
    </svg>
);
const PlusIcon = () => (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);
const HistoryIcon = () => (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2.5 1.5M20 12a8 8 0 11-3-6.24M20 4v4.5h-4.5" />
    </svg>
);

const MANUAL_DURATIONS = [15, 30, 45, 60, 90, 120];

/* --- Card de disciplina (Sequência dos estudos) -------------------------- */
function SubjectCard({ item, index, onStart, onManual }) {
    const [showHistory, setShowHistory] = useState(false);

    return (
        <li
            className="group rounded-lg border border-transparent bg-white px-3 py-2.5 transition-all duration-300 ease-out hover:border-blue-200 hover:bg-blue-50"
            onMouseLeave={() => setShowHistory(false)}
        >
            <div className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2 font-medium text-slate-700">
                    <span className="w-5 text-right text-xs text-slate-300">{index + 1}.</span>
                    <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                    />
                    {item.subject}
                </span>
                <span className="text-xs tabular-nums text-slate-400">
                    {fmt(item.studied_minutes)} / {fmt(item.planned_minutes)}
                </span>
            </div>

            {/* Barra de progresso: tom pastel por padrão, azul ao passar o mouse */}
            <div className="relative ml-7 mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                    className="absolute inset-y-0 left-0 rounded-full transition-opacity duration-300 group-hover:opacity-0"
                    style={{ width: `${Math.min(100, item.pct)}%`, backgroundColor: item.color }}
                />
                <div
                    className="absolute inset-y-0 left-0 rounded-full bg-blue-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ width: `${Math.min(100, item.pct)}%` }}
                />
            </div>

            {/* Submenu — revelado com expansão fluida ao passar o mouse */}
            <div
                className={
                    'ml-7 max-h-0 overflow-hidden opacity-0 transition-all duration-300 ease-out ' +
                    'group-hover:mt-3 group-hover:max-h-60 group-hover:opacity-100'
                }
            >
                <div className="flex items-center gap-1 border-t border-blue-100 pt-3">
                    <button
                        type="button"
                        onClick={() => onStart(item)}
                        disabled={!item.next_task_id}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
                        title={item.next_task_id ? undefined : 'Nenhuma tarefa pendente desta disciplina'}
                    >
                        <PlayIcon />
                        Iniciar Estudo
                    </button>
                    <button
                        type="button"
                        onClick={() => onManual(item)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                    >
                        <PlusIcon />
                        Adicionar Estudo Manualmente
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowHistory((v) => !v)}
                        className={
                            'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition hover:bg-blue-100 ' +
                            (showHistory ? 'bg-blue-100 text-blue-800' : 'text-blue-700')
                        }
                    >
                        <HistoryIcon />
                        Ver Últimos Estudos
                    </button>
                </div>

                {showHistory && (
                    <div className="mb-2 space-y-1 rounded-md bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">
                        {item.recent_sessions.length === 0 ? (
                            <p>Nenhum estudo registrado ainda.</p>
                        ) : (
                            item.recent_sessions.map((s) => (
                                <div key={s.id} className="flex items-center justify-between gap-2">
                                    <span>{s.date}</span>
                                    <span className="tabular-nums">{fmt(s.duration_minutes)}</span>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </li>
    );
}

/* --- Donut (anel multicamadas) ------------------------------------------ */
function polar(cx, cy, r, deg) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function arcPath(cx, cy, r, a0, a1) {
    // A full 360° arc collapses (start == end); cap just below.
    const end = Math.min(a1, a0 + 359.98);
    const [x0, y0] = polar(cx, cy, r, a0);
    const [x1, y1] = polar(cx, cy, r, end);
    const large = end - a0 > 180 ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
}

function CycleDonut({ sequence, totalLabel }) {
    const size = 280;
    const c = size / 2;
    const planned = sequence.reduce((s, i) => s + i.planned_minutes, 0);

    if (!planned) return null;

    const gap = sequence.length > 1 ? 3 : 0; // degrees between segments
    const usable = 360 - gap * sequence.length;

    let angle = 0;
    const segments = sequence.map((item) => {
        const sweep = (item.planned_minutes / planned) * usable;
        const a0 = angle;
        const a1 = angle + sweep;
        angle = a1 + gap;
        const studiedSweep = sweep * Math.min(1, item.studied_minutes / item.planned_minutes);
        return { ...item, a0, a1, studiedSweep };
    });

    return (
        <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[320px]">
            {segments.map((s) => (
                <g key={s.id}>
                    {/* Outer ring — planned share per subject (solid) */}
                    <path
                        d={arcPath(c, c, 108, s.a0, s.a1)}
                        stroke={s.color}
                        strokeWidth="30"
                        fill="none"
                        strokeLinecap="butt"
                    />
                    {/* Inner track — pastel */}
                    <path
                        d={arcPath(c, c, 80, s.a0, s.a1)}
                        stroke={s.color}
                        strokeOpacity="0.2"
                        strokeWidth="12"
                        fill="none"
                    />
                    {/* Inner fill — studied portion of the segment */}
                    {s.studiedSweep > 0 && (
                        <path
                            d={arcPath(c, c, 80, s.a0, s.a0 + s.studiedSweep)}
                            stroke={s.color}
                            strokeWidth="12"
                            fill="none"
                        />
                    )}
                </g>
            ))}
            <text
                x={c}
                y={c - 4}
                textAnchor="middle"
                className="fill-slate-900 text-[26px] font-bold"
            >
                {totalLabel}
            </text>
            <text x={c} y={c + 20} textAnchor="middle" className="fill-slate-400 text-[12px]">
                por volta do ciclo
            </text>
        </svg>
    );
}

/* --- Page ---------------------------------------------------------------- */
export default function Planejamento({ cycle, nextTaskId }) {
    if (!cycle) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="text-slate-500">
                    Crie um plano de estudos para montar o seu ciclo.
                </p>
                <Link
                    href="/planos"
                    className="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                    Criar meu plano
                </Link>
            </div>
        );
    }

    const restart = () => {
        if (confirm('Recomeçar o ciclo? A volta atual será contada como completa e o progresso das disciplinas será zerado.')) {
            router.post('/planejamento/recomecar', {}, { preserveScroll: true });
        }
    };

    const replan = () => {
        if (confirm('Replanejar a fila de tarefas a partir de hoje? As tarefas pendentes serão reagendadas (o histórico concluído é mantido).')) {
            router.post('/planejamento/replanejar', {}, { preserveScroll: true });
        }
    };

    const remove = () => {
        if (confirm(`Remover o plano "${cycle.name}"? Esta ação não pode ser desfeita.`)) {
            router.delete(`/planos/${cycle.id}`);
        }
    };

    const startSubject = (item) => {
        if (item.next_task_id) router.visit(`/tarefas/${item.next_task_id}`);
    };

    // Modal "Adicionar Estudo Manualmente"
    const [manualItem, setManualItem] = useState(null);
    const [manualMinutes, setManualMinutes] = useState(30);
    const [manualTotal, setManualTotal] = useState('');
    const [manualCorrect, setManualCorrect] = useState('');
    const [savingManual, setSavingManual] = useState(false);

    const openManual = (item) => {
        setManualItem(item);
        setManualMinutes(30);
        setManualTotal('');
        setManualCorrect('');
    };

    const saveManual = () => {
        setSavingManual(true);
        router.post(
            '/planejamento/sessoes',
            {
                study_cycle_item_id: manualItem.id,
                duration_minutes: manualMinutes,
                questions_total: manualTotal !== '' ? parseInt(manualTotal, 10) : null,
                questions_correct: manualCorrect !== '' ? parseInt(manualCorrect, 10) : null,
            },
            {
                preserveScroll: true,
                onSuccess: () => setManualItem(null),
                onFinish: () => setSavingManual(false),
            },
        );
    };

    return (
        <div className="space-y-4">
            {/* Ações */}
            <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                    type="button"
                    onClick={restart}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                    Recomeçar Ciclo
                </button>
                <button
                    type="button"
                    onClick={replan}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                    Replanejar
                </button>
                <button
                    type="button"
                    onClick={remove}
                    className="rounded-lg border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                >
                    Remover
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Metade esquerda */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Ciclos completos */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Ciclos completos
                            </p>
                            <div className="mt-3 flex items-center justify-center">
                                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-2xl font-bold text-white">
                                    {cycle.completed_laps}
                                </span>
                            </div>
                        </div>

                        {/* Progresso */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Progresso
                            </p>
                            <p className="mt-3 text-xl font-bold text-slate-900">
                                {cycle.pct}%
                            </p>
                            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full rounded-full bg-emerald-500 transition-all"
                                    style={{ width: `${Math.min(100, cycle.pct)}%` }}
                                />
                            </div>
                            <p className="mt-2 text-xs text-slate-500">
                                {fmt(cycle.studied_minutes)} / {fmt(cycle.planned_minutes)}
                            </p>
                        </div>
                    </div>

                    {/* Sequência dos estudos */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Sequência dos estudos
                        </p>
                        <ol className="mt-3 space-y-1">
                            {cycle.sequence.map((s, i) => (
                                <SubjectCard
                                    key={s.id}
                                    item={s}
                                    index={i}
                                    onStart={startSubject}
                                    onManual={openManual}
                                />
                            ))}
                        </ol>
                    </div>
                </div>

                {/* Metade direita — Ciclo */}
                <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Ciclo
                    </p>
                    <div className="flex flex-1 items-center justify-center py-6">
                        <CycleDonut
                            sequence={cycle.sequence}
                            totalLabel={fmt(cycle.planned_minutes)}
                        />
                    </div>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                        {cycle.sequence.map((s) => (
                            <span
                                key={s.id}
                                className="inline-flex items-center gap-1.5 text-xs text-slate-500"
                            >
                                <span
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: s.color }}
                                />
                                {s.subject}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Botão flutuante — cronômetro */}
            <Link
                href={nextTaskId ? `/tarefas/${nextTaskId}` : '/tarefas'}
                title="Iniciar sessão de estudo"
                className="fixed bottom-8 right-8 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition hover:bg-emerald-700 hover:shadow-xl"
            >
                <svg
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6l3.5 2M9 2.25h6M12 4.5a8.25 8.25 0 108.25 8.25A8.25 8.25 0 0012 4.5z"
                    />
                </svg>
            </Link>

            {/* Modal — Adicionar Estudo Manualmente */}
            {manualItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/50"
                        onClick={() => !savingManual && setManualItem(null)}
                    />
                    <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                        <h2 className="text-lg font-bold text-slate-900">
                            Adicionar estudo manualmente
                        </h2>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: manualItem.color }}
                            />
                            {manualItem.subject}
                        </p>

                        <p className="mt-4 text-sm font-semibold text-slate-800">
                            Quanto tempo você estudou?
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {MANUAL_DURATIONS.map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setManualMinutes(m)}
                                    className={
                                        'rounded-lg border px-3 py-1.5 text-sm font-medium transition ' +
                                        (manualMinutes === m
                                            ? 'border-blue-600 bg-blue-600 text-white'
                                            : 'border-slate-300 bg-white text-slate-600 hover:border-blue-400')
                                    }
                                >
                                    {fmt(m)}
                                </button>
                            ))}
                        </div>

                        <p className="mt-4 text-sm font-semibold text-slate-800">
                            Desempenho <span className="font-normal text-slate-400">(opcional)</span>
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-slate-500">Questões feitas</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={manualTotal}
                                    onChange={(e) => setManualTotal(e.target.value)}
                                    className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500">Acertos</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={manualCorrect}
                                    onChange={(e) => setManualCorrect(e.target.value)}
                                    className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setManualItem(null)}
                                disabled={savingManual}
                                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={saveManual}
                                disabled={savingManual}
                                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
                            >
                                {savingManual ? 'Salvando…' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

Planejamento.layout = (page) => <AppLayout title="Planejamento">{page}</AppLayout>;
