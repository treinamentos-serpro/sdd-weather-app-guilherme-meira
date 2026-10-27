# Discovery: Weather App

## Contexto

A empresa precisa de uma aplicação para consulta meteorológica. Usuários poderão buscar cidades, ver as condições atuais e a previsão de cinco dias, alternar entre Celsius e Fahrenheit e usar a aplicação em dispositivos móveis.

O briefing inicial não especificava o provedor de dados, a interpretação de “cinco dias”, a unidade inicial, o idioma da interface nem os requisitos de autenticação e persistência. As decisões já tomadas estão registradas ao final deste documento.

## Personas

Personas iniciais baseadas no briefing; objetivos, contextos e métricas são hipóteses a validar com usuários reais.

- **P-01 — Pessoa que planeja o deslocamento:** quer consultar rapidamente o tempo para organizar a rotina. Usa principalmente o celular antes de sair ou durante o trajeto. Considera sucesso encontrar a cidade e entender as condições relevantes em menos de 30 segundos.
- **P-02 — Pessoa que organiza atividades ao ar livre:** quer comparar os próximos dias para escolher quando realizar uma atividade. Usa celular ou desktop durante o planejamento. Considera sucesso encontrar informação suficiente para decidir o dia.
- **P-03 — Pessoa que consulta cidades em diferentes regiões:** quer encontrar a localidade correta e interpretar as temperaturas na unidade que prefere. Usa principalmente o celular e, ao planejar uma viagem, também pode usar desktop. Considera sucesso identificar a cidade e entender as temperaturas sem conversão mental.

## Requisitos Funcionais

- **RF-01 — Buscar cidades:** permitir que o usuário pesquise uma cidade pelo nome.
- **RF-02 — Selecionar cidade:** permitir que o usuário identifique e selecione a cidade desejada entre os resultados.
- **RF-03 — Consultar clima atual:** exibir as condições meteorológicas atuais da cidade selecionada.
- **RF-04 — Consultar previsão:** exibir a previsão para cinco dias, definida como hoje mais os quatro dias seguintes.
- **RF-05 — Alternar unidades:** permitir alternar entre Celsius e Fahrenheit para as temperaturas exibidas.
- **RF-06 — Usar em dispositivos móveis:** disponibilizar os fluxos de busca e consulta em telas móveis.

## Requisitos Não-Funcionais

- **RNF-01 — Responsividade:** a interface deve se adaptar a diferentes tamanhos de tela sem perda das funções principais.
- **RNF-02 — Usabilidade:** busca, seleção de cidade e alternância de unidade devem ser compreensíveis e operáveis em dispositivos móveis.
- **RNF-03 — Tratamento de falhas:** falhas de busca ou indisponibilidade dos dados devem ser comunicadas ao usuário, com orientação sobre como prosseguir.
- **RNF-04 — Acessibilidade:** controles e informações principais devem ser utilizáveis por tecnologias assistivas e navegação por teclado.

## Riscos

- Dados meteorológicos podem estar indisponíveis, atrasados ou incompletos.
- Cidades com nomes iguais podem gerar resultados ambíguos.
- Não definir os dados exibidos em cada previsão pode resultar em experiências inconsistentes.
- O comportamento em dispositivos móveis pode variar conforme tamanho de tela e qualidade da conexão.
- O idioma definido não esclarece, por si só, formatos de data, horários ou fuso horário.

## Perguntas em Aberto

- **Q-01:** Quem é o público-alvo e quais países ou regiões devem ser atendidos? **Impacto:** influencia cobertura geográfica, formatos locais e prioridades de experiência.
- **Q-02:** A busca aceita apenas o nome da cidade ou também país, estado, código postal e localização do dispositivo? Como distinguir cidades homônimas? **Impacto:** sem isso, a busca pode retornar resultados ambíguos ou insuficientes.
- **Q-03:** Quais informações devem compor o clima atual e cada dia da previsão? **Impacto:** a equipe pode entregar dados diferentes dos esperados.
- **Q-04:** A previsão deve apresentar somente resumo diário ou também dados por hora? **Impacto:** altera o conteúdo, a complexidade e os dados necessários.
- **Q-05:** Com que frequência os dados devem ser atualizados e qual idade máxima é aceitável? **Impacto:** dados desatualizados podem ser interpretados como atuais.
- **Q-06:** Como a aplicação deve se comportar quando não houver conexão ou o serviço de dados falhar? **Impacto:** usuários podem ficar sem informação ou sem saber como recuperar o acesso.
- **Q-07:** Preferências como unidade e última cidade podem ser salvas localmente no dispositivo? **Impacto:** a decisão de não persistir no servidor não define se haverá armazenamento local.
- **Q-08:** Qual padrão e nível de conformidade de acessibilidade devem ser adotados? **Impacto:** sem critérios verificáveis, a acessibilidade pode variar e ser difícil de validar.
- **Q-09:** Quais metas de desempenho, disponibilidade e navegadores suportados são esperadas? **Impacto:** não será possível definir critérios objetivos de aceite e operação.
- **Q-10:** Quais formatos de data e horário devem ser usados e qual fuso horário determina o dia da previsão? **Impacto:** datas e períodos podem ser apresentados incorretamente para a cidade consultada.

## Suposições

- A aplicação não exige autenticação.
- As consultas são feitas para uma cidade selecionada pelo usuário.
- A previsão é apresentada em períodos diários para hoje e os quatro dias seguintes.
- Alternar a unidade afeta todas as temperaturas exibidas.
- A unidade inicial é Celsius.
- A interface é apresentada em português do Brasil.
- A aplicação consulta diretamente uma fonte de dados meteorológicos externa.
- Os estados de carregamento, erro e resultado vazio serão tratados na experiência.

## Decisões

| Decisão | Justificativa | Perguntas que resolve |
|---|---|---|
| **Fonte de dados: Open-Meteo, sem API key.** | Evita exigir configuração ou distribuição de uma chave de API para realizar consultas meteorológicas. | Qual provedor será usado? É necessária uma chave de API? (Q-09 parcialmente: escolha do provedor; metas operacionais continuam em aberto.) |
| **“Cinco dias” significa hoje mais os quatro dias seguintes.** | Define um horizonte de previsão único e alinhado à consulta diária. | O que significa “previsão de cinco dias”? (Q-04 parcialmente: define o horizonte, mas não se a previsão terá dados horários.) |
| **Unidade padrão: Celsius.** | Define o valor inicial da interface, mantendo a opção de alternar para Fahrenheit. | Qual unidade deve ser usada inicialmente? |
| **Sem autenticação e sem persistência de servidor.** | Mantém o escopo sem contas de usuário e evita armazenar dados de usuário no servidor. | O usuário precisa de conta? Os dados serão persistidos no servidor? (Q-07 permanece em aberto para armazenamento local.) |
| **Idioma da interface: português do Brasil (pt-BR).** | Define o idioma padrão da experiência e das mensagens da interface. | Qual idioma a interface deve usar? (Q-10 permanece em aberto para formatos e fuso horário.) |
