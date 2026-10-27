import { useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const { status, data, cities, error, query, search, selectCity, retry } = useWeather();

  function renderContent() {
    switch (status) {
      case 'idle':
        return (
          <section className="border-y border-white/10 py-12 sm:py-16">
            <p className="text-sm font-semibold uppercase text-accent-400">Clima local</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold text-white sm:text-5xl">
              Qual cidade você quer consultar?
            </h2>
            <p className="mt-4 max-w-xl text-base text-white/70">
              Comece com São Paulo para visualizar a tela de exemplo.
            </p>
          </section>
        );
      case 'loading':
        return <LoadingState message={`Buscando o clima de ${query}...`} />;
      case 'empty':
        return (
          <EmptyState
            title="Nenhuma cidade encontrada"
            tip={`Não encontramos resultados para “${query}”. Confira o nome e tente novamente.`}
          />
        );
      case 'error':
        return (
          <ErrorState
            message={error ?? 'Não foi possível carregar os dados meteorológicos.'}
            onRetry={retry}
          />
        );
      case 'success':
        if (!data) {
          return (
            <ErrorState message="Os dados meteorológicos não estão disponíveis." onRetry={retry} />
          );
        }

        return (
          <div className="space-y-8">
            {cities.length > 1 && (
              <section aria-labelledby="city-results-heading" className="space-y-3">
                <h2 className="text-lg font-semibold text-white" id="city-results-heading">
                  Resultados da busca
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {cities.map((city) => (
                    <li key={city.id}>
                      <button
                        aria-pressed={city.id === data.city.id}
                        className="min-h-11 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-left text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
                        onClick={() => selectCity(city)}
                        type="button"
                      >
                        <span className="block font-medium">{city.name}</span>
                        <span className="block text-sm text-white/70">
                          {[city.administrativeArea, city.country].filter(Boolean).join(' · ')}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {data.current ? (
              <CurrentWeather city={data.city} current={data.current} unit={unit} />
            ) : (
              <EmptyState
                title="Clima atual indisponível"
                tip="Os dados atuais desta cidade não estão disponíveis no momento."
              />
            )}
            <ForecastList forecast={data.forecast} unit={unit} />
          </div>
        );
    }
  }

  return (
    <div className="min-h-screen bg-night-900 bg-[radial-gradient(ellipse_at_top,_rgba(109,124,255,0.12),_transparent_55%)] font-sans text-white">
      <header className="border-b border-white/10 bg-night-900/60">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span aria-hidden="true" className="text-3xl text-sun">
              ☀
            </span>
            <div>
              <p className="text-xs font-semibold uppercase text-white/70">Weather</p>
              <h1 className="text-xl font-semibold text-white">Tempo</h1>
            </div>
          </div>

          <div className="col-start-2 row-start-1 lg:col-start-3 lg:row-start-1">
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>

          <div className="col-span-2 row-start-2 lg:col-span-1 lg:col-start-2 lg:row-start-1">
            <SearchBar disabled={status === 'loading'} onSearch={search} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {renderContent()}
      </main>

      <footer className="border-t border-white/10 px-4 py-5 text-center text-sm text-white/70">
        Dados meteorológicos por{' '}
        <a
          className="text-white/75 underline decoration-white/30 underline-offset-4 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
          href="https://open-meteo.com/"
          rel="noreferrer"
          target="_blank"
        >
          Open-Meteo
        </a>
      </footer>
    </div>
  );
}
