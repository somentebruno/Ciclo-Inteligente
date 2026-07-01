import { useEffect, useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

const STEPS = ['Concurso', 'Disponibilidade', 'Disciplinas', 'Dificuldade', 'Conteúdos', 'Já estudei'];

const DIFFICULTIES = [
    { value: 'facil', label: 'Fácil' },
    { value: 'medio', label: 'Médio' },
    { value: 'dificil', label: 'Difícil' },
];

const FORMATS = [
    { value: 'pdf', label: 'PDF' },
    { value: 'video', label: 'Videoaula' },
];

// Cada tarefa equivale a ~1h30 de estudo.
const PACES = [
    { daily: 1, weekly: 7 },
    { daily: 2, weekly: 14 },
    { daily: 3, weekly: 21 },
    { daily: 4, weekly: 28 },
];
const MAX_WEEKLY_HOURS = 42; // referência para a barra "meta escolhida"

function formatHours(h) {
    const hh = Math.floor(h);
    const mm = Math.round((h - hh) * 60);
    return mm ? `${hh}h${String(mm).padStart(2, '0')}` : `${hh}h`;
}

/* --- Small UI helpers --------------------------------------------------- */
function Stepper({ step }) {
    return (
        <ol className="flex flex-wrap items-center gap-2">
            {STEPS.map((label, i) => {
                const n = i + 1;
                const done = n < step;
                const active = n === step;
                return (
                    <li key={label} className="flex items-center gap-2">
                        <span
                            className={
                                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ' +
                                (active
                                    ? 'bg-brand-600 text-white'
                                    : done
                                      ? 'bg-brand-100 text-brand-700'
                                      : 'bg-slate-100 text-slate-400')
                            }
                        >
                            {done ? '✓' : n}
                        </span>
                        <span
                            className={
                                'hidden text-sm sm:inline ' +
                                (active ? 'font-semibold text-slate-900' : 'text-slate-400')
                            }
                        >
                            {label}
                        </span>
                        {n < STEPS.length && <span className="mx-1 h-px w-4 bg-slate-200" />}
                    </li>
                );
            })}
        </ol>
    );
}

function Pill({ selected, children, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={
                'rounded-lg border px-3 py-1.5 text-sm font-medium transition ' +
                (selected
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-brand-400')
            }
        >
            {children}
        </button>
    );
}

/* --- Wizard ------------------------------------------------------------- */
export default function Wizard({ courses = [], preselectedCourseId = null, existingPlan = null }) {
    const [step, setStep] = useState(1);
    const [courseId, setCourseId] = useState(preselectedCourseId ?? null);
    const [pace, setPace] = useState(null); // número (por dia) | 'custom'
    const [customWeekly, setCustomWeekly] = useState(7);
    const [config, setConfig] = useState({}); // { [subjectId]: { difficulty, format } }
    const [studied, setStudied] = useState([]); // topic ids
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const deleteExistingPlan = () => {
        if (!existingPlan) return;
        setDeleting(true);
        // On success the server redirects back here; the wizard reloads without
        // an existing plan and the student can start fresh.
        router.delete(`/planos/${existingPlan.id}`, {
            onFinish: () => setDeleting(false),
        });
    };

    const course = useMemo(() => courses.find((c) => c.id === courseId) || null, [courses, courseId]);
    const subjects = course?.subjects ?? [];

    // Inicializa a configuração das disciplinas ao escolher o concurso.
    useEffect(() => {
        if (!course) return;
        setConfig((prev) => {
            const next = {};
            subjects.forEach((s) => {
                next[s.id] = prev[s.id] ?? { difficulty: 'medio', format: 'pdf' };
            });
            return next;
        });
        setStudied([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    const weeklyTasks =
        pace === 'custom'
            ? parseInt(customWeekly, 10) || 0
            : pace
              ? (PACES.find((p) => p.daily === pace)?.weekly ?? 0)
              : 0;
    const dailyTasks = pace === 'custom' ? null : pace;
    const weeklyHours = weeklyTasks * 1.5;
    const barPct = Math.min(100, Math.round((weeklyHours / MAX_WEEKLY_HOURS) * 100));

    const canNext = () => {
        if (step === 1) return !!courseId;
        if (step === 2) return weeklyTasks > 0;
        return true;
    };

    const setSubject = (id, patch) =>
        setConfig((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
    const applyToAll = (patch) =>
        setConfig((prev) => {
            const next = { ...prev };
            subjects.forEach((s) => (next[s.id] = { ...next[s.id], ...patch }));
            return next;
        });

    const toggleStudied = (tid) =>
        setStudied((prev) => (prev.includes(tid) ? prev.filter((x) => x !== tid) : [...prev, tid]));

    const next = () => setStep((s) => Math.min(STEPS.length, s + 1));
    const back = () => setStep((s) => Math.max(1, s - 1));

    // If the student already has a plan, block the wizard and ask them to delete
    // the current plan (with confirmation) before creating a new one.
    if (existingPlan) {
        return (
            <div className="min-h-screen bg-slate-50 py-8">
                <Head title="Montar meu plano" />

                <div className="mx-auto max-w-3xl px-4">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
                                CI
                            </span>
                            <span className="font-semibold text-slate-900">Montar meu plano</span>
                        </div>
                        <Link href="/planos" className="text-sm text-slate-400 hover:text-slate-600">
                            Sair
                        </Link>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                        <div className="mx-auto max-w-md text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-2xl">
                                ⚠️
                            </div>
                            <h2 className="mt-4 text-lg font-semibold text-slate-900">
                                Você já tem um plano
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Só é possível ter um plano por vez. Para montar um novo, apague o
                                plano atual primeiro. As tarefas e revisões deste plano serão
                                removidas.
                            </p>

                            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left">
                                <p className="text-xs uppercase tracking-wide text-slate-400">
                                    Plano atual
                                </p>
                                <p className="mt-0.5 font-medium text-slate-800">
                                    {existingPlan.name}
                                </p>
                            </div>

                            {!confirmingDelete ? (
                                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                                    <Link
                                        href="/planos"
                                        className="rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                                    >
                                        Cancelar
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => setConfirmingDelete(true)}
                                        className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
                                    >
                                        Apagar plano atual
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
                                    <p className="text-sm font-medium text-red-800">
                                        Tem certeza? Esta ação não pode ser desfeita.
                                    </p>
                                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-center">
                                        <button
                                            type="button"
                                            onClick={() => setConfirmingDelete(false)}
                                            disabled={deleting}
                                            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-white"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={deleteExistingPlan}
                                            disabled={deleting}
                                            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
                                        >
                                            {deleting ? 'Apagando…' : 'Sim, apagar e continuar'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const submit = () => {
        setProcessing(true);
        setErrors({});
        router.post(
            '/onboarding',
            {
                course_id: courseId,
                daily_tasks: dailyTasks,
                weekly_tasks: weeklyTasks,
                subjects: subjects.map((s) => ({
                    subject_id: s.id,
                    difficulty: config[s.id]?.difficulty ?? 'medio',
                    format: config[s.id]?.format ?? 'pdf',
                })),
                studied_topics: studied,
            },
            {
                onError: (e) => setErrors(e),
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <Head title="Montar meu plano" />

            <div className="mx-auto max-w-3xl px-4">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
                            CI
                        </span>
                        <span className="font-semibold text-slate-900">Montar meu plano</span>
                    </div>
                    <Link href="/metas-do-dia" className="text-sm text-slate-400 hover:text-slate-600">
                        Sair
                    </Link>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-6 py-4">
                        <Stepper step={step} />
                    </div>

                    <div className="px-6 py-6">
                        {/* ---------------- Passo 1: Concurso ---------------- */}
                        {step === 1 && (
                            <section>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Qual concurso você está estudando?
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Selecione o concurso para montarmos seu plano.
                                </p>
                                <div className="mt-5 space-y-3">
                                    {courses.length === 0 && (
                                        <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                                            Nenhum concurso disponível. Rode o seeder do banco.
                                        </p>
                                    )}
                                    {courses.map((c) => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => setCourseId(c.id)}
                                            className={
                                                'flex w-full items-center justify-between rounded-xl border p-4 text-left transition ' +
                                                (courseId === c.id
                                                    ? 'border-brand-600 ring-1 ring-brand-600'
                                                    : 'border-slate-200 hover:border-brand-300')
                                            }
                                        >
                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    {c.label ?? c.name}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {c.orgao ?? 'Órgão não informado'} ·{' '}
                                                    {c.subjects.length} disciplinas
                                                </p>
                                            </div>
                                            <span
                                                className={
                                                    'flex h-5 w-5 items-center justify-center rounded-full border ' +
                                                    (courseId === c.id
                                                        ? 'border-brand-600 bg-brand-600 text-white'
                                                        : 'border-slate-300')
                                                }
                                            >
                                                {courseId === c.id ? '✓' : ''}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* ---------------- Passo 2: Disponibilidade ---------------- */}
                        {step === 2 && (
                            <section>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Quanto tempo você tem para estudar?
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Cada tarefa equivale a aproximadamente <strong>1h30</strong> de estudo.
                                </p>

                                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {PACES.map((p) => (
                                        <button
                                            key={p.daily}
                                            type="button"
                                            onClick={() => setPace(p.daily)}
                                            className={
                                                'rounded-xl border p-4 text-left transition ' +
                                                (pace === p.daily
                                                    ? 'border-brand-600 ring-1 ring-brand-600'
                                                    : 'border-slate-200 hover:border-brand-300')
                                            }
                                        >
                                            <p className="font-semibold text-slate-900">
                                                {p.daily} por dia
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {p.weekly} tarefas/semana · ~{formatHours(p.weekly * 1.5)}/semana
                                            </p>
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() => setPace('custom')}
                                        className={
                                            'rounded-xl border p-4 text-left transition sm:col-span-2 ' +
                                            (pace === 'custom'
                                                ? 'border-brand-600 ring-1 ring-brand-600'
                                                : 'border-slate-200 hover:border-brand-300')
                                        }
                                    >
                                        <p className="font-semibold text-slate-900">Outro número</p>
                                        {pace === 'custom' ? (
                                            <div className="mt-2 flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="100"
                                                    value={customWeekly}
                                                    onChange={(e) => setCustomWeekly(e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-24 rounded-lg border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500"
                                                />
                                                <span className="text-sm text-slate-500">
                                                    tarefas por semana
                                                </span>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-500">
                                                Defina quantas tarefas por semana
                                            </p>
                                        )}
                                    </button>
                                </div>

                                {/* Meta escolhida */}
                                <div className="mt-6 rounded-xl bg-slate-50 p-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-slate-600">Meta escolhida</span>
                                        <span className="font-semibold text-brand-700">
                                            {weeklyTasks > 0
                                                ? `${weeklyTasks} tarefas/semana · ~${formatHours(weeklyHours)}/semana`
                                                : 'Selecione um ritmo'}
                                        </span>
                                    </div>
                                    <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-200">
                                        <div
                                            className="h-full rounded-full bg-brand-600 transition-all"
                                            style={{ width: `${barPct}%` }}
                                        />
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* ---------------- Passo 3: Disciplinas ---------------- */}
                        {step === 3 && (
                            <section>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Disciplinas do concurso
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Estas são as disciplinas de{' '}
                                    <strong>{course?.label ?? course?.name}</strong>. Nos próximos
                                    passos você define a dificuldade e o formato de cada uma.
                                </p>
                                <ul className="mt-5 space-y-2">
                                    {subjects.map((s) => (
                                        <li
                                            key={s.id}
                                            className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3"
                                        >
                                            <span
                                                className="h-3 w-3 rounded-full"
                                                style={{ backgroundColor: s.color ?? '#94a3b8' }}
                                            />
                                            <span className="font-medium text-slate-800">{s.name}</span>
                                            <span className="ml-auto text-xs text-slate-400">
                                                {s.topics.length} conteúdos
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* ---------------- Passo 4: Dificuldade ---------------- */}
                        {step === 4 && (
                            <section>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900">
                                            Nível de dificuldade
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Como você avalia cada disciplina?
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1">
                                        <span className="mr-1 text-xs text-slate-400">Aplicar a todas:</span>
                                        {DIFFICULTIES.map((d) => (
                                            <Pill key={d.value} onClick={() => applyToAll({ difficulty: d.value })}>
                                                {d.label}
                                            </Pill>
                                        ))}
                                    </div>
                                </div>
                                <ul className="mt-5 space-y-2">
                                    {subjects.map((s) => (
                                        <li
                                            key={s.id}
                                            className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 px-4 py-3"
                                        >
                                            <span className="font-medium text-slate-800">{s.name}</span>
                                            <div className="ml-auto flex gap-1">
                                                {DIFFICULTIES.map((d) => (
                                                    <Pill
                                                        key={d.value}
                                                        selected={config[s.id]?.difficulty === d.value}
                                                        onClick={() => setSubject(s.id, { difficulty: d.value })}
                                                    >
                                                        {d.label}
                                                    </Pill>
                                                ))}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* ---------------- Passo 5: Conteúdos (formato) ---------------- */}
                        {step === 5 && (
                            <section>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900">
                                            Formato de estudo
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Como você prefere estudar cada disciplina?
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1">
                                        <span className="mr-1 text-xs text-slate-400">Aplicar a todas:</span>
                                        {FORMATS.map((f) => (
                                            <Pill key={f.value} onClick={() => applyToAll({ format: f.value })}>
                                                {f.label}
                                            </Pill>
                                        ))}
                                    </div>
                                </div>
                                <ul className="mt-5 space-y-2">
                                    {subjects.map((s) => (
                                        <li
                                            key={s.id}
                                            className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 px-4 py-3"
                                        >
                                            <span className="font-medium text-slate-800">{s.name}</span>
                                            <div className="ml-auto flex gap-1">
                                                {FORMATS.map((f) => (
                                                    <Pill
                                                        key={f.value}
                                                        selected={config[s.id]?.format === f.value}
                                                        onClick={() => setSubject(s.id, { format: f.value })}
                                                    >
                                                        {f.label}
                                                    </Pill>
                                                ))}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* ---------------- Passo 6: Já estudei ---------------- */}
                        {step === 6 && (
                            <section>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Já estudei (importar progresso)
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Marque as aulas que você já domina.
                                </p>

                                <div className="mt-4 space-y-2">
                                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                                        ⚠️ Marque <strong>apenas o que realmente domina</strong>. As aulas
                                        marcadas saem da fila de estudo teórico — se você só viu de passagem,
                                        deixe <strong>desmarcada</strong>.
                                    </div>
                                    <div className="rounded-lg border border-brand-200 bg-brand-50 p-3 text-sm text-brand-800">
                                        ℹ️ Aulas marcadas <strong>não recebem revisões com datas fixas</strong>{' '}
                                        (1d, 7d, 30d). No lugar, o sistema gera{' '}
                                        <strong>Revisões Inteligentes</strong> com base no seu desempenho e na
                                        data da última revisão.
                                    </div>
                                </div>

                                <div className="mt-5 space-y-5">
                                    {subjects.map((s) => (
                                        <div key={s.id}>
                                            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                <span
                                                    className="h-2.5 w-2.5 rounded-full"
                                                    style={{ backgroundColor: s.color ?? '#94a3b8' }}
                                                />
                                                {s.name}
                                            </p>
                                            <ul className="space-y-1">
                                                {s.topics.length === 0 && (
                                                    <li className="text-xs text-slate-400">Sem conteúdos cadastrados.</li>
                                                )}
                                                {s.topics.map((t) => (
                                                    <li key={t.id}>
                                                        <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                                                            <input
                                                                type="checkbox"
                                                                checked={studied.includes(t.id)}
                                                                onChange={() => toggleStudied(t.id)}
                                                                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                                            />
                                                            <span
                                                                className={
                                                                    'text-sm ' +
                                                                    (studied.includes(t.id)
                                                                        ? 'text-slate-400 line-through'
                                                                        : 'text-slate-700')
                                                                }
                                                            >
                                                                {t.name}
                                                            </span>
                                                        </label>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>

                                <p className="mt-4 text-xs text-slate-400">
                                    {studied.length} aula(s) marcada(s) como já estudada(s).
                                </p>
                            </section>
                        )}

                        {Object.keys(errors).length > 0 && (
                            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                {Object.values(errors)[0]}
                            </div>
                        )}
                    </div>

                    {/* Footer / navegação */}
                    <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                        <button
                            type="button"
                            onClick={back}
                            disabled={step === 1}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition enabled:hover:bg-slate-100 disabled:opacity-40"
                        >
                            ← Voltar
                        </button>

                        <span className="text-xs text-slate-400">
                            Passo {step} de {STEPS.length}
                        </span>

                        {step < STEPS.length ? (
                            <button
                                type="button"
                                onClick={next}
                                disabled={!canNext()}
                                className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition enabled:hover:bg-brand-700 disabled:opacity-40"
                            >
                                Continuar →
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={submit}
                                disabled={processing}
                                className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition enabled:hover:bg-brand-700 disabled:opacity-60"
                            >
                                {processing ? 'Montando…' : 'Concluir e montar plano'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
