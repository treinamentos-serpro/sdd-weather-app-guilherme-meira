import { useEffect, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { mockWeatherData } from './mocks/weatherData';
import type { Unit, WeatherData } from './types/weather';

type ContentState =
  | { status: 'idle' }
  | { status: 'loading'; query: string }
  | { status: 'empty'; query: string }
  | { status: 'error'; query: string; message: string }
  | { status: 'success'; data: WeatherData };

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const [content, setContent] = useState<ContentState>({ status: 'idle' });

  useEffect(() => {
    if (content.status !== 'loading') return;

    const { query } = content;
    const timeoutId = window.setTimeout(() => {
      try {
        const isSampleCity =
          query.toLocaleLowerCase('pt-BR') === mockWeatherData.city.name.toLocaleLowerCase('pt-BR');

        setContent(
          isSampleCity ? { status: 'success', data: mockWeatherData } : { status: 'empty', query },
        );
      } catch {
        setContent({
          status: 'error',
          query,
          message: `Não foi possível carregar os dados de ${query}.`,
        });
      }
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [content]);

  function handleSearch(query: string) {
    setContent({ status: 'loading', query });
  }

  function handleRetry() {
    if (content.status === 'error') {
      setContent({ status: 'loading', query: content.query });
    }
  }

  function renderContent() {
    switch (content.status) {
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
        return <LoadingState message={`Buscando o clima de ${content.query}...`} />;
      case 'empty':
        return (
          <EmptyState
            title="Cidade não encontrada"
            tip={`Não há dados de exemplo para “${content.query}”. Tente São Paulo.`}
          />
        );
      case 'error':
        return <ErrorState message={content.message} onRetry={handleRetry} />;
      case 'success':
        return (
          <div className="space-y-8">
            {content.data.current ? (
              <CurrentWeather city={content.data.city} current={content.data.current} unit={unit} />
            ) : (
              <EmptyState
                title="Clima atual indisponível"
                tip="Os dados atuais desta cidade não estão disponíveis no momento."
              />
            )}
            <ForecastList forecast={content.data.forecast} unit={unit} />
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
            <SearchBar disabled={content.status === 'loading'} onSearch={handleSearch} />
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
