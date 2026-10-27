# Weather App — Backlog de Tarefas

Backlog derivado de [plans/weather-app-plan.md](../plans/weather-app-plan.md), subordinado aos critérios de aceite de [specs/weather-app-spec.md](../specs/weather-app-spec.md). Os IDs seguem a ordem contratos/tipos → funções puras → services → hook → componentes → integração → testes → hardening. Dependências listam pré-requisitos diretos.

## Entrega 1 — Contratos e funções puras

### T-01
- **ID:** T-01
- **Título:** Fechar contrato de falha entre clima atual e previsão
- **Descrição:** Resolver como preservar o clima atual quando somente a previsão falhar, conforme AC-08.
- **Critérios de aceite:** Registrar no plano casos esperados para `current` disponível com `forecast` ausente, payload parcial válido, falha HTTP/rede e timeout; em todos, erro exclusivo da previsão não descarta clima atual já obtido; documentar se a solução usa resposta combinada parcial ou chamadas independentes e os estados expostos à UI.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `plans/weather-app-plan.md`.
- **Tipo:** Data

### T-02
- **ID:** T-02
- **Título:** Definir contratos TypeScript do domínio
- **Descrição:** Declarar `Unit`, `City`, `CurrentWeather`, `ForecastDay`, `WeatherData`, estados de busca/clima e motivo de erro.
- **Critérios de aceite:** Tipos compilam em modo strict; ausências são representadas por `null`; estados contemplam `idle`, `loading`, `success`, `empty` e `error`; busca em `success` exige ao menos uma cidade.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data

### T-03
- **ID:** T-03
- **Título:** Implementar conversão e formatação de temperaturas
- **Descrição:** Criar funções puras para conversão Celsius/Fahrenheit e formatação pt-BR.
- **Critérios de aceite:** Celsius é a unidade canônica; Fahrenheit usa $F = C × 9/5 + 32$; valores ausentes continuam indisponíveis; resultado usa uma casa decimal, vírgula e símbolo correto.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/lib/format.ts`.
- **Tipo:** Data

### T-04
- **ID:** T-04
- **Título:** Implementar datas locais e descrição WMO
- **Descrição:** Criar funções puras para datas da previsão e tradução dos códigos meteorológicos.
- **Critérios de aceite:** Produzir cinco datas consecutivas no fuso da cidade; apresentar `dd/MM` e dia da semana em pt-BR; cobrir virada de dia/mês/ano; código WMO desconhecido retorna condição indisponível.
- **Dependências:** T-02 e T-03.
- **Arquivos prováveis:** `src/lib/format.ts`.
- **Tipo:** Data

## Entrega 2 — Services Open-Meteo

### T-05
- **ID:** T-05
- **Título:** Implementar serviço de geocoding
- **Descrição:** Implementar `searchCities` e normalizar resultados para `City`.
- **Critérios de aceite:** Aparar apenas espaços externos e preservar Unicode/pontuação; enviar `count=5` e idioma pt quando suportado; preservar ordem e limitar a cinco resultados; mapear nome, país, admin1, coordenadas, timezone e ID; tratar ausência de resultados como lista vazia; classificar erro de rede/API/timeout; não repetir automaticamente.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/services/openMeteo.ts`.
- **Tipo:** Data

### T-06
- **ID:** T-06
- **Título:** Implementar serviço de forecast
- **Descrição:** Implementar `getWeather` conforme T-01 e normalizar a resposta para `WeatherData`.
- **Critérios de aceite:** Solicitar atuais e diários em Celsius, timezone automático e cinco dias; associar resposta à cidade selecionada; mapear arrays por índice; preservar dados parciais e ausências; suportar cancelamento/timeout conforme contrato.
- **Dependências:** T-01, T-02, T-03, T-04 e T-05.
- **Arquivos prováveis:** `src/services/openMeteo.ts`.
- **Tipo:** Data

## Entrega 3 — Hook e estado

### T-07
- **ID:** T-07
- **Título:** Implementar o hook de aplicação
- **Descrição:** Criar `useWeatherApp` para manter estado local e orquestrar serviços e ações da tela.
- **Critérios de aceite:** Iniciar sem cidade e em Celsius; expor estados discriminados; manter consulta em vazio/falha; limpar dados da seleção anterior; cancelar e ignorar respostas obsoletas; oferecer retry apenas manual; alternar unidade sem nova chamada ou mutação dos dados Celsius.
- **Dependências:** T-02, T-05 e T-06.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`.
- **Tipo:** UI

## Entrega 4 — Componentes de UI

### T-08
- **ID:** T-08
- **Título:** Implementar o componente de busca
- **Descrição:** Criar o campo controlado e o feedback da operação de busca, sem acesso a services.
- **Critérios de aceite:** Submissão por teclado e botão; loading, vazio e erro/retry são comunicados; consulta permanece no campo; campo vazio não envia request; roles/labels e foco são acessíveis.
- **Dependências:** T-02 e T-07.
- **Arquivos prováveis:** `src/components/CitySearch.tsx`.
- **Tipo:** UI

### T-09
- **ID:** T-09
- **Título:** Implementar resultado e seleção de cidade
- **Descrição:** Criar apresentação acessível das opções retornadas e seleção explícita.
- **Critérios de aceite:** Mostrar nome, país e região fornecidos; distinguir homônimos com coordenadas em duas casas quando o contexto textual for insuficiente; selecionar somente por ação do usuário; componente não faz chamadas HTTP.
- **Dependências:** T-02 e T-08.
- **Arquivos prováveis:** `src/components/CityResult.tsx`.
- **Tipo:** UI

### T-10
- **ID:** T-10
- **Título:** Implementar painel de clima atual
- **Descrição:** Criar a apresentação independente das condições atuais.
- **Critérios de aceite:** Identificar a cidade selecionada; exibir temperatura e descrição pt-BR; manter cada campo válido quando outro estiver indisponível; componente não acessa services.
- **Dependências:** T-02 e T-03.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`.
- **Tipo:** UI

### T-11
- **ID:** T-11
- **Título:** Implementar painel da previsão diária
- **Descrição:** Criar a apresentação independente dos cinco dias locais.
- **Critérios de aceite:** Exibir data, condição e mín./máx. por dia; representar campos/datas ausentes como indisponíveis; não ocultar o painel atual nem acessar services.
- **Dependências:** T-02 e T-04.
- **Arquivos prováveis:** `src/components/DailyForecast.tsx`.
- **Tipo:** UI

### T-12
- **ID:** T-12
- **Título:** Implementar controle de unidade
- **Descrição:** Criar controle acessível para alternar Celsius/Fahrenheit.
- **Critérios de aceite:** Expor unidade ativa por props/callback; funcionar por teclado; não converter dados, fazer requests nem persistir escolha.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/components/TemperatureUnit.tsx`.
- **Tipo:** UI

## Entrega 5 — Integração da aplicação

### T-13
- **ID:** T-13
- **Título:** Compor a tela e a atribuição da fonte
- **Descrição:** Conectar hook e componentes na tela principal e apresentar a atribuição Open-Meteo.
- **Critérios de aceite:** Compor estados e callbacks sem lógica de serviço nos componentes; atribuição visível inclui link para Open-Meteo; tela não usa autenticação, geolocalização ou persistência.
- **Dependências:** T-07 a T-12.
- **Arquivos prováveis:** `src/App.tsx`.
- **Tipo:** UI

### T-14
- **ID:** T-14
- **Título:** Aplicar estilo responsivo do projeto
- **Descrição:** Definir estilos globais e layout Tailwind seguindo o tema dark glassmorphism do repositório.
- **Critérios de aceite:** Nos viewports 320×640, 640×320, 768×1024, 1440×900 e 1920×1080, não há rolagem horizontal, sobreposição nem controle inacessível; textos longos quebram corretamente; foco permanece visível.
- **Dependências:** T-13.
- **Arquivos prováveis:** `src/index.css`.
- **Tipo:** UI

### T-15
- **ID:** T-15
- **Título:** Conectar a aplicação ao bootstrap Vite
- **Descrição:** Configurar o ponto de entrada React e o documento HTML para renderizar a tela.
- **Critérios de aceite:** `pnpm dev` monta `App` no ponto de entrada; HTML inclui metadados e root; `pnpm build` termina com sucesso; não é adicionada API key nem persistência.
- **Dependências:** T-13 e T-14.
- **Arquivos prováveis:** `src/main.tsx`, `index.html`.
- **Tipo:** UI

## Entrega 6 — Testes unitários, de componentes e E2E

### T-16
- **ID:** T-16
- **Título:** Testar conversão e formatação de temperatura
- **Descrição:** Adicionar testes unitários às funções de temperatura.
- **Critérios de aceite:** Asserções cobrem `0 °C → 32,0 °F`, `-40 °C → -40,0 °F`, conversão inversa, arredondamento, formatação pt-BR e valor indisponível.
- **Dependências:** T-03 e T-15.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`.
- **Tipo:** Test

### T-17
- **ID:** T-17
- **Título:** Testar datas locais e códigos meteorológicos
- **Descrição:** Adicionar testes unitários para calendário local e descrição de códigos WMO.
- **Critérios de aceite:** Asserções cobrem cinco datas, timezone, viradas de calendário, `dd/MM` e dia da semana pt-BR, códigos conhecidos/desconhecidos e ausência de dados.
- **Dependências:** T-04 e T-15.
- **Arquivos prováveis:** `tests/unit/format.test.ts`.
- **Tipo:** Test

### T-18
- **ID:** T-18
- **Título:** Testar serviço de geocoding
- **Descrição:** Testar a busca de cidades com `fetch` mockado.
- **Critérios de aceite:** Mockar `fetch` em todas as chamadas, sem rede real; asserções verificam URL/parâmetros, encoding, lista vazia, limite/ordem, mapeamento de campos ausentes, HTTP/rede, timeout, cancelamento e ausência de retry/cache próprio.
- **Dependências:** T-05 e T-15.
- **Arquivos prováveis:** `tests/unit/geocoding.test.ts`.
- **Tipo:** Test

### T-19
- **ID:** T-19
- **Título:** Testar serviço de forecast
- **Descrição:** Testar a consulta meteorológica com `fetch` mockado.
- **Critérios de aceite:** Mockar `fetch` em todas as chamadas, sem rede real; asserções verificam parâmetros `current`, `daily`, timezone e Celsius; mapeamento de arrays; payload parcial/inválido; HTTP/rede, timeout, cancelamento e `no-store`; comportamento de falha parcial definido em T-01.
- **Dependências:** T-06 e T-15.
- **Arquivos prováveis:** `tests/unit/forecast.test.ts`.
- **Tipo:** Test

### T-20
- **ID:** T-20
- **Título:** Testar estados e concorrência do hook
- **Descrição:** Testar `useWeatherApp` isoladamente com services mockados.
- **Critérios de aceite:** Asserções cobrem `idle/loading/success/empty/error`, retry, seleção, resposta parcial, conversão sem request e buscas A/B em que somente B atualiza os resultados.
- **Dependências:** T-07 e T-15.
- **Arquivos prováveis:** `tests/unit/useWeatherApp.test.ts`.
- **Tipo:** Test

### T-21
- **ID:** T-21
- **Título:** Testar busca e seleção de cidade
- **Descrição:** Testar isoladamente os componentes de busca e resultado com Testing Library.
- **Critérios de aceite:** Testing Library renderiza e verifica os estados `loading`, erro/retry, vazio sem resultados e sucesso com resultados; também verifica identificação de homônimos, seleção por teclado e ausência de fetch direto nos componentes.
- **Dependências:** T-08, T-09 e T-15.
- **Arquivos prováveis:** `tests/components/CitySearch.test.tsx`, `tests/components/CityResult.test.tsx`.
- **Tipo:** Test

### T-22
- **ID:** T-22
- **Título:** Testar painéis meteorológicos
- **Descrição:** Testar apresentação atual e previsão com dados fornecidos por props.
- **Critérios de aceite:** Testing Library renderiza e verifica os estados meteorológicos `loading`, erro, vazio e sucesso, incluindo resposta parcial; quando a previsão está indisponível, a seção atual válida continua visível; testes não dependem de rede.
- **Dependências:** T-10, T-11 e T-15.
- **Arquivos prováveis:** `tests/components/CurrentWeather.test.tsx`, `tests/components/DailyForecast.test.tsx`.
- **Tipo:** Test

### T-23
- **ID:** T-23
- **Título:** Testar controle de unidade
- **Descrição:** Testar seleção de unidade e interação por teclado.
- **Critérios de aceite:** Asserções verificam estado ativo e callback de Celsius/Fahrenheit; componente não dispara request nem persiste preferência.
- **Dependências:** T-12 e T-15.
- **Arquivos prováveis:** `tests/components/TemperatureUnit.test.tsx`.
- **Tipo:** Test

### T-24
- **ID:** T-24
- **Título:** Testar fluxo E2E de busca
- **Descrição:** Criar cenário Playwright para submissão, resultados e seleção explícita.
- **Critérios de aceite:** Testes cobrem consulta aparada, busca vazia, sem resultados, ordem/limite, seleção correta e concorrência A/B; APIs são interceptadas.
- **Dependências:** T-15, T-18, T-20 e T-21.
- **Arquivos prováveis:** `tests/e2e/search.spec.ts`.
- **Tipo:** Test

### T-25
- **ID:** T-25
- **Título:** Testar fluxo E2E principal em viewport mobile
- **Descrição:** Criar cenário Playwright da busca até a leitura do clima, alternância de unidade e retry, incluindo tamanhos mobile.
- **Critérios de aceite:** O teste percorre busca → seleção explícita → clima atual/previsão → alternância → retry; cobre resposta parcial e erro/timeout; executa em 320×640 e 640×320 sem rolagem horizontal ou controles inacessíveis; confirma que alternar unidade não envia novo request; relógio controlado e APIs interceptadas.
- **Dependências:** T-15, T-19, T-20, T-21, T-22, T-23 e T-24.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`.
- **Tipo:** Test

## Entrega 7 — Hardening e publicação

### T-26
- **ID:** T-26
- **Título:** Adicionar axe-core ao ambiente E2E
- **Descrição:** Instalar a integração axe para Playwright como dependência de desenvolvimento.
- **Critérios de aceite:** Dependência declarada e lockfile atualizado; instalação reproduzível por pnpm; nenhuma dependência de runtime adicionada.
- **Dependências:** T-15.
- **Arquivos prováveis:** `package.json`, `pnpm-lock.yaml`.
- **Tipo:** Infra

### T-27
- **ID:** T-27
- **Título:** Verificar acessibilidade automatizada
- **Descrição:** Executar axe-core nos estados visíveis da aplicação.
- **Critérios de aceite:** Executar axe na tela inicial (`idle`), busca (`loading`, `empty`, `success`, `error`), clima (`loading`, `empty`, `success` completo/parcial, `error`) e retry; cada varredura resulta em zero violações críticas/sérias; registrar exceções aprovadas.
- **Dependências:** T-24, T-25 e T-26.
- **Arquivos prováveis:** `tests/e2e/accessibility.spec.ts`.
- **Tipo:** Test

### T-28
- **ID:** T-28
- **Título:** Verificar navegadores e viewports suportados
- **Descrição:** Definir e executar a matriz Playwright para compatibilidade e responsividade.
- **Critérios de aceite:** Registrar versão e resultado das duas versões estáveis mais recentes de Chrome, Safari, Firefox e Edge em desktop/mobile; executar 320×640, 640×320, 768×1024, 1440×900 e 1920×1080; confirmar zero rolagem horizontal e controles inacessíveis.
- **Dependências:** T-24 e T-25.
- **Arquivos prováveis:** `playwright.config.ts`, `tests/e2e/responsive.spec.ts`.
- **Tipo:** Test

### T-29
- **ID:** T-29
- **Título:** Medir desempenho e timeout
- **Descrição:** Validar metas de rede e término visível em ambiente controlado.
- **Critérios de aceite:** Com RTT de 100 ms e banda de 10 Mbps, executar pelo menos 100 medições bem-sucedidas por operação e obter p95 ≤ 5 s; em cenários pendentes, toda operação termina em sucesso ou erro visível em até 10 s; registrar ambiente, amostras e resultados.
- **Dependências:** T-06, T-15, T-24 e T-25.
- **Arquivos prováveis:** `tests/e2e/performance.spec.ts`.
- **Tipo:** Test

### T-30
- **ID:** T-30
- **Título:** Definir hospedagem e plataforma de monitoramento
- **Descrição:** Selecionar com produto/operação a plataforma que executará o shell e as verificações sintéticas.
- **Critérios de aceite:** Registrar plataforma, responsável, cálculo mensal, intervalo de cinco minutos e critério de sucesso (shell carrega e permite alcançar a busca); atribuir responsável e status a OQ-01, OQ-02 e OQ-03.
- **Dependências:** T-15 e T-29; decisão externa de produto/operação.
- **Arquivos prováveis:** `plans/weather-app-plan.md`.
- **Tipo:** Infra

### T-31
- **ID:** T-31
- **Título:** Configurar verificação sintética do shell
- **Descrição:** Implementar o check periódico na plataforma aprovada em T-30.
- **Critérios de aceite:** Executar a cada cinco minutos; registrar sucesso somente se o shell carregar e a busca puder ser alcançada; calcular `execuções bem-sucedidas / execuções programadas × 100` por mês; atingir ≥ 99,5%; não contar falha isolada do provedor quando o erro aparece em até 10 s.
- **Dependências:** T-30.
- **Arquivos prováveis:** Configuração da plataforma aprovada ou `infra/monitoring/synthetic.*`.
- **Tipo:** Infra

### T-32
- **ID:** T-32
- **Título:** Registrar checklist de publicação
- **Descrição:** Consolidar evidências e condições de liberação do produto.
- **Critérios de aceite:** Checklist registra aprovações do baseline, termos/limites/atribuição Open-Meteo e regiões; inclui resultados funcionais, acessibilidade, compatibilidade, desempenho e disponibilidade; publicação permanece bloqueada enquanto requisito obrigatório estiver pendente.
- **Dependências:** T-27 a T-31 e aprovações externas OQ-01/OQ-02/OQ-03.
- **Arquivos prováveis:** `tasks/release-checklist.md`.
- **Tipo:** Infra

## Rastreabilidade para a spec

### Requisitos funcionais

As tarefas de implementação estão separadas das tarefas de validação. `T-01` é um pré-requisito decisório para que o tratamento de dados parciais de FR-07 satisfaça AC-08.

| Requisito | Tarefas de implementação | Tarefas de teste |
|---|---|---|
| FR-01 — Buscar cidade | T-05, T-07, T-08, T-13 | T-18, T-20, T-21, T-24 |
| FR-02 — Identificar e selecionar cidade | T-05, T-07, T-09, T-13 | T-18, T-20, T-21, T-24 |
| FR-03 — Consultar clima atual | T-03, T-04, T-06, T-07, T-10, T-13 | T-16, T-19, T-20, T-22, T-25 |
| FR-04 — Consultar previsão | T-04, T-06, T-07, T-11, T-13 | T-17, T-19, T-20, T-22, T-25 |
| FR-05 — Alternar unidade | T-03, T-07, T-12, T-13 | T-16, T-20, T-23, T-25 |
| FR-06 — Comunicar estados da consulta | T-05, T-06, T-07, T-08, T-10, T-11, T-13 | T-18, T-19, T-20, T-21, T-22, T-24, T-25 |
| FR-07 — Tratar dados parciais | T-01, T-06, T-07, T-10, T-11, T-13 | T-19, T-20, T-22, T-25 |
| FR-08 — Isolar consultas concorrentes | T-07, T-08, T-13 | T-20, T-24 |

Todos os requisitos funcionais têm tarefas de implementação; FR-07 não está pronto para implementação até a decisão T-01 ser fechada.

### Critérios de aceite e requisitos não funcionais

| Tarefa | Requisitos relacionados |
|---|---|
| T-01 | AC-08, FR-07 |
| T-02 | FR-01 a FR-08, AC-01 a AC-08 |
| T-03 | AC-06, RNF-02 |
| T-04 | AC-05, RNF-02 |
| T-05 | AC-01, AC-02, AC-03, AC-07, RNF-07 |
| T-06 | AC-04, AC-05, AC-08, AC-13 |
| T-07 | AC-06, AC-07, AC-08, AC-09, AC-14 |
| T-08 | AC-01, AC-02, AC-07, AC-11 |
| T-09 | AC-03, AC-11 |
| T-10 | AC-04, AC-08, RNF-02 |
| T-11 | AC-05, AC-08, RNF-02 |
| T-12 | AC-06, AC-14 |
| T-13 | AC-13, AC-14, AC-15, RNF-07, RNF-09 |
| T-14 | AC-10, AC-11, RNF-01, RNF-03 |
| T-15 | AC-16, RNF-05 |
| T-16 | AC-06, RNF-02 |
| T-17 | AC-05, RNF-02 |
| T-18 | AC-01, AC-02, AC-03, AC-07, RNF-07 |
| T-19 | AC-04, AC-05, AC-08, AC-13 |
| T-20 | AC-06, AC-07, AC-08, AC-09, AC-14 |
| T-21 | AC-01, AC-02, AC-03, AC-07, AC-11 |
| T-22 | AC-04, AC-05, AC-08, RNF-02 |
| T-23 | AC-06, AC-14 |
| T-24 | AC-01, AC-02, AC-03, AC-09 |
| T-25 | AC-04, AC-05, AC-06, AC-07, AC-08, AC-13, AC-14 |
| T-26 | AC-11 |
| T-27 | AC-11 |
| T-28 | AC-10, RNF-01, RNF-08 |
| T-29 | AC-12, RNF-04 |
| T-30 | AC-15, AC-16, RNF-05, RNF-09, OQ-01, OQ-02, OQ-03 |
| T-31 | AC-16, RNF-05 |
| T-32 | AC-15, AC-16, RNF-05, RNF-09, OQ-01, OQ-02, OQ-03 |

## Prioridade e tamanho

Prioridade indica ordem de valor/risco: **P0** desbloqueia a primeira experiência utilizável; **P1** completa cobertura funcional e qualidade da spec; **P2** é hardening/operação. P2 não significa opcional: requisitos de release continuam bloqueadores de publicação. Tamanho é relativo, não estimativa de calendário: **P** é localizado, **M** envolve um fluxo/casos relacionados e **G** tem complexidade de integração, concorrência ou operação.

| Tarefa | Prioridade | Tamanho |
|---|---|---|
| T-01 | P0 | P |
| T-02 | P0 | M |
| T-03 | P0 | M |
| T-04 | P0 | M |
| T-05 | P0 | M |
| T-06 | P0 | G |
| T-07 | P0 | G |
| T-08 | P0 | P |
| T-09 | P0 | P |
| T-10 | P0 | P |
| T-11 | P1 | M |
| T-12 | P1 | P |
| T-13 | P0 | G |
| T-14 | P1 | M |
| T-15 | P0 | P |
| T-16 | P1 | P |
| T-17 | P1 | P |
| T-18 | P1 | M |
| T-19 | P1 | M |
| T-20 | P1 | M |
| T-21 | P1 | M |
| T-22 | P1 | M |
| T-23 | P1 | P |
| T-24 | P0 | M |
| T-25 | P0 | G |
| T-26 | P1 | P |
| T-27 | P1 | M |
| T-28 | P2 | G |
| T-29 | P2 | G |
| T-30 | P2 | M |
| T-31 | P2 | G |
| T-32 | P2 | M |

## Sequência sugerida de fatias verticais

Para obter algo visível antes de completar todas as camadas, integrar e validar cada fatia antes de avançar. A lista abaixo preserva os IDs existentes, mas T-07 e T-13 estão hoje definidos como tarefas completas; para uma execução realmente incremental, dividi-las em etapas de busca e clima, mantendo o mesmo arquivo como provável alvo.

1. **Busca real e seleção visível:** T-01, T-02, T-05, etapa de busca de T-07, T-08, T-09, etapa inicial de T-13, T-14 e T-15. Entregar busca de cidade, lista ordenada e seleção explícita; validar com T-18, T-21 e T-24. Não esperar por forecast, alternância ou hardening para mostrar esta fatia.
2. **Clima atual:** T-03, T-04, T-06, etapa meteorológica de T-07, T-10 e atualização de T-13. Entregar temperatura e condição da cidade selecionada, com estados de erro/parcial; validar com T-16, T-17, T-19, T-20, T-22 e T-25.
3. **Previsão e unidades:** T-11, T-12 e atualização final de T-13. Entregar cinco dias locais e alternância Celsius/Fahrenheit sem nova consulta; validar com T-16, T-17, T-22, T-23 e T-25.
4. **Hardening para release:** T-26, T-27, T-28 e T-29; depois T-30 a T-32 para hospedagem, sintéticos e checklist. Estes gates não devem atrasar a primeira demonstração, mas permanecem necessários para a publicação conforme os critérios da spec.

**Ajuste de dependências recomendado:** permitir que a parte de busca de T-07 dependa de T-05 sem esperar T-06; permitir que T-13 componha primeiro busca/seleção e depois os painéis de clima. As dependências atuais T-07 → T-06 e T-13 → T-10/T-11/T-12 fazem o backlog voltar a um fluxo por camadas e atrasam a primeira fatia visível.
