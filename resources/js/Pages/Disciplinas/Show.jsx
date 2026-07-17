import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const ChevronLeftIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);

const ChevronDownIcon = ({ className = 'h-4 w-4' }) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

const CheckIcon = ({ className = 'h-3.5 w-3.5' }) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

/* --- Tópico folha: checkbox "estudado" + acerto ------------------------- */
function TopicRow({ subjectId, topic }) {
    const toggle = () =>
        router.post(
            `/disciplinas/${subjectId}/topicos/${topic.id}/alternar`,
            {},
            { preserveScroll: true, preserveState: true },
        );

    return (
        <li>
            <button
                type="button"
                onClick={toggle}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-slate-50"
            >
                <span
                    className={
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ' +
                        (topic.completed
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-slate-300 text-transparent')
                    }
                >
                    <CheckIcon />
                </span>

                <span
                    className={
                        'flex-1 text-sm ' +
                        (topic.completed ? 'text-slate-400 line-through' : 'text-slate-700')
                    }
                >
                    <span className="mr-1.5 tabular-nums text-slate-400">{topic.number}.</span>
                    {topic.name}
                </span>

                {topic.accuracy != null && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-600">
                        {topic.accuracy}%
                    </span>
                )}
            </button>
        </li>
    );
}

/* --- Tópico com subtópicos: cabeçalho colapsável ------------------------ */
function TopicNode({ subjectId, topic }) {
    const [open, setOpen] = useState(true);

    if (topic.subtopics.length === 0) {
        return <TopicRow subjectId={subjectId} topic={topic} />;
    }

    return (
        <li>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-slate-50"
            >
                <ChevronDownIcon
                    className={
                        'h-5 w-5 shrink-0 text-slate-400 transition-transform ' + (open ? '' : '-rotate-90')
                    }
                />
                <span className="flex-1 text-sm font-semibold text-slate-800">
                    <span className="mr-1.5 tabular-nums text-slate-400">{topic.number}.</span>
                    {topic.name}
                </span>
            </button>

            {open && (
                <ul className="ml-6 space-y-0.5 border-l border-slate-100 pl-3">
                    {topic.subtopics.map((st) => (
                        <TopicRow key={st.id} subjectId={subjectId} topic={st} />
                    ))}
                </ul>
            )}
        </li>
    );
}

export default function DisciplinaShow({ subject, plan_id: planId, stats, topics = [] }) {
    const pct = stats.topics_total > 0 ? Math.round((stats.topics_completed / stats.topics_total) * 100) : 0;

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <Link
                href={`/planos/${planId}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-brand-600"
            >
                <ChevronLeftIcon />
                Voltar ao plano
            </Link>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: subject.color }} />
                    <p className="text-lg font-semibold text-slate-900">{subject.name}</p>
                </div>

                <div className="mt-5 grid grid-cols-3 divide-x divide-slate-200 text-center">
                    <div className="px-2">
                        <p className="text-2xl font-bold text-slate-900">{stats.topics_completed}</p>
                        <p className="mt-1 text-xs text-slate-500">Tópicos Estudados</p>
                    </div>
                    <div className="px-2">
                        <p className="text-2xl font-bold text-slate-900">{stats.topics_total}</p>
                        <p className="mt-1 text-xs text-slate-500">Tópicos Totais</p>
                    </div>
                    <div className="px-2">
                        <p className="text-2xl font-bold text-slate-900">{stats.questions_resolved}</p>
                        <p className="mt-1 text-xs text-slate-500">Questões Resolvidas</p>
                    </div>
                </div>

                <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: subject.color }}
                    />
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                    Tópicos
                </p>
                <ul className="mt-2 space-y-0.5">
                    {topics.length === 0 ? (
                        <li className="px-2 py-2 text-sm text-slate-400">Sem tópicos cadastrados.</li>
                    ) : (
                        topics.map((t) => <TopicNode key={t.id} subjectId={subject.id} topic={t} />)
                    )}
                </ul>
            </div>
        </div>
    );
}

DisciplinaShow.layout = (page) => <AppLayout title={page.props.subject?.name ?? 'Disciplina'}>{page}</AppLayout>;
