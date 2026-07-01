import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';

const SearchIcon = () => (
    <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
    </svg>
);

/** Card de um órgão com a lista de cargos daquele concurso. */
function OrgaoCard({ orgao }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-base font-semibold text-slate-900">{orgao.name}</p>
            {orgao.banca && <p className="text-sm text-slate-500">{orgao.banca}</p>}

            <ul className="mt-3 space-y-2">
                {orgao.cargos.map((cargo, i) => (
                    <li
                        key={i}
                        className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    >
                        {cargo}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function PlanosNovo({ upcoming = [] }) {
    const [query, setQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <Head title="Criar novo plano" />

            <div className="mx-auto max-w-4xl px-4">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
                            CI
                        </span>
                        <span className="font-semibold text-slate-900">Criar novo plano</span>
                    </div>
                    <Link href="/planos" className="text-sm text-slate-400 hover:text-slate-600">
                        Voltar aos planos
                    </Link>
                </div>

                {/* Busca */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <form
                        onSubmit={(e) => e.preventDefault()}
                        className="flex flex-col gap-3 sm:flex-row"
                    >
                        <div className="relative flex-1">
                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                                <SearchIcon />
                            </span>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Busque por edital, sigla, órgão ou palavra-chave"
                                className="w-full rounded-lg border-slate-300 pl-10 text-sm focus:border-brand-500 focus:ring-brand-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                        >
                            Buscar
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowFilters((v) => !v)}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                        >
                            Filtros avançados
                        </button>
                    </form>

                    {showFilters && (
                        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
                            <select className="rounded-lg border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500">
                                <option value="">Banca (todas)</option>
                                <option>Cebraspe</option>
                                <option>FGV</option>
                                <option>FCC</option>
                            </select>
                            <select className="rounded-lg border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500">
                                <option value="">Escolaridade (todas)</option>
                                <option>Médio</option>
                                <option>Superior</option>
                            </select>
                            <select className="rounded-lg border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500">
                                <option value="">Situação (todas)</option>
                                <option>Previsto</option>
                                <option>Edital publicado</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* Plano personalizado */}
                <a
                    href="/onboarding"
                    className="mt-4 flex items-center gap-4 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50/50 p-5 transition hover:border-brand-500 hover:bg-brand-50"
                >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold leading-none text-white">
                        +
                    </span>
                    <div>
                        <p className="font-semibold text-brand-700">Criar plano personalizado</p>
                        <p className="text-sm text-slate-500">
                            Crie um plano personalizado e adicione as disciplinas e tópicos que desejar.
                        </p>
                    </div>
                </a>

                {/* Catálogo de concursos futuros */}
                <div className="mt-8">
                    <h2 className="text-sm font-semibold text-slate-700">Concursos disponíveis</h2>

                    {upcoming.length === 0 ? (
                        <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                            <p className="text-sm text-slate-500">Não há planos cadastrados no momento.</p>
                            <p className="mt-1 text-xs text-slate-400">
                                Em breve adicionaremos concursos prontos para você começar com um clique.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {upcoming.map((orgao, i) => (
                                <OrgaoCard key={i} orgao={orgao} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
