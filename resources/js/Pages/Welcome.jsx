import { Head, Link } from '@inertiajs/react';

export default function Welcome({ laravelVersion }) {
    return (
        <>
            <Head title="Bem-vindo" />

            <div className="min-h-screen flex flex-col items-center justify-center px-6">
                <div className="max-w-2xl text-center">
                    <span className="inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-700">
                        Plataforma educacional
                    </span>

                    <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
                        Ciclo <span className="text-brand-600">Inteligente</span>
                    </h1>

                    <p className="mt-4 text-lg text-slate-600">
                        Transforme o conteúdo dos seus cursos preparatórios em um
                        plano de estudos inteligente, personalizado e automático.
                    </p>

                    <div className="mt-8 flex items-center justify-center gap-4">
                        <Link
                            href="/metas-do-dia"
                            className="rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
                        >
                            Acessar o painel
                        </Link>
                        <a
                            href="https://laravel.com/docs"
                            className="rounded-lg px-5 py-3 text-sm font-semibold text-slate-700 transition hover:text-brand-600"
                        >
                            Documentação
                        </a>
                    </div>

                    <p className="mt-10 text-xs text-slate-400">
                        Laravel v{laravelVersion} · Inertia · React · Tailwind · PostgreSQL
                    </p>
                </div>
            </div>
        </>
    );
}
