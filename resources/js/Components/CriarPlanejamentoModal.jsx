import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';

const CloseXIcon = ({ className = 'h-5 w-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ChevronDownIcon = ({ className = 'h-4 w-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

const HelpIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 17.25h.008v.008H12v-.008z" />
        <circle cx="12" cy="12" r="9" strokeWidth={1.8} />
    </svg>
);

const PASTEL_COLORS = [
    '#fecaca', '#fed7aa', '#fef08a', '#d9f99d', '#bbf7d0',
    '#a7f3d0', '#99f6e4', '#a5f3fc', '#bae6fd', '#bfdbfe',
    '#c7d2fe', '#ddd6fe', '#e9d5ff', '#f5d0fe', '#fbcfe8',
];

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const DEFAULT_STUDY_DAYS = [1, 2, 3, 4, 5]; // Segunda a Sexta
const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

function weight(importance, knowledge) {
    return importance * (6 - knowledge);
}

function pillButtonClass(active) {
    return (
        'rounded-full px-5 py-2 text-sm font-semibold transition ' +
        (active
            ? 'bg-emerald-500 text-white'
            : 'border border-emerald-500 bg-transparent text-emerald-600 hover:bg-emerald-50')
    );
}

const underlineFieldClass =
    'w-full border-0 border-b-2 border-emerald-500 bg-transparent px-1 py-2 text-center text-sm text-slate-700 ' +
    'focus:border-emerald-600 focus:outline-none focus:ring-0';

function Header({ title, onClose }) {
    return (
        <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
            <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="text-emerald-600 transition hover:text-emerald-700"
            >
                <CloseXIcon />
            </button>
        </div>
    );
}

function Footer({ onBack, onNext, nextLabel, backLabel = 'Voltar', nextDisabled = false }) {
    return (
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
            {onBack && (
                <button
                    type="button"
                    onClick={onBack}
                    className="rounded-full border border-emerald-500 bg-transparent px-5 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50"
                >
                    {backLabel}
                </button>
            )}
            <button
                type="button"
                onClick={onNext}
                disabled={nextDisabled}
                className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-50"
            >
                {nextLabel}
            </button>
        </div>
    );
}

function StepDisciplinas({ subjects, selected, onToggle }) {
    return (
        <>
            <div className="px-6 pt-4">
                <p className="text-sm text-slate-500">
                    <u>Selecione</u> as disciplinas que você já quer colocar no seu{' '}
                    <u>planejamento</u>. Não se preocupe, você poderá adicionar outras a qualquer
                    momento, ok?
                </p>
            </div>

            <div className="mt-4 max-h-[50vh] overflow-y-auto px-6 py-2">
                <div className="grid grid-cols-3 gap-3">
                    {subjects.map((s) => {
                        const active = selected.has(s.id);
                        return (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => onToggle(s.id)}
                                className={
                                    'flex min-h-[64px] items-center justify-center rounded-xl border p-3 text-center text-sm font-medium text-slate-700 transition ' +
                                    (active
                                        ? 'border-emerald-500 bg-emerald-50'
                                        : 'border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/50')
                                }
                            >
                                {s.name}
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

function StepPesos({ subjects, config, setSubject }) {
    const weights = subjects.map((s) => ({
        subject: s,
        w: weight(config[s.id]?.importance ?? 3, config[s.id]?.knowledge ?? 3),
    }));
    const totalWeight = weights.reduce((sum, x) => sum + x.w, 0) || 1;

    return (
        <>
            <div className="px-6 pt-4">
                <p className="text-sm text-slate-500">
                    Para cada disciplina, selecione a <u>importância</u> para sua prova e seu{' '}
                    <u>grau de conhecimento</u>.
                </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 px-6 py-2 lg:grid-cols-5">
                {/* Painel esquerdo — sliders */}
                <div className="max-h-[50vh] overflow-y-auto pr-1 lg:col-span-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {subjects.map((s) => {
                            const importance = config[s.id]?.importance ?? 3;
                            const knowledge = config[s.id]?.knowledge ?? 3;
                            return (
                                <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-4">
                                    <p className="text-center text-sm font-bold text-slate-800">{s.name}</p>

                                    <div className="mt-4">
                                        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            <span>Importância</span>
                                            <span className="tabular-nums text-slate-600">{importance}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="5"
                                            value={importance}
                                            onChange={(e) =>
                                                setSubject(s.id, { importance: Number(e.target.value) })
                                            }
                                            className="mt-1 w-full accent-emerald-500"
                                        />
                                    </div>

                                    <div className="mt-3">
                                        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            <span>Conhecimento</span>
                                            <span className="tabular-nums text-slate-600">{knowledge}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="5"
                                            value={knowledge}
                                            onChange={(e) =>
                                                setSubject(s.id, { knowledge: Number(e.target.value) })
                                            }
                                            className="mt-1 w-full accent-emerald-500"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Painel direito — pesos */}
                <div className="max-h-[50vh] space-y-2 overflow-y-auto pl-1 lg:col-span-2">
                    {weights.map(({ subject, w }, i) => {
                        const pct = Math.round((w / totalWeight) * 100);
                        const color = PASTEL_COLORS[i % PASTEL_COLORS.length];
                        return (
                            <div
                                key={subject.id}
                                className="group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition hover:border-emerald-400 hover:bg-emerald-50"
                                style={{ backgroundColor: color + '55', borderColor: color }}
                            >
                                <span className="w-10 shrink-0 text-sm font-bold tabular-nums text-slate-700">
                                    {pct}%
                                </span>
                                <span className="h-5 w-px shrink-0 bg-slate-400/40" />
                                <span className="truncate text-sm text-slate-700">{subject.name}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

function StepRitmo({ weeklyHours, setWeeklyHours, studyDays, toggleDay, minDuration, setMinDuration, maxDuration, setMaxDuration }) {
    return (
        <div className="px-6 py-4">
            {/* Bloco 1: horas por semana */}
            <div>
                <p className="text-sm text-slate-700">
                    Quantas horas, em média, pretende estudar <strong>por semana</strong>?
                </p>
                <input
                    type="number"
                    min="1"
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(e.target.value)}
                    className={underlineFieldClass + ' mt-3 max-w-[160px]'}
                />
            </div>

            {/* Bloco 2: dias da semana */}
            <div className="mt-7">
                <p className="flex items-center gap-1.5 text-sm text-slate-700">
                    Em quais dias você pretende <strong>estudar</strong>?
                    <span title="Os dias marcados entram na rotação da sua fila de tarefas." className="text-slate-500">
                        <HelpIcon />
                    </span>
                </p>
                <div className="mt-3 inline-flex overflow-hidden rounded-full border border-emerald-500">
                    {WEEKDAYS.map((label, i) => {
                        const active = studyDays.has(i);
                        return (
                            <button
                                key={label}
                                type="button"
                                onClick={() => toggleDay(i)}
                                className={
                                    'border-l border-emerald-500 px-3 py-2 text-xs font-semibold uppercase tracking-wide transition first:border-l-0 ' +
                                    (active ? 'bg-emerald-500 text-white' : 'bg-white text-emerald-600')
                                }
                            >
                                {label.slice(0, 3)}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Bloco 3: duração da sessão */}
            <div className="mt-7">
                <p className="flex items-center gap-1.5 text-sm text-slate-700">
                    Qual duração <strong>mínima</strong> e <strong>máxima</strong> você deseja para uma
                    sessão de estudos (disciplina)?
                    <span title="Usado como referência para o tamanho das sessões de estudo." className="text-slate-500">
                        <HelpIcon />
                    </span>
                </p>
                <div className="mt-3 flex max-w-sm items-center gap-3">
                    <div className="relative flex-1">
                        <select
                            value={minDuration}
                            onChange={(e) => setMinDuration(e.target.value)}
                            className={underlineFieldClass + ' appearance-none pr-6'}
                        >
                            <option value="">Selecione...</option>
                            {DURATION_OPTIONS.map((d) => (
                                <option key={d} value={d}>
                                    {d} min
                                </option>
                            ))}
                        </select>
                        <ChevronDownIcon className="pointer-events-none absolute right-1 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    </div>

                    <span className="text-sm text-slate-400">a</span>

                    <div className="relative flex-1">
                        <select
                            value={maxDuration}
                            onChange={(e) => setMaxDuration(e.target.value)}
                            className={underlineFieldClass + ' appearance-none pr-6'}
                        >
                            <option value="">Selecione...</option>
                            {DURATION_OPTIONS.map((d) => (
                                <option key={d} value={d}>
                                    {d} min
                                </option>
                            ))}
                        </select>
                        <ChevronDownIcon className="pointer-events-none absolute right-1 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CriarPlanejamentoModal({ course, onClose }) {
    const subjects = course?.subjects ?? [];

    const [step, setStep] = useState(1);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [config, setConfig] = useState({}); // { [subjectId]: { importance, knowledge } }
    const [weeklyHours, setWeeklyHours] = useState(10);
    const [studyDays, setStudyDays] = useState(new Set(DEFAULT_STUDY_DAYS));
    const [minDuration, setMinDuration] = useState('');
    const [maxDuration, setMaxDuration] = useState('');
    const [saving, setSaving] = useState(false);

    const selectedSubjects = useMemo(
        () => subjects.filter((s) => selectedIds.has(s.id)),
        [subjects, selectedIds],
    );

    const toggleSubject = (id) =>
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
                setConfig((c) => ({ ...c, [id]: c[id] ?? { importance: 3, knowledge: 3 } }));
            }
            return next;
        });

    const setSubjectConfig = (id, patch) =>
        setConfig((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

    const toggleDay = (day) =>
        setStudyDays((prev) => {
            const next = new Set(prev);
            if (next.has(day)) {
                next.delete(day);
            } else {
                next.add(day);
            }
            return next;
        });

    const back = () => setStep((s) => Math.max(1, s - 1));

    const next = () => {
        if (step === 1 && selectedIds.size === 0) return;
        setStep((s) => Math.min(3, s + 1));
    };

    const submit = () => {
        setSaving(true);
        router.post(
            '/onboarding',
            {
                course_id: course.id,
                weekly_hours: Number(weeklyHours) || 1,
                study_days: Array.from(studyDays),
                min_session_minutes: minDuration || null,
                max_session_minutes: maxDuration || null,
                subjects: selectedSubjects.map((s) => ({
                    subject_id: s.id,
                    importance: config[s.id]?.importance ?? 3,
                    knowledge: config[s.id]?.knowledge ?? 3,
                })),
                studied_topics: [],
            },
            {
                onFinish: () => setSaving(false),
            },
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50" onClick={() => !saving && onClose()} />

            <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="px-6 pt-6">
                    <Header title="Criar Planejamento" onClose={onClose} />
                </div>

                <div className="flex-1 overflow-y-auto">
                    {step === 1 && (
                        <StepDisciplinas subjects={subjects} selected={selectedIds} onToggle={toggleSubject} />
                    )}
                    {step === 2 && (
                        <StepPesos subjects={selectedSubjects} config={config} setSubject={setSubjectConfig} />
                    )}
                    {step === 3 && (
                        <StepRitmo
                            weeklyHours={weeklyHours}
                            setWeeklyHours={setWeeklyHours}
                            studyDays={studyDays}
                            toggleDay={toggleDay}
                            minDuration={minDuration}
                            setMinDuration={setMinDuration}
                            maxDuration={maxDuration}
                            setMaxDuration={setMaxDuration}
                        />
                    )}
                </div>

                <Footer
                    onBack={step > 1 ? back : null}
                    onNext={step < 3 ? next : submit}
                    nextLabel={step < 3 ? 'Avançar' : saving ? 'Concluindo…' : 'Concluir'}
                    nextDisabled={(step === 1 && selectedIds.size === 0) || saving}
                />
            </div>
        </div>
    );
}
