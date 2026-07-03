import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Link, router } from '@inertiajs/react';

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

function TopicRow({ topic }) {
    const toggle = () => {
        router.post(
            `/edital-verticalizado/topicos/${topic.id}/alternar`,
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

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

function TopicNode({ topic }) {
    if (topic.subtopics.length === 0) {
        return <TopicRow topic={topic} />;
    }

    return (
        <li>
            <p className="flex items-center gap-1.5 px-2 py-2 text-sm font-semibold text-slate-800">
                <span className="tabular-nums text-slate-400">{topic.number}.</span>
                {topic.name}
            </p>
            <ul className="ml-6 space-y-0.5 border-l border-slate-100 pl-3">
                {topic.subtopics.map((st) => (
                    <TopicRow key={st.id} topic={st} />
                ))}
            </ul>
        </li>
    );
}

function SubjectSection({ subject, expanded, onToggle }) {
    const pct = subject.topics_total > 0
        ? Math.round((subject.topics_completed / subject.topics_total) * 100)
        : 0;

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full items-center gap-3 px-5 py-4 text-left"
            >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: subject.color }} />
                <span className="flex-1 text-sm font-semibold text-slate-800">{subject.name}</span>
                <span className="text-xs font-medium tabular-nums text-slate-500">
                    {subject.topics_completed}/{subject.topics_total} vistos
                </span>
                <ChevronDownIcon
                    className={'h-4 w-4 text-slate-400 transition-transform ' + (expanded ? 'rotate-180' : '')}
                />
            </button>

            <div className="px-5 pb-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: subject.color }}
                    />
                </div>
            </div>

            {expanded && (
                <ul className="space-y-0.5 border-t border-slate-100 px-3 py-3">
                    {subject.topics.length === 0 ? (
                        <li className="px-2 py-2 text-xs text-slate-400">Sem tópicos cadastrados.</li>
                    ) : (
                        subject.topics.map((t) => <TopicNode key={t.id} topic={t} />)
                    )}
                </ul>
            )}
        </div>
    );
}

export default function EditalVerticalizado({
    hasPlan = false,
    total_topics: totalTopics = 0,
    completed_topics: completedTopics = 0,
    subjects = [],
}) {
    const [expandedIds, setExpandedIds] = useState(new Set());

    const toggleSubject = (id) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    if (!hasPlan) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="text-slate-500">
                    Crie um plano de estudos para acompanhar seu avanço no edital.
                </p>
                <Link
                    href="/planos"
                    className="mt-3 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
                >
                    Criar meu plano
                </Link>
            </div>
        );
    }

    const overallPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return (
        <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-800">Avanço no edital</span>
                    <span className="tabular-nums text-slate-500">
                        {completedTopics} de {totalTopics} tópicos concluídos
                    </span>
                </div>
                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${overallPct}%` }}
                    />
                </div>
            </section>

            <section className="space-y-3">
                {subjects.map((s) => (
                    <SubjectSection
                        key={s.id}
                        subject={s}
                        expanded={expandedIds.has(s.id)}
                        onToggle={() => toggleSubject(s.id)}
                    />
                ))}
            </section>
        </div>
    );
}

EditalVerticalizado.layout = (page) => <AppLayout title="Edital Verticalizado">{page}</AppLayout>;
