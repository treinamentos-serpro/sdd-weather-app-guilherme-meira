# Weather App — Especificação de Produto

## Overview

O Weather App permite pesquisar uma cidade, selecionar um resultado e consultar suas condições atuais e a previsão diária de cinco dias. A interface é em português do Brasil (pt-BR), começa em Celsius e permite alternar para Fahrenheit. Open-Meteo é a fonte de geocodificação e meteorologia. Não há autenticação, geolocalização automática ou persistência local ou de servidor.

O usuário inicia sem cidade selecionada. “Cinco dias” significa a data atual da cidade consultada e as quatro datas locais seguintes, conforme o fuso horário retornado pela fonte. Os limites de qualidade desta versão são o baseline do produto; mudanças exigem aprovação do responsável pelo produto.

## Functional Requirements

- **FR-01 — Buscar cidade:** permitir busca submetida pelo usuário pelo nome da cidade. Remover espaços em branco no início e no fim; preservar acentos e pontuação; não enviar consultas vazias. Exibir no máximo os cinco primeiros resultados retornados pela fonte, na ordem recebida.
- **FR-02 — Identificar e selecionar cidade:** cada resultado deve mostrar nome da cidade, país e região administrativa quando fornecidos pela fonte. Se resultados homônimos não tiverem contexto textual suficiente, mostrar suas coordenadas com duas casas decimais. O usuário seleciona um resultado antes de consultar meteorologia. A cidade selecionada deve permanecer identificada enquanto seus dados são exibidos.
- **FR-03 — Consultar clima atual:** mostrar, para a cidade selecionada, temperatura atual e condição meteorológica, ambas em pt-BR. Temperatura é exibida em Celsius ou Fahrenheit conforme a unidade ativa.
- **FR-04 — Consultar previsão:** mostrar cinco entradas diárias para hoje e os quatro dias seguintes no fuso local da cidade. Cada entrada contém data, condição meteorológica e temperaturas mínima e máxima.
- **FR-05 — Alternar unidade de temperatura:** alternar todas as temperaturas atuais e da previsão entre Celsius e Fahrenheit sem alterar a cidade ou refazer a consulta. Exibir uma casa decimal e o símbolo da unidade. Cada carregamento completo da aplicação inicia em Celsius; a escolha não é persistida.
- **FR-06 — Comunicar estados da consulta:** informar carregamento, busca sem resultados, falha de busca, falha de dados meteorológicos e timeout. Falhas permitem retentativa manual da operação correspondente; não há retentativa automática.
- **FR-07 — Tratar dados parciais:** apresentar separadamente clima atual e previsão. A ausência de dados em uma seção não deve ocultar a outra; campos ausentes devem ser identificados como indisponíveis, nunca substituídos por valores inventados.
- **FR-08 — Isolar consultas concorrentes:** quando uma busca mais recente for submetida, resultados de buscas anteriores não podem substituir os resultados da busca mais recente.

## User Stories

- **US-01 (FR-01):** Como P-01, pessoa que planeja o deslocamento, quero buscar minha cidade pelo nome para consultar o tempo antes de sair.
- **US-02 (FR-02):** Como P-03, pessoa que consulta cidades em diferentes regiões, quero distinguir os resultados da busca para selecionar a localidade correta.
- **US-03 (FR-03):** Como P-01, pessoa que planeja o deslocamento, quero ver o clima atual da cidade selecionada para entender as condições antes de sair.
- **US-04 (FR-04):** Como P-02, pessoa que organiza atividades ao ar livre, quero consultar a previsão de hoje e dos quatro dias seguintes para escolher quando realizar uma atividade.
- **US-05 (FR-05):** Como P-03, pessoa que consulta cidades em diferentes regiões, quero alternar entre Celsius e Fahrenheit para entender as temperaturas sem conversão mental.
- **US-06 (FR-06):** Como P-01, pessoa que planeja o deslocamento, quero receber feedback durante a consulta e poder tentar novamente após uma falha para saber o que ocorreu e prosseguir.
- **US-07 (FR-07):** Como P-02, pessoa que organiza atividades ao ar livre, quero ver os dados disponíveis mesmo quando uma parte da previsão falha para ainda conseguir planejar com a informação válida.
- **US-08 (FR-08):** Como P-03, pessoa que consulta cidades em diferentes regiões, quero que a busca mais recente prevaleça para não receber dados da cidade errada.

## Acceptance Criteria

- **AC-01 (FR-01) — Busca válida:**
	- **Given** o usuário informa `  São Tomé  ` com espaços no início e no fim
	- **When** submete a busca
	- **Then** a aplicação envia a consulta sem os espaços externos, preserva acentos e pontuação, e exibe até cinco resultados na ordem recebida.
	- **Given** o usuário informa `O'Fallon` ou `Aix-en-Provence`
	- **When** submete a busca
	- **Then** apóstrofos e hífens são preservados na consulta enviada.
	- **Given** a fonte retorna seis ou mais resultados
	- **When** a lista é exibida
	- **Then** somente os cinco primeiros resultados da resposta são apresentados, na mesma ordem.
- **AC-02 (FR-01) — Busca vazia e sem correspondências:**
	- **Given** o campo está vazio ou contém apenas espaços
	- **When** o usuário submete a busca
	- **Then** nenhuma solicitação é enviada e a interface solicita o nome de uma cidade.
	- **Given** a fonte conclui a busca sem resultados
	- **When** a resposta é exibida
	- **Then** a interface informa “Nenhuma cidade encontrada”, mantém a consulta no campo e não seleciona uma cidade.

- **AC-03 (FR-02) — Resultado e seleção:**
	- **Given** a fonte retorna cidades homônimas com país ou região administrativa distintos
	- **When** os resultados são exibidos
	- **Then** cada resultado mostra o nome e os campos de país e região fornecidos pela fonte, permitindo selecionar cada opção separadamente.
	- **Given** resultados homônimos não têm país ou região suficientes para distingui-los
	- **When** os resultados são exibidos
	- **Then** cada opção mostra latitude e longitude arredondadas para duas casas decimais.
	- **Given** há resultados visíveis
	- **When** o usuário seleciona um resultado
	- **Then** somente essa cidade fica selecionada e a identificação exibida corresponde ao resultado escolhido.
- **AC-04 (FR-03) — Condições atuais:**
	- **Given** há uma cidade selecionada e a resposta contém temperatura e código de condição válidos
	- **When** a consulta termina
	- **Then** a interface exibe a cidade, a temperatura na unidade ativa e a descrição da condição em pt-BR.
- **AC-05 (FR-04) — Cinco dias locais:**
	- **Given** o relógio de teste está fixado e a fonte retorna dados para a cidade no fuso informado
	- **When** a previsão é exibida
	- **Then** há exatamente cinco entradas, uma para cada data local de hoje até hoje + 4, em ordem, cada qual com condição e temperaturas mínima e máxima.
- **AC-06 (FR-05) — Conversão de unidade:**
	- **Given** temperaturas meteorológicas foram carregadas em Celsius
	- **When** o usuário seleciona Fahrenheit
	- **Then** todas as temperaturas atuais e diárias são convertidas, formatadas com uma casa decimal e identificadas com `°F`; 0 °C resulta em 32,0 °F e -40 °C resulta em -40,0 °F.
	- **Given** a unidade ativa é Fahrenheit
	- **When** o usuário seleciona Celsius
	- **Then** todas as temperaturas voltam para Celsius, sem nova consulta e sem alterar cidade ou datas.
	- **Given** a aplicação é carregada sem estado de unidade anterior
	- **When** a primeira temperatura é apresentada
	- **Then** a unidade ativa é Celsius.
- **AC-07 (FR-06) — Carregamento, falha e retentativa:**
	- **Given** uma busca ou consulta meteorológica foi iniciada e não terminou
	- **When** a resposta ainda está pendente
	- **Then** a operação correspondente exibe estado de carregamento.
	- **Given** a busca por cidade falha ou excede 10 segundos
	- **When** a falha é detectada
	- **Then** a interface informa que não foi possível buscar cidades, mantém o texto consultado e oferece “Tentar novamente”.
	- **Given** a consulta meteorológica falha ou excede 10 segundos
	- **When** a falha é detectada
	- **Then** a interface informa que não foi possível carregar os dados da cidade selecionada e oferece “Tentar novamente”, sem mostrar dados de outra cidade.
	- **Given** uma mensagem de falha oferece nova tentativa
	- **When** o usuário a aciona
	- **Then** a mesma operação é enviada novamente; nenhuma retentativa automática é feita.
- **AC-08 (FR-07) — Resposta parcial:**
	- **Given** a resposta atual contém temperatura, mas não condição meteorológica
	- **When** os dados são exibidos
	- **Then** a temperatura é apresentada e a condição é identificada como indisponível.
	- **Given** dados atuais estão disponíveis, mas a previsão falhou ou está ausente
	- **When** a tela é apresentada
	- **Then** o clima atual permanece visível e somente a seção de previsão informa indisponibilidade.
	- **Given** a previsão contém dados para menos de cinco datas
	- **When** a previsão é apresentada
	- **Then** cada data disponível é exibida e as datas ausentes são identificadas como indisponíveis; nenhum valor é interpolado ou inventado.
- **AC-09 (FR-08) — Buscas concorrentes:**
	- **Given** a busca A foi enviada e ainda está pendente
	- **When** o usuário envia a busca B e B termina antes de A
	- **Then** os resultados de B permanecem visíveis e a resposta tardia de A não substitui nem altera esses resultados.
- **AC-10 (RNF-01/RNF-02):**
	- **Given** a aplicação é aberta em viewports de 320 × 640 px, 640 × 320 px, 768 × 1024 px, 1440 × 900 px ou 1920 × 1080 px
	- **When** os fluxos de busca, seleção, leitura e alternância são executados
	- **Then** nenhum controle fica sobreposto ou inacessível e não há rolagem horizontal.
	- **Given** qualquer estado visível da aplicação
	- **When** o conteúdo é renderizado
	- **Then** textos, mensagens e condições meteorológicas estão em pt-BR, e datas usam `dd/MM` com dia da semana em português.
- **AC-11 (RNF-03):** Em cada tela e estado, uma varredura automatizada axe-core não encontra violações WCAG 2.2 AA de severidade crítica ou séria. Em verificação manual, todos os controles são alcançáveis e acionáveis por teclado, o foco permanece visível e mensagens de carregamento, erro e resultado são anunciadas por leitor de tela.
- **AC-12 (RNF-04):** Em testes com RTT de 100 ms e largura de banda de 10 Mbps, 95% das buscas e consultas bem-sucedidas terminam em até 5 segundos desde a submissão; qualquer operação pendente termina em sucesso ou erro visível em até 10 segundos.
- **AC-13 (RNF-05):** Após selecionar ou tentar novamente uma cidade, a aplicação inicia uma nova consulta ao provedor e não reutiliza dados meteorológicos guardados pela própria aplicação.
- **AC-14 (RNF-06):** Em cada carregamento completo, a unidade inicial é Celsius; após recarregar ou abrir uma nova sessão, a cidade anterior e a unidade escolhida não são restauradas.
- **AC-15 (RNF-07):** A integração de produção consulta Open-Meteo sem credencial de API e mostra atribuição visível com link para a fonte.
- **AC-16 (RNF-05):** Em cada período mensal, a disponibilidade do shell é calculada como verificações sintéticas bem-sucedidas divididas pelas verificações programadas, executadas a cada 5 minutos. Uma verificação é bem-sucedida quando a interface carrega e permite alcançar o campo de busca; a meta é ≥ 99,5%. Falha isolada do provedor não conta como falha do shell se o estado de erro é exibido em até 10 s.

## Traceability Matrix

| User Story | Acceptance Criteria | Non-Functional Requirements |
|---|---|---|
| **US-01 — Buscar cidade** | AC-01, AC-02, AC-10, AC-11, AC-12 | RNF-01, RNF-02, RNF-03, RNF-04, RNF-07, RNF-08, RNF-09 |
| **US-02 — Distinguir e selecionar cidade** | AC-03, AC-10, AC-11, AC-12 | RNF-01, RNF-02, RNF-03, RNF-04, RNF-08, RNF-09 |
| **US-03 — Consultar clima atual** | AC-04, AC-06, AC-07, AC-08, AC-10, AC-11, AC-12, AC-13, AC-15 | RNF-01, RNF-02, RNF-03, RNF-04, RNF-05, RNF-06, RNF-08, RNF-09 |
| **US-04 — Consultar previsão de cinco dias** | AC-05, AC-07, AC-08, AC-10, AC-11, AC-12, AC-13, AC-15 | RNF-01, RNF-02, RNF-03, RNF-04, RNF-05, RNF-06, RNF-08, RNF-09 |
| **US-05 — Alternar unidade** | AC-06, AC-10, AC-11, AC-14 | RNF-01, RNF-02, RNF-03, RNF-06, RNF-08 |
| **US-06 — Receber feedback e tentar novamente** | AC-02, AC-07, AC-10, AC-11, AC-12, AC-16 | RNF-01, RNF-02, RNF-03, RNF-04, RNF-05, RNF-08, RNF-09 |
| **US-07 — Consultar dados parciais** | AC-08, AC-10, AC-11, AC-12, AC-13, AC-15, AC-16 | RNF-01, RNF-02, RNF-03, RNF-04, RNF-05, RNF-06, RNF-08, RNF-09 |
| **US-08 — Priorizar busca mais recente** | AC-01, AC-02, AC-09, AC-10, AC-11, AC-12 | RNF-01, RNF-02, RNF-03, RNF-04, RNF-07, RNF-08, RNF-09 |

## Non-Functional Requirements

- **RNF-01 — Responsividade:** suportar larguras de viewport de 320 px a 1920 px, em orientação retrato e paisagem, sem perda de função, sobreposição ou rolagem horizontal.
- **RNF-02 — Localização:** toda a interface, mensagens de erro, condições meteorológicas e datas usam pt-BR; temperaturas usam vírgula decimal e `°C`/`°F`; datas usam `dd/MM` e dia da semana em português.
- **RNF-03 — Acessibilidade:** conformidade WCAG 2.2 nível AA, incluindo operação completa por teclado, foco visível, nomes acessíveis e contraste conforme o padrão.
- **RNF-04 — Desempenho:** sob RTT de 100 ms e banda de 10 Mbps, p95 de busca e consulta bem-sucedidas deve ser ≤ 5 s; uma operação sem resposta deve encerrar em até 10 s com estado visível.
- **RNF-05 — Disponibilidade:** disponibilidade mensal do shell da aplicação ≥ 99,5%, medida por verificações sintéticas a cada 5 minutos. Falhas do Open-Meteo não contam como indisponibilidade do shell se o estado de erro previsto for exibido em até 10 s.
- **RNF-06 — Atualidade e persistência:** ao selecionar uma cidade ou tentar novamente, solicitar dados ao provedor; não manter cache meteorológico próprio nem persistir cidade, buscas ou unidade no cliente ou servidor.
- **RNF-07 — Privacidade:** não solicitar geolocalização, criar conta ou coletar identificadores pessoais. O nome da cidade pesquisada é enviado ao Open-Meteo para geocodificação.
- **RNF-08 — Compatibilidade:** suportar as duas versões estáveis mais recentes de Chrome, Safari, Firefox e Edge, em desktop e mobile.
- **RNF-09 — Fonte de dados:** usar Open-Meteo sem API key e exibir atribuição visível à fonte. A publicação depende de validação dos termos, limites de uso e cobertura aplicáveis.

## Edge Cases

- **Input vazio ou espaços:** não enviar a consulta; manter o campo ativo e solicitar um nome de cidade.
- **Cidade inexistente/geocoding sem resultados:** mostrar “Nenhuma cidade encontrada”, manter a consulta e não solicitar dados meteorológicos.
- **Acentos e pontuação:** preservar caracteres Unicode no texto de busca e no nome exibido; não rejeitar nomes por conterem acento, apóstrofo ou hífen.
- **Cidades homônimas:** exibir país e região quando disponíveis; não selecionar automaticamente um resultado.
- **Falha/timeout da geocodificação:** após 10 s ou erro do provedor, mostrar erro de busca e ação de retentativa; distinguir esse caso de zero resultados.
- **Falha/timeout meteorológico:** após 10 s ou erro do provedor, manter a identidade da cidade selecionada, indicar indisponibilidade e permitir retentativa; não mostrar dados da consulta anterior.
- **Resposta parcial:** manter a seção com dados válidos; identificar campos ou seções ausentes como indisponíveis e não sintetizar valores.
- **Resposta tardia de busca anterior:** ignorar resposta de busca substituída por uma consulta mais recente.
- **Virada de data local:** calcular o conjunto de cinco datas usando o fuso da cidade, inclusive quando a data UTC já for a seguinte ou anterior.
- **Alternância durante carregamento:** manter a unidade escolhida pelo usuário e renderizar respostas subsequentes nessa unidade.
- **Viewport estreito/texto longo:** permitir quebra de texto sem sobreposição ou rolagem horizontal nos viewports suportados.

## Assumptions

- Open-Meteo retorna resultados geográficos com cidade e país; região administrativa e fuso podem não estar disponíveis em todos os resultados.
- A fonte fornece condição meteorológica codificada, temperatura atual e valores diários mínimo/máximo para as cidades retornadas.
- Os requisitos numéricos de desempenho, disponibilidade, timeout, viewport e compatibilidade são o baseline proposto nesta especificação e precisam de aprovação do responsável pelo produto.
- A disponibilidade do provedor externo não pode ser garantida pelo Weather App; a interface deve sempre terminar em dados ou erro visível.
- Não há persistência entre carregamentos, inclusive para unidade e cidade.

## Risks

- **Dependência externa:** indisponibilidade, limites, cobertura ou alteração dos termos do Open-Meteo pode impedir a consulta; mitigar com estado de erro, retentativa manual e validação pré-lançamento.
- **Cobertura e ambiguidade geográfica:** cidade ausente ou homônima pode impedir seleção correta; mitigar exibindo contexto geográfico retornado e nunca selecionando automaticamente.
- **Atualidade dos dados:** a fonte controla a atualização meteorológica; não apresentar dados locais antigos como atuais e não reutilizar resposta de outra cidade.
- **Metas operacionais propostas:** os limites de desempenho e disponibilidade podem não refletir capacidade/orçamento; aprovar o baseline antes do release.
- **Dados parciais:** a fonte pode omitir campos; tratar seção e campo separadamente para evitar falha total ou valores inventados.

## Out of Scope

Não fazem parte desta versão:

- Contas, autenticação e persistência de dados ou preferências no cliente/servidor.
- Previsão horária, alertas, mapas, qualidade do ar, histórico climático e comparação de várias cidades.
- Geolocalização automática, favoritos e histórico de buscas.
- Idiomas além de pt-BR.

## Open Questions

- **OQ-01 — Aprovação do baseline:** o responsável pelo produto aprova as metas de 5 s/10 s, disponibilidade mensal de 99,5%, viewports e navegadores definidos? A aprovação é necessária antes do release.
- **OQ-02 — Validação do Open-Meteo:** termos, atribuição, limites e cobertura da fonte foram confirmados para o uso e regiões pretendidos? A confirmação é necessária antes da publicação.
- **OQ-03 — Regiões de lançamento:** quais países ou regiões são prioritários? Até a decisão, a busca está especificada para cidades retornadas pelo Open-Meteo, sem garantia de cobertura de mercado.
