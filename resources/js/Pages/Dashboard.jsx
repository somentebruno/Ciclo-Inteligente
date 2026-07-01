import { Head, Link } from '@inertiajs/react';

function StatCard({ label, value, suffix }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
                {value}
                {suffix ? <span className="ml-1 text-base font-medium text-slate-400">{suffix}</span> : null}
            </p>
        </div>
    );
}

export default function Dashboard({ stats, courses }) {
    return (
        <>
            <Head title="Painel" />

            <div className="mx-auto max-w-6xl px-6 py-10">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Painel</h1>
                        <p className="text-sm text-slate-500">
                            Visão geral dos seus cursos e ciclos de estudo.
                        </p>
                    </div>
                    <Link
                        href="/"
                        className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                    >
                        ← Início
                    </Link>
                </header>

                <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Cursos" value={stats.courses} />
                    <StatCard label="Ciclos" value={stats.cycles} />
                    <StatCard label="Sessões" value={stats.sessions} />
                    <StatCard label="Tempo estudado" value={Math.round(stats.minutesStudied / 60)} suffix="h" />
                </section>

                <section className="mt-10">
                    <h2 className="text-lg font-semibold text-slate-900">Cursos</h2>

                    {courses.length === 0 ? (
                        <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                            Nenhum curso cadastrado ainda. Rode o seeder com{' '}
                            <code className="rounded bg-slate-100 px-1 py-0.5">php artisan db:seed</code>.
                        </p>
                    ) : (
                        <ul className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
                            {courses.map((course) => (
                                <li key={course.id} className="flex items-center justify-between px-5 py-4">
                                    <div>
                                        <p className="font-medium text-slate-900">{course.name}</p>
                                        <p className="text-sm text-slate-500">
                                            {course.exam_board ?? 'Banca não informada'} · {course.subjects_count} disciplinas
                                        </p>
                                    </div>
                                    <span
                                        className={
                                            'rounded-full px-2.5 py-0.5 text-xs font-medium ' +
                                            (course.is_active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-slate-100 text-slate-500')
                                        }
                                    >
                                        {course.is_active ? 'Ativo' : 'Inativo'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </>
    );
}
