import { useEffect, useState } from 'react';
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

/* --- Ícones do modo de foco ----------------------------------------------- */
const FocusPlayIcon = ({ className = 'h-6 w-6' }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86a1 1 0 00-1.5.86z" />
    </svg>
);
const PauseIcon = ({ className = 'h-6 w-6' }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M7 5.5A1.5 1.5 0 018.5 4h1A1.5 1.5 0 0111 5.5v13a1.5 1.5 0 01-1.5 1.5h-1A1.5 1.5 0 017 18.5v-13zM14.5 4A1.5 1.5 0 0013 5.5v13a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0015.5 4h-1z" />
    </svg>
);
const StopIcon = ({ className = 'h-5 w-5' }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
);
const SkipIcon = ({ className = 'h-5 w-5' }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 5.5a1 1 0 011.53-.85l10 6.5a1 1 0 010 1.7l-10 6.5A1 1 0 016 18.5v-13z" />
        <rect x="16.5" y="5" width="2" height="14" rx="1" />
    </svg>
);

const METHODS = [
    { key: 'cronometro', label: 'CRONÔMETRO' },
    { key: 'timer', label: 'TIMER' },
    { key: 'pomodoro', label: 'POMODORO' },
];

/** Seconds → "HH:MM:SS". */
function fmtClock(totalSeconds) {
    const s = Math.max(0, Math.round(totalSeconds));
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

/** Seconds → "00h00" (hours + minutes only, no seconds). */
function fmtHM(totalSeconds) {
    const mins = Math.floor(Math.max(0, totalSeconds) / 60);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(Math.floor(mins / 60))}h${pad(mins % 60)}`;
}

const POMODORO_STAGES = [
    { key: 'estudo', label: 'Estudo' },
    { key: 'curta', label: 'Pausa Curta' },
    { key: 'longa', label: 'Pausa Longa' },
];

const DEFAULT_FOCUS_SETTINGS = {
    sound: 'Melodia 1',
    repeat: false,
    volume: 70,
    session: 25,
    curta: 5,
    longa: 15,
    cyclesUntilLong: 4,
    autoStartSessions: false,
    autoStartBreaks: false,
};

/** Duração (segundos) de um estágio do Pomodoro, segundo as configurações. */
function stageSeconds(stage, cfg) {
    const minutes = stage === 'estudo' ? cfg.session : stage === 'curta' ? cfg.curta : cfg.longa;
    return Math.max(1, minutes) * 60;
}

/* --- Ícones dos controles do modo de foco --------------------------------- */
const CloseXIcon = ({ className = 'h-6 w-6' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const GearIcon = ({ className = 'h-5 w-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.164.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.766.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.272-.806.107-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.108v-1.095c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.93l.15-.894z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const MinimizeIcon = ({ className = 'h-5 w-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 4.5v3A1.5 1.5 0 017.5 9h-3M15 4.5v3A1.5 1.5 0 0016.5 9h3M9 19.5v-3A1.5 1.5 0 007.5 15h-3M15 19.5v-3a1.5 1.5 0 011.5-1.5h3"
        />
    </svg>
);
const MaximizeIcon = ({ className = 'h-5 w-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 9V6A1.5 1.5 0 016 4.5h3M19.5 9V6A1.5 1.5 0 0018 4.5h-3M4.5 15v3A1.5 1.5 0 006 19.5h3M19.5 15v3a1.5 1.5 0 01-1.5 1.5h-3"
        />
    </svg>
);
const QuestionMarkIcon = ({ className = 'h-7 w-7' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18h.01"
        />
    </svg>
);

/* --- Modo de foco — ambiente de estudo em tela cheia ---------------------- */
function FocusMode({ item, onClose }) {
    const [method, setMethod] = useState('cronometro');
    const [stage, setStage] = useState('estudo');
    const [session, setSession] = useState(1);
    const [running, setRunning] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [confirmClose, setConfirmClose] = useState(false);

    const [settings, setSettings] = useState(DEFAULT_FOCUS_SETTINGS);
    const [showSettings, setShowSettings] = useState(false);
    const [draft, setDraft] = useState(DEFAULT_FOCUS_SETTINGS);

    // Meta de referência do Cronômetro/Timer: o tempo restante planejado para
    // esta disciplina na volta atual do ciclo (mínimo de 1 minuto).
    const targetSeconds =
        method === 'pomodoro'
            ? stageSeconds(stage, settings)
            : Math.max(60, (item.planned_minutes - item.studied_minutes) * 60);

    // Cronômetro conta progressivamente a partir de 0; Timer e Pomodoro
    // decrescem a partir da meta/duração do estágio.
    const [clock, setClock] = useState(method === 'cronometro' ? 0 : targetSeconds);

    const resetClock = (nextMethod = method, nextStage = stage, startRunning = false) => {
        setRunning(startRunning);
        setClock(
            nextMethod === 'cronometro'
                ? 0
                : nextMethod === 'pomodoro'
                  ? stageSeconds(nextStage, settings)
                  : Math.max(60, (item.planned_minutes - item.studied_minutes) * 60),
        );
    };

    const changeMethod = (m) => {
        setMethod(m);
        resetClock(m, stage);
    };

    const advancePomodoroStage = (auto = false) => {
        let nextStage = 'curta';
        let nextSession = session;
        if (stage === 'estudo') {
            nextStage = session >= settings.cyclesUntilLong ? 'longa' : 'curta';
        } else {
            nextStage = 'estudo';
            nextSession = stage === 'longa' ? 1 : session + 1;
        }
        setStage(nextStage);
        setSession(nextSession);
        const autoStart =
            auto && (nextStage === 'estudo' ? settings.autoStartSessions : settings.autoStartBreaks);
        resetClock('pomodoro', nextStage, autoStart);
    };

    const openSettings = () => {
        setDraft(settings);
        setShowSettings(true);
    };

    const saveSettings = () => {
        setSettings(draft);
        setShowSettings(false);
        if (method === 'pomodoro') {
            setRunning(false);
            setClock(stageSeconds(stage, draft));
        }
    };

    useEffect(() => {
        if (!running) return undefined;
        const id = setInterval(() => {
            setClock((c) => {
                if (method === 'cronometro') return c + 1;
                if (c <= 1) {
                    if (method !== 'pomodoro') setRunning(false);
                    return 0;
                }
                return c - 1;
            });
        }, 1000);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [running, method]);

    // Ao zerar a contagem regressiva do Pomodoro em execução, avança sozinho
    // para o próximo estágio (respeitando as opções de início automático).
    useEffect(() => {
        if (method === 'pomodoro' && running && clock === 0) {
            advancePomodoroStage(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clock]);

    const pct =
        method === 'cronometro'
            ? Math.min(100, (clock / targetSeconds) * 100)
            : method === 'timer'
              ? Math.min(100, ((targetSeconds - clock) / targetSeconds) * 100)
              : 0;

    return (
        <>
            {minimized ? (
                /* Barra de status inferior */
                <div className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center gap-4 border-t border-slate-800 bg-slate-900 px-4 text-white shadow-2xl sm:px-6">
                    <span className="w-40 shrink-0 truncate text-sm font-medium text-slate-200 sm:w-56">
                        {item.subject}
                    </span>

                    <div className="flex flex-1 items-center justify-center gap-4">
                        <button
                            type="button"
                            onClick={() => setRunning((r) => !r)}
                            aria-label={running ? 'Pausar' : 'Play'}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-emerald-600 transition hover:scale-105"
                        >
                            {running ? <PauseIcon className="h-4 w-4" /> : <FocusPlayIcon className="h-4 w-4" />}
                        </button>
                        <button
                            type="button"
                            onClick={() => resetClock()}
                            aria-label="Stop"
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:scale-105"
                        >
                            <StopIcon className="h-4 w-4" />
                        </button>
                        <p className="font-mono text-lg font-bold tabular-nums">{fmtClock(clock)}</p>
                    </div>

                    <div className="flex w-40 shrink-0 items-center justify-end gap-3 sm:w-56">
                        <button
                            type="button"
                            onClick={() => setMinimized(false)}
                            aria-label="Expandir"
                            className="text-slate-400 transition hover:text-white"
                        >
                            <MaximizeIcon />
                        </button>
                        <button
                            type="button"
                            onClick={() => setConfirmClose(true)}
                            aria-label="Fechar"
                            className="text-slate-400 transition hover:text-white"
                        >
                            <CloseXIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            ) : (
                /* Overlay em tela cheia */
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80" />

                    {/* Controles — fora do modal, no canto superior direito da tela */}
                    <div className="fixed right-6 top-6 z-20 flex items-center gap-4">
                        <button
                            type="button"
                            onClick={openSettings}
                            aria-label="Configurações"
                            className="text-slate-300 transition hover:text-white"
                        >
                            <GearIcon />
                        </button>
                        <button
                            type="button"
                            onClick={() => setMinimized(true)}
                            aria-label="Minimizar"
                            className="text-slate-300 transition hover:text-white"
                        >
                            <MinimizeIcon />
                        </button>
                        <button
                            type="button"
                            onClick={() => setConfirmClose(true)}
                            aria-label="Fechar"
                            className="text-slate-300 transition hover:text-white"
                        >
                            <CloseXIcon />
                        </button>
                    </div>

                    <div className="relative z-10 flex w-full max-w-3xl overflow-hidden rounded-2xl bg-slate-900 text-white shadow-2xl">
                        {/* Área central */}
                        <div className="flex-1 p-8 sm:p-10">
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
                                    CI
                                </span>
                                <span>
                                    Você está estudando:{' '}
                                    <strong className="font-semibold text-white">{item.subject}</strong>
                                </span>
                            </div>

                            {/* Barra dinâmica conforme o método */}
                            <div className="mt-5">
                                {method === 'cronometro' && (
                                    <div className="flex items-center gap-3">
                                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/15">
                                            <div
                                                className="h-full rounded-full bg-white transition-all"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <span className="shrink-0 text-xs tabular-nums text-slate-400">
                                            {fmtHM(clock)} / {fmtHM(targetSeconds)}
                                        </span>
                                    </div>
                                )}
                                {method === 'timer' && (
                                    <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                                        <div
                                            className="h-full rounded-full bg-emerald-400 transition-all"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                )}
                                {method === 'pomodoro' && (
                                    <div className="h-0 w-full border-t-2 border-dashed border-emerald-400" />
                                )}
                            </div>

                            {/* Relógio digital */}
                            <p className="mt-12 text-center font-mono text-6xl font-bold tabular-nums sm:text-7xl">
                                {fmtClock(clock)}
                            </p>

                            {/* Controles */}
                            <div className="mt-10 flex items-center justify-center gap-5">
                                <button
                                    type="button"
                                    onClick={() => setRunning((r) => !r)}
                                    aria-label={running ? 'Pausar' : 'Play'}
                                    className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-emerald-600 shadow-lg transition hover:scale-105"
                                >
                                    {running ? <PauseIcon /> : <FocusPlayIcon />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => resetClock()}
                                    aria-label="Stop"
                                    className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition hover:scale-105"
                                >
                                    <StopIcon />
                                </button>
                                {method === 'pomodoro' && (
                                    <button
                                        type="button"
                                        onClick={() => advancePomodoroStage(false)}
                                        aria-label="Avançar"
                                        className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white shadow-lg transition hover:bg-white/20"
                                    >
                                        <SkipIcon />
                                    </button>
                                )}
                            </div>

                            {method === 'pomodoro' && (
                                <>
                                    <p className="mt-4 text-center text-sm text-slate-400">
                                        Sessão {session} de {settings.cyclesUntilLong}
                                    </p>

                                    <div className="mt-6 flex items-center justify-center gap-2">
                                        {POMODORO_STAGES.map((s) => (
                                            <button
                                                key={s.key}
                                                type="button"
                                                onClick={() => {
                                                    setStage(s.key);
                                                    resetClock('pomodoro', s.key);
                                                }}
                                                className={
                                                    'rounded-full px-4 py-1.5 text-xs font-semibold transition ' +
                                                    (stage === s.key
                                                        ? 'bg-purple-600 text-white'
                                                        : 'border border-white/20 bg-slate-950 text-slate-300 hover:border-white/40')
                                                }
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Menu lateral — método de contagem */}
                        <div className="w-44 shrink-0 border-l border-white/10 bg-slate-950/60 p-6">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                Método
                            </p>
                            <div className="mt-4 flex flex-col gap-4">
                                {METHODS.map((m) => (
                                    <button
                                        key={m.key}
                                        type="button"
                                        onClick={() => changeMethod(m.key)}
                                        className={
                                            'text-left text-sm font-bold tracking-wide transition ' +
                                            (method === m.key
                                                ? 'text-emerald-400'
                                                : 'text-slate-400 hover:text-slate-200')
                                        }
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal — Configurações */}
            {showSettings && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60" onClick={() => setShowSettings(false)} />
                    <div className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 text-slate-800 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900">Configurações</h2>
                            <button
                                type="button"
                                onClick={() => setShowSettings(false)}
                                aria-label="Fechar"
                                className="text-slate-400 transition hover:text-slate-600"
                            >
                                <CloseXIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-slate-400">
                            Som do timer
                        </label>
                        <select
                            value={draft.sound}
                            onChange={(e) => setDraft((d) => ({ ...d, sound: e.target.value }))}
                            className="mt-1.5 w-full rounded-lg border-slate-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                        >
                            {Array.from({ length: 10 }, (_, i) => `Melodia ${i + 1}`).map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>

                        <label className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-700">
                            <input
                                type="checkbox"
                                checked={draft.repeat}
                                onChange={(e) => setDraft((d) => ({ ...d, repeat: e.target.checked }))}
                                className="h-4 w-4 rounded border-slate-300 accent-emerald-500"
                            />
                            Repetir
                        </label>

                        <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-slate-400">
                            Volume
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={draft.volume}
                            onChange={(e) => setDraft((d) => ({ ...d, volume: Number(e.target.value) }))}
                            className="mt-1.5 w-full accent-emerald-500"
                        />

                        <hr className="my-5 border-slate-100" />

                        <h3 className="text-sm font-bold text-slate-900">Pomodoro</h3>
                        <div className="mt-3 grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-slate-500">Sessão (min)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={draft.session}
                                    onChange={(e) => setDraft((d) => ({ ...d, session: Number(e.target.value) }))}
                                    className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500">Pausa curta (min)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={draft.curta}
                                    onChange={(e) => setDraft((d) => ({ ...d, curta: Number(e.target.value) }))}
                                    className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500">Pausa longa (min)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={draft.longa}
                                    onChange={(e) => setDraft((d) => ({ ...d, longa: Number(e.target.value) }))}
                                    className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500">Ciclos até pausa longa</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={draft.cyclesUntilLong}
                                    onChange={(e) =>
                                        setDraft((d) => ({ ...d, cyclesUntilLong: Number(e.target.value) }))
                                    }
                                    className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        <label className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-700">
                            <input
                                type="checkbox"
                                checked={draft.autoStartSessions}
                                onChange={(e) =>
                                    setDraft((d) => ({ ...d, autoStartSessions: e.target.checked }))
                                }
                                className="h-4 w-4 rounded border-slate-300 accent-emerald-500"
                            />
                            Iniciar sessões automaticamente
                        </label>
                        <label className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                            <input
                                type="checkbox"
                                checked={draft.autoStartBreaks}
                                onChange={(e) => setDraft((d) => ({ ...d, autoStartBreaks: e.target.checked }))}
                                className="h-4 w-4 rounded border-slate-300 accent-emerald-500"
                            />
                            Iniciar pausas automaticamente
                        </label>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowSettings(false)}
                                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={saveSettings}
                                className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal — confirmação de encerramento */}
            {confirmClose && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60" />
                    <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white">
                            <QuestionMarkIcon />
                        </div>
                        <h2 className="mt-4 text-lg font-bold text-slate-900">Encerrar Cronômetro</h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Deseja descartar o planejamento em andamento? O cronômetro irá se encerrar.
                        </p>
                        <div className="mt-6 flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setConfirmClose(false)}
                                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
                            >
                                Sim
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

/* --- Modal "Últimos Estudos" ---------------------------------------------- */
const BookmarkIcon = ({ className = 'h-3.5 w-3.5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 4.5h10.5a1.5 1.5 0 011.5 1.5v14.25l-6.75-4.5-6.75 4.5V6a1.5 1.5 0 011.5-1.5z"
        />
    </svg>
);
const DocumentIcon = ({ className = 'h-3.5 w-3.5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 3.75h7.5L19 8.25V19.5a1.5 1.5 0 01-1.5 1.5H7a1.5 1.5 0 01-1.5-1.5V5.25A1.5 1.5 0 017 3.75z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 3.75V8.25H19" />
    </svg>
);
const ClockSmallIcon = ({ className = 'h-3.5 w-3.5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3.5 2M20 12a8 8 0 11-16 0 8 8 0 0116 0z" />
    </svg>
);
const ChatIcon = ({ className = 'h-4 w-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12a7.5 7.5 0 1113.5 4.5l1.5 3-3.5-1.2A7.5 7.5 0 014.5 12z"
        />
    </svg>
);

function EmptyStudiesIllustration() {
    return (
        <svg viewBox="0 0 160 140" className="h-32 w-32">
            <rect x="20" y="18" width="80" height="104" rx="10" className="fill-slate-100" />
            <rect x="46" y="10" width="28" height="14" rx="5" className="fill-emerald-300" />
            <rect
                x="56"
                y="30"
                width="80"
                height="104"
                rx="10"
                className="fill-white stroke-slate-200"
                strokeWidth="2"
            />
            <rect x="82" y="22" width="28" height="14" rx="5" className="fill-emerald-500" />
            <rect x="70" y="56" width="52" height="6" rx="3" className="fill-slate-200" />
            <rect x="70" y="70" width="40" height="6" rx="3" className="fill-slate-200" />
            <rect x="70" y="84" width="46" height="6" rx="3" className="fill-slate-200" />
            <rect x="70" y="98" width="30" height="6" rx="3" className="fill-slate-200" />
        </svg>
    );
}

const WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

/** "2026-10-12" → "12 OUT/26 SEG". */
function formatGroupHeader(iso) {
    const d = new Date(`${iso}T00:00:00`);
    const day = String(d.getDate()).padStart(2, '0');
    return `${day} ${MONTHS[d.getMonth()]}/${String(d.getFullYear()).slice(-2)} ${WEEKDAYS[d.getDay()]}`;
}

/** Minutes → "00:30:00" (HH:MM:SS). */
function fmtHMS(minutes) {
    const total = Math.max(0, Math.round(minutes || 0)) * 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
}

const CATEGORY_PILL_STYLES = {
    Revisão: 'bg-red-100 text-red-700',
    Teoria: 'bg-blue-100 text-blue-700',
    Questões: 'bg-emerald-100 text-emerald-700',
};
const categoryPillClass = (cat) => CATEGORY_PILL_STYLES[cat] ?? 'bg-slate-100 text-slate-600';

function groupSessionsByDate(sessions) {
    const groups = [];
    let current = null;
    for (const s of sessions) {
        if (!current || current.date !== s.date) {
            current = { date: s.date, items: [] };
            groups.push(current);
        }
        current.items.push(s);
    }
    return groups;
}

function HistoryRow({ s }) {
    const [expanded, setExpanded] = useState(false);
    const wrong =
        s.questions_total != null && s.questions_correct != null
            ? s.questions_total - s.questions_correct
            : null;

    return (
        <div className="border-b border-slate-100 py-3 last:border-0">
            <div className="flex flex-wrap items-center gap-3">
                <span className="h-8 w-1 shrink-0 rounded-full bg-blue-300" />

                <div className="min-w-[150px]">
                    <p className="text-sm font-bold uppercase tracking-wide text-slate-800">
                        {s.subject}
                    </p>
                    {s.topic && <p className="text-xs text-slate-400">{s.topic}</p>}
                </div>

                {s.material && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                        <BookmarkIcon />
                        {s.material}
                    </span>
                )}

                {s.pages_read != null && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                        <DocumentIcon />
                        {s.pages_read}
                    </span>
                )}

                <span className="flex items-center gap-1 text-xs tabular-nums text-slate-500">
                    <ClockSmallIcon />
                    {fmtHMS(s.duration_minutes)}
                </span>

                {s.questions_total != null && (
                    <span className="flex items-center gap-1.5 text-xs font-bold tabular-nums">
                        <span className="text-emerald-600">{s.questions_correct ?? 0}</span>
                        <span className="text-red-500">{wrong ?? 0}</span>
                    </span>
                )}

                {s.category && (
                    <span
                        className={
                            'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ' +
                            categoryPillClass(s.category)
                        }
                    >
                        {s.category}
                    </span>
                )}

                <button
                    type="button"
                    onClick={() => s.notes && setExpanded((v) => !v)}
                    className="ml-auto flex items-center gap-1 text-slate-400 transition hover:text-slate-600"
                >
                    <ChatIcon />
                    {s.notes && (
                        <ChevronDownIcon
                            className={'h-3.5 w-3.5 transition-transform ' + (expanded ? 'rotate-180' : '')}
                        />
                    )}
                </button>
            </div>

            {expanded && s.notes && (
                <p className="ml-5 mt-2 whitespace-pre-line rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
                    {s.notes}
                </p>
            )}
        </div>
    );
}

function RecentSessionsModal({ item, onClose }) {
    const groups = groupSessionsByDate(item.recent_sessions ?? []);
    const isEmpty = groups.length === 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
            <div className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                    <h2 className="text-lg font-bold text-slate-900">Últimos Estudos</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar"
                        className="text-slate-400 transition hover:text-slate-600"
                    >
                        <CloseXIcon className="h-5 w-5" />
                    </button>
                </div>

                {isEmpty ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16">
                        <EmptyStudiesIllustration />
                        <p className="max-w-xs text-center text-sm text-slate-400">
                            Você ainda não tem nenhum registro de estudos, vamos começar?
                        </p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        {groups.map((g) => (
                            <div key={g.date} className="mb-5 last:mb-0">
                                <div className="flex items-center gap-3">
                                    <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        {formatGroupHeader(g.date)}
                                    </span>
                                    <span className="h-px flex-1 bg-emerald-100" />
                                </div>
                                <div className="mt-1">
                                    {g.items.map((s) => (
                                        <HistoryRow key={s.id} s={s} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* --- Card de disciplina (Sequência dos estudos) -------------------------- */
function SubjectCard({ item, index, onStart, onManual, onHistory }) {
    return (
        <li className="group rounded-lg border border-transparent bg-white px-3 py-2.5 transition-all duration-300 ease-out hover:border-blue-200 hover:bg-blue-50">
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
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
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
                        onClick={() => onHistory(item)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                    >
                        <HistoryIcon />
                        Ver Últimos Estudos
                    </button>
                </div>
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

/* --- Registro de Estudo — modal "Adicionar Estudo Manualmente" ----------- */
const CATEGORY_OPTIONS = ['Teoria', 'Revisão', 'Questões'];
const NEW_CATEGORY = '__new__';
const PASTEL_COLORS = [
    '#fecaca', '#fed7aa', '#fef08a', '#d9f99d', '#bbf7d0',
    '#a7f3d0', '#99f6e4', '#a5f3fc', '#bae6fd', '#bfdbfe',
    '#c7d2fe', '#ddd6fe', '#e9d5ff', '#f5d0fe', '#fbcfe8',
];
const REVIEW_CANDIDATES = [1, 3, 7, 14, 21, 30, 45, 60, 90, 120, 150, 180];

const ChevronDownIcon = ({ className = 'h-4 w-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);
const SmallPlusIcon = ({ className = 'h-3.5 w-3.5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

function todayISO() {
    return new Date().toISOString().slice(0, 10);
}
function yesterdayISO() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
}

function FieldLabel({ children }) {
    return (
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            {children}
        </label>
    );
}

const fieldClass =
    'mt-1.5 w-full rounded-lg border-slate-300 text-sm focus:border-emerald-500 focus:ring-emerald-500';

function StudyLogModal({ item, subjects, onClose }) {
    const [dateChoice, setDateChoice] = useState('hoje');
    const [customDate, setCustomDate] = useState(todayISO());

    const [categories, setCategories] = useState(CATEGORY_OPTIONS);
    const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
    const [showCategoryList, setShowCategoryList] = useState(false);
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newCatColor, setNewCatColor] = useState(PASTEL_COLORS[0]);
    const [showColorPopover, setShowColorPopover] = useState(false);

    const [subjectItemId, setSubjectItemId] = useState(item.id);
    const subject = subjects.find((s) => s.id === Number(subjectItemId)) ?? item;

    const [hh, setHh] = useState('00');
    const [mm, setMm] = useState('30');
    const [ss, setSs] = useState('00');

    const [topicQuery, setTopicQuery] = useState('');
    const [topicId, setTopicId] = useState(null);
    const [showTopicList, setShowTopicList] = useState(false);

    const [material, setMaterial] = useState('');

    const [theoryDone, setTheoryDone] = useState(false);
    const [scheduleReviews, setScheduleReviews] = useState(false);
    const [reviewIntervals, setReviewIntervals] = useState([1, 7, 30, 60, 120]);
    const [countInPlan, setCountInPlan] = useState(true);

    const [correct, setCorrect] = useState('');
    const [wrong, setWrong] = useState('');
    const [pages, setPages] = useState([{ start: '', end: '' }]);
    const [videos, setVideos] = useState([{ title: '', start: '', end: '' }]);

    const [comments, setComments] = useState('');
    const [saving, setSaving] = useState(false);

    const topics = subject?.topics ?? [];
    const filteredTopics = topics
        .filter((t) => t.label.toLowerCase().includes(topicQuery.toLowerCase()))
        .slice(0, 8);

    const addReviewInterval = () => {
        const next = REVIEW_CANDIDATES.find((d) => !reviewIntervals.includes(d));
        const value = next ?? Math.max(...reviewIntervals, 0) + 15;
        setReviewIntervals((prev) => [...prev, value].sort((a, b) => a - b));
    };
    const removeReviewInterval = (d) =>
        setReviewIntervals((prev) => prev.filter((x) => x !== d));

    const updateRow = (setter, index, field, value) =>
        setter((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));

    const saveNewCategory = () => {
        const name = newCatName.trim();
        if (!name) return;
        setCategories((prev) => [...prev, name]);
        setCategory(name);
        setShowNewCategory(false);
        setNewCatName('');
        setNewCatColor(PASTEL_COLORS[0]);
    };

    // Vídeoaulas não têm colunas próprias — viram uma linha legível dentro do
    // comentário, junto do texto livre digitado pelo aluno.
    const buildNotes = () => {
        const parts = [];
        const videoEntries = videos
            .filter((v) => v.title.trim() || v.start || v.end)
            .map((v) => `${v.title || 'Vídeo'} (${v.start || '00:00'}–${v.end || '00:00'})`);
        if (videoEntries.length) parts.push(`Videoaulas: ${videoEntries.join('; ')}`);
        if (comments.trim()) parts.push(comments.trim());
        return parts.join('\n') || null;
    };

    const totalPagesRead = pages.reduce((sum, p) => {
        const start = Number(p.start);
        const end = Number(p.end);
        if (!start || !end || end < start) return sum;
        return sum + (end - start + 1);
    }, 0);

    const durationMinutes = Math.max(
        1,
        Math.round((Number(hh) || 0) * 60 + (Number(mm) || 0) + (Number(ss) || 0) / 60),
    );

    const save = () => {
        setSaving(true);
        router.post(
            '/planejamento/sessoes',
            {
                study_cycle_item_id: subjectItemId,
                date: dateChoice === 'hoje' ? todayISO() : dateChoice === 'ontem' ? yesterdayISO() : customDate,
                duration_minutes: durationMinutes,
                topic_id: topicId,
                category,
                material: material.trim() || null,
                pages_read: totalPagesRead > 0 ? totalPagesRead : null,
                questions_total: correct !== '' || wrong !== '' ? (Number(correct) || 0) + (Number(wrong) || 0) : null,
                questions_correct: correct !== '' ? Number(correct) : null,
                count_in_plan: countInPlan,
                theory_completed: theoryDone,
                review_intervals: scheduleReviews ? reviewIntervals : [],
                notes: buildNotes(),
            },
            {
                preserveScroll: true,
                onSuccess: onClose,
                onFinish: () => setSaving(false),
            },
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50" onClick={() => !saving && onClose()} />

            <div className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Registro de Estudo</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar"
                        className="text-slate-400 transition hover:text-slate-600"
                    >
                        <CloseXIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Data */}
                <div className="mt-5 flex flex-wrap items-center gap-2">
                    {[
                        { key: 'hoje', label: 'Hoje' },
                        { key: 'ontem', label: 'Ontem' },
                        { key: 'outro', label: 'Outro' },
                    ].map((d) => (
                        <button
                            key={d.key}
                            type="button"
                            onClick={() => setDateChoice(d.key)}
                            className={
                                'rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition ' +
                                (dateChoice === d.key
                                    ? 'bg-emerald-600 text-white'
                                    : 'border border-slate-300 bg-white text-slate-500 hover:border-emerald-400')
                            }
                        >
                            {d.label}
                        </button>
                    ))}
                    {dateChoice === 'outro' && (
                        <input
                            type="date"
                            value={customDate}
                            onChange={(e) => setCustomDate(e.target.value)}
                            max={todayISO()}
                            className="rounded-lg border-slate-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                        />
                    )}
                </div>

                {/* Campos principais */}
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Categoria */}
                    <div className="relative">
                        <FieldLabel>Categoria</FieldLabel>
                        <button
                            type="button"
                            onClick={() => setShowCategoryList((v) => !v)}
                            className={fieldClass + ' flex items-center justify-between bg-white px-3 py-2 text-left text-slate-700'}
                        >
                            {category}
                            <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                        </button>
                        {showCategoryList && (
                            <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                                {categories.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => {
                                            setCategory(c);
                                            setShowCategoryList(false);
                                        }}
                                        className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                    >
                                        {c}
                                    </button>
                                ))}
                                <div className="my-1 border-t border-slate-100" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCategoryList(false);
                                        setShowNewCategory(true);
                                    }}
                                    className="block w-full px-3 py-2 text-left text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                                >
                                    + Nova Categoria
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Disciplina */}
                    <div>
                        <FieldLabel>Disciplina</FieldLabel>
                        <select
                            value={subjectItemId}
                            onChange={(e) => {
                                setSubjectItemId(Number(e.target.value));
                                setTopicId(null);
                                setTopicQuery('');
                            }}
                            className={fieldClass}
                        >
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.subject}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tempo de estudo */}
                    <div>
                        <FieldLabel>Tempo de estudo (HH:MM:SS)</FieldLabel>
                        <div className="mt-1.5 flex items-center gap-1">
                            <input
                                type="number"
                                min="0"
                                max="23"
                                value={hh}
                                onChange={(e) => setHh(String(Math.min(23, Math.max(0, Number(e.target.value) || 0))).padStart(2, '0'))}
                                onFocus={(e) => e.target.select()}
                                className="w-full rounded-lg border-slate-300 text-center text-sm tabular-nums focus:border-emerald-500 focus:ring-emerald-500"
                            />
                            <span className="font-bold text-slate-400">:</span>
                            <input
                                type="number"
                                min="0"
                                max="59"
                                value={mm}
                                onChange={(e) => setMm(String(Math.min(59, Math.max(0, Number(e.target.value) || 0))).padStart(2, '0'))}
                                onFocus={(e) => e.target.select()}
                                className="w-full rounded-lg border-slate-300 text-center text-sm tabular-nums focus:border-emerald-500 focus:ring-emerald-500"
                            />
                            <span className="font-bold text-slate-400">:</span>
                            <input
                                type="number"
                                min="0"
                                max="59"
                                value={ss}
                                onChange={(e) => setSs(String(Math.min(59, Math.max(0, Number(e.target.value) || 0))).padStart(2, '0'))}
                                onFocus={(e) => e.target.select()}
                                className="w-full rounded-lg border-slate-300 text-center text-sm tabular-nums focus:border-emerald-500 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Tópico (autocomplete) */}
                    <div className="relative">
                        <FieldLabel>Tópico</FieldLabel>
                        <input
                            type="text"
                            value={topicQuery}
                            onFocus={() => setShowTopicList(true)}
                            onChange={(e) => {
                                setTopicQuery(e.target.value);
                                setTopicId(null);
                                setShowTopicList(true);
                            }}
                            onBlur={() => setTimeout(() => setShowTopicList(false), 150)}
                            placeholder="Buscar conteúdo da disciplina…"
                            className={fieldClass}
                        />
                        {showTopicList && filteredTopics.length > 0 && (
                            <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                                {filteredTopics.map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onMouseDown={() => {
                                            setTopicQuery(t.label);
                                            setTopicId(t.id);
                                            setShowTopicList(false);
                                            // Pré-preenche com a duração real da aula; o
                                            // aluno pode apagar e digitar outro valor.
                                            if (t.minutes) {
                                                setHh(String(Math.floor(t.minutes / 60)).padStart(2, '0'));
                                                setMm(String(t.minutes % 60).padStart(2, '0'));
                                                setSs('00');
                                            }
                                        }}
                                        className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Material */}
                    <div className="sm:col-span-2">
                        <FieldLabel>Material</FieldLabel>
                        <input
                            type="text"
                            value={material}
                            onChange={(e) => setMaterial(e.target.value)}
                            placeholder="PDF, livro, videoaula…"
                            className={fieldClass}
                        />
                    </div>
                </div>

                {/* Checkboxes */}
                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <input
                            type="checkbox"
                            checked={theoryDone}
                            onChange={(e) => setTheoryDone(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 accent-emerald-500"
                        />
                        Teoria finalizada
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <input
                            type="checkbox"
                            checked={scheduleReviews}
                            onChange={(e) => setScheduleReviews(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 accent-emerald-500"
                        />
                        Programar revisões
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <input
                            type="checkbox"
                            checked={countInPlan}
                            onChange={(e) => setCountInPlan(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 accent-blue-500"
                        />
                        Contabilizar no planejamento
                    </label>
                </div>

                {scheduleReviews && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 p-3">
                        {reviewIntervals.map((d) => (
                            <span
                                key={d}
                                className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                            >
                                {d}d
                                <button
                                    type="button"
                                    onClick={() => removeReviewInterval(d)}
                                    className="text-emerald-500 hover:text-emerald-800"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                        <button
                            type="button"
                            onClick={addReviewInterval}
                            aria-label="Adicionar intervalo de revisão"
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white transition hover:bg-emerald-600"
                        >
                            <SmallPlusIcon />
                        </button>
                    </div>
                )}

                {/* Métricas */}
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-emerald-200 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                            Questões
                        </p>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs text-slate-500">Acertos</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={correct}
                                    onChange={(e) => setCorrect(e.target.value)}
                                    className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500">Erros</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={wrong}
                                    onChange={(e) => setWrong(e.target.value)}
                                    className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-emerald-200 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                            Páginas
                        </p>
                        <div className="mt-3 space-y-2">
                            {pages.map((p, i) => (
                                <div key={i} className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs text-slate-500">Início</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={p.start}
                                            onChange={(e) => updateRow(setPages, i, 'start', e.target.value)}
                                            className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500">Fim</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={p.end}
                                            onChange={(e) => updateRow(setPages, i, 'end', e.target.value)}
                                            className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => setPages((prev) => [...prev, { start: '', end: '' }])}
                            aria-label="Adicionar páginas"
                            className="mt-3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white transition hover:bg-emerald-600"
                        >
                            <SmallPlusIcon />
                        </button>
                    </div>

                    <div className="rounded-lg border border-emerald-200 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                            Videoaulas
                        </p>
                        <div className="mt-3 space-y-2">
                            {videos.map((v, i) => (
                                <div key={i} className="space-y-2">
                                    <div>
                                        <label className="block text-xs text-slate-500">Título</label>
                                        <input
                                            type="text"
                                            value={v.title}
                                            onChange={(e) => updateRow(setVideos, i, 'title', e.target.value)}
                                            className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs text-slate-500">Início</label>
                                            <input
                                                type="text"
                                                placeholder="00:00"
                                                value={v.start}
                                                onChange={(e) => updateRow(setVideos, i, 'start', e.target.value)}
                                                className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-500">Fim</label>
                                            <input
                                                type="text"
                                                placeholder="00:00"
                                                value={v.end}
                                                onChange={(e) => updateRow(setVideos, i, 'end', e.target.value)}
                                                className="mt-1 w-full rounded-lg border-slate-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => setVideos((prev) => [...prev, { title: '', start: '', end: '' }])}
                            aria-label="Adicionar videoaula"
                            className="mt-3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white transition hover:bg-emerald-600"
                        >
                            <SmallPlusIcon />
                        </button>
                    </div>
                </div>

                {/* Comentários */}
                <div className="mt-5">
                    <FieldLabel>Comentários</FieldLabel>
                    <textarea
                        rows={3}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        className={fieldClass}
                    />
                </div>

                {/* Ações */}
                <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-lg border border-emerald-600 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={save}
                        disabled={saving}
                        className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                        {saving ? 'Salvando…' : 'Salvar'}
                    </button>
                </div>
            </div>

            {/* Modal — Nova Categoria */}
            {showNewCategory && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/50" onClick={() => setShowNewCategory(false)} />
                    <div className="relative z-10 w-full max-w-xs rounded-2xl bg-white p-5 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900">Nova Categoria</h3>
                            <button
                                type="button"
                                onClick={() => setShowNewCategory(false)}
                                aria-label="Fechar"
                                className="text-slate-400 transition hover:text-slate-600"
                            >
                                <CloseXIcon className="h-4 w-4" />
                            </button>
                        </div>

                        <FieldLabel>Nome</FieldLabel>
                        <input
                            type="text"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            className={fieldClass}
                        />

                        <div className="relative mt-4">
                            <FieldLabel>Cor</FieldLabel>
                            <button
                                type="button"
                                onClick={() => setShowColorPopover((v) => !v)}
                                className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600"
                            >
                                <span
                                    className="h-4 w-4 rounded-full border border-slate-200"
                                    style={{ backgroundColor: newCatColor }}
                                />
                                Escolher cor
                            </button>
                            {showColorPopover && (
                                <div className="absolute z-20 mt-1 grid grid-cols-5 gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                                    {PASTEL_COLORS.map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => {
                                                setNewCatColor(c);
                                                setShowColorPopover(false);
                                            }}
                                            style={{ backgroundColor: c }}
                                            className={
                                                'h-6 w-6 rounded-full transition ' +
                                                (newCatColor === c
                                                    ? 'ring-2 ring-offset-2 ring-emerald-500'
                                                    : 'hover:scale-110')
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={saveNewCategory}
                            className="mt-5 w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                        >
                            Salvar
                        </button>
                    </div>
                </div>
            )}
        </div>
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

    // Modo de foco — ambiente de estudo em tela cheia
    const [focusItem, setFocusItem] = useState(null);
    const startSubject = (item) => setFocusItem(item);

    // Modal "Registro de Estudo" (Adicionar Estudo Manualmente)
    const [manualItem, setManualItem] = useState(null);
    const openManual = (item) => setManualItem(item);

    // Modal "Últimos Estudos"
    const [historyItem, setHistoryItem] = useState(null);

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
                                    onHistory={setHistoryItem}
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

            {/* Botão flutuante — cronômetro (oculto durante o modo de foco, que já tem o seu) */}
            {!focusItem && (
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
            )}

            {/* Modo de foco */}
            {focusItem && <FocusMode item={focusItem} onClose={() => setFocusItem(null)} />}

            {/* Modal — Registro de Estudo */}
            {manualItem && (
                <StudyLogModal
                    item={manualItem}
                    subjects={cycle.sequence}
                    onClose={() => setManualItem(null)}
                />
            )}

            {/* Modal — Últimos Estudos */}
            {historyItem && (
                <RecentSessionsModal item={historyItem} onClose={() => setHistoryItem(null)} />
            )}
        </div>
    );
}

Planejamento.layout = (page) => <AppLayout title="Planejamento">{page}</AppLayout>;
