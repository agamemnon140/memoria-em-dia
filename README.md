# Memória em dia

App web em português, preparado para a Tela de Início do iPhone e uso offline após a primeira abertura. Sem dependências, contas, analytics ou envio de resultados ao servidor.

**Este é um protocolo experimental de acompanhamento pessoal, não um teste clínico padronizado ou validado. Não identifica declínio cognitivo e não substitui avaliação profissional.** Execução uniforme não significa validade psicométrica. Um resultado bom não exclui problemas de memória.

## Executar

Instale Node.js e execute:

```sh
npm start
```

Abra http://localhost:43187. Para verificar a lógica de pontuação e os backups:

```sh
npm test
```

## Protocolo 2.0 — novas sessões

O app inicia novas sessões no protocolo 2.0. O histórico do protocolo 1.0 é preservado em uma tabela separada, com pontuação de 0 a 8. Não se devem comparar diretamente as notas dos dois protocolos.

1. Contexto e seis sequências de dígitos, com os mesmos tempos do protocolo anterior.
2. **12 palavras**, apresentadas uma vez, por 2 segundos cada, com intervalo de 250 ms. O horário ao terminar a apresentação (`encodedAt`) é a referência para o retorno de sete dias.
3. Evocação imediata por 60 segundos.
4. **300 segundos de distração visual:** dois quadros de nove símbolos, com exatamente uma diferença. Toque na posição diferente do quadro direito. Cada resposta gera um quadro novo. Quantidade respondida, acertos e erros ficam separados da memória. Esta é uma adaptação própria com símbolos; não é uma reprodução validada do jogo com imagens usado nos estudos.
5. Evocação após a distração por 60 segundos.
6. **Retorno a partir de sete dias completos (168 horas)** desde `encodedAt`, com evocação livre por 60 segundos e sem nova apresentação das palavras. O app mostra a data e a hora na tela inicial. Não envia notificações; o usuário precisa retornar pelo próprio lembrete. Atrasos são permitidos e o intervalo real é salvo em segundos e exibido em dias.

O gabarito e os textos digitados ficam bloqueados na interface até o encerramento da revisão tardia. O retorno pergunta se houve consulta, anotações/fotos ou ensaio das palavras, além de observações livres. Os resultados de memória imediata, após distração e após dias são apresentados separadamente, sem limite clínico de normalidade.

Há um ciclo pendente por vez. As oito listas novas têm 12 palavras próprias cada, sem sobreposição entre elas ou com as listas antigas. Uma lista pendente não pode ser reutilizada; gabaritos de usos anteriores da mesma lista também ficam bloqueados durante a pendência. Listas são reutilizadas após a rotação e podem ficar familiares; não foram calibradas por dificuldade.

O início da revisão tardia é persistido **antes** de mostrar o campo de resposta. Cancelar, ocultar a página ou fechar o navegador após esse início encerra definitivamente a tentativa como interrompida, sem nota. Uma recarga ou importação de backup com tentativa iniciada também a marca como interrompida. O gabarito é então liberado, e essa tentativa não entra como pontuação zero. Essa escolha evita tratar uma repetição da tentativa como primeira recuperação. A sessão inicial incompleta continua sendo descartada.

As datas dependem do relógio do aparelho. O bloqueio do gabarito é um fluxo da interface, não criptografia: backups contêm respostas, e o código contém as listas. Não consulte esses materiais durante o intervalo. A aplicação local não impede consulta externa ou restauração manual de um estado antigo em outro aparelho.

### Fundamentação e limites do novo protocolo

- [Dewar et al. (2014)](https://pmc.ncbi.nlm.nih.gov/articles/PMC4198139/) utilizaram tarefa visual de encontrar diferenças e avaliação após sete dias. Nossa tarefa e nossos tempos não reproduzem integralmente o estudo.
- [Mary et al. (2013)](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2013.00750/full) estudaram lembrança imediata, após 30 minutos e após sete dias.
- [Baddeley et al. (2021)](https://pubmed.ncbi.nlm.nih.gov/34284177/) discutem como testes anteriores influenciam medidas posteriores de esquecimento.
- [HVLT-R](https://www.parinc.com/products/HVLT-R) é um exemplo de instrumento estabelecido com 12 palavras. Não usamos suas listas, normas ou nome como identificação do nosso teste.

Nosso protocolo é experimental. Tempos, materiais, uma única apresentação e a avaliação autoadministrada limitam a interpretação. Saber antecipadamente do retorno e tentar recuperar as palavras nas etapas iniciais também pode influenciar a retenção de sete dias. Não fornece diagnóstico de esquecimento acelerado ou declínio cognitivo.

## Protocolo 1.0 — histórico preservado

1. Registrar horas de sono, estresse e observações.
2. Seis sequências visuais de dígitos: duas de comprimento 3, duas de 4 e duas de 5. Preparação de 1 segundo; cada dígito aparece por 1 segundo, seguido de intervalo de 250 ms. Até 15 segundos para responder. Um ponto por sequência inteira correta, de 0 a 6.
3. Oito palavras visuais, uma apresentação de 2 segundos por palavra, com intervalo de 250 ms. Há 3 segundos de preparação.
4. Evocação imediata livre por 60 segundos, sem encerramento antecipado.
5. Intervalo de 300 segundos **a partir do fim da evocação imediata**, com contas de adição. Respostas enviadas e acertos são registrados separadamente da memória. Entradas vazias ou não inteiras não contam; a conta ainda não enviada no encerramento também não conta. Durante a etapa, aparece apenas o total respondido; acertos e erros aparecem ao final.
6. Evocação tardia por 60 segundos. O intervalo desde o fim da apresentação das palavras é de aproximadamente 6 minutos. “Após cinco minutos” na interface se refere ao intervalo de distração.

Evocações recebem de 0 a 8 pontos por correspondência de palavras inteiras, sem considerar ordem, caixa ou acentos. Duplicatas não pontuam novamente. Erros de digitação e sinônimos não são aceitos. Digitação, leitura, atenção e habilidade com o aparelho podem influenciar os resultados. Não há nota total, corte clínico, norma por idade nem alerta automatizado de piora.

O app alterna oito listas próprias por sessão concluída. A primeira lista é aleatória. As listas não foram calibradas quanto à dificuldade e a alternância não elimina o efeito de prática. A periodicidade semanal é uma convenção de uso, não uma recomendação clínica validada. O protocolo mede desempenho imediato e após minutos, não retenção de dias ou semanas.

Após a sessão completa, o gabarito mostra as oito palavras e quais foram lembradas ou ficaram ausentes em cada evocação, com opção de consultar o texto digitado. O histórico oferece **Ver palavras**. Sessões antigas permitem recuperar a lista, mas não a palavra ausente ou as contas, pois esses detalhes não eram registrados. Os novos campos opcionais `answers` e `math` mantêm compatibilidade com backups antigos; o protocolo de apresentação e os tempos continuam em 1.0. A exposição ao gabarito pode aumentar a familiarização com as listas em sessões futuras.

Ao ocultar a página, sair do app ou detectar atraso de execução superior a 2 segundos, a sessão é cancelada e não pontua. Sessões incompletas não são salvas. Cancelar não desfaz a familiarização com os estímulos. Este controle não detecta toda distração ou uso de ajuda.

## Histórico e backup

Dados ficam no `localStorage` do navegador, sem criptografia própria. Não são gravados no Git nem sincronizados pelo iCloud. Limpeza dos dados do site pode apagá-los. Safari e app instalado podem ter armazenamentos separados: use sempre o mesmo modo e faça backup.

Use **Exportar backup** e salve o JSON no app Arquivos. **Restaurar backup** aceita registros 1.0, 2.0 ou mistos. Combina sessões por ID, preservando o estágio mais avançado de revisão, para não substituir uma revisão concluída por um backup pendente. Colisões com dados iniciais diferentes são rejeitadas. Não publique seus backups no repositório.

## Git e publicação

O repositório Git local é independente de hospedagem. Para criar um repositório remoto privado quando a autenticação do GitHub estiver funcionando:

```sh
gh auth login -h github.com
gh repo create memoria-em-dia --private --source=. --remote=origin --push
```

Publique os arquivos estáticos em hospedagem HTTPS com suporte a arquivos estáticos. Não há build. O servidor `server.mjs` é apenas para desenvolvimento. Arquivos para publicar: `index.html`, `app.js`, `core.js`, `style.css`, `sw.js`, `manifest.webmanifest`, `icon.svg` e os três `icon-*.png`. A publicação do site é separada da privacidade do repositório; os resultados continuam locais, mas o endereço do app pode ser público.

No iPhone, abra o endereço HTTPS no Safari → Compartilhar → Adicionar à Tela de Início → Adicionar. Abra o app instalado com internet uma vez e depois verifique o funcionamento no modo avião. O cache offline utiliza service worker. Ao publicar uma atualização, altere `CACHE` em `sw.js`; uma versão nova entra após fechar as janelas da versão antiga. Mudanças no protocolo exigem também versionamento dos resultados e uma estratégia de migração.

## Referências e limites

- [NIA: avaliação de comprometimento cognitivo](https://www.nia.nih.gov/health/health-care-professionals-information/assessing-cognitive-impairment-older-patients).
- [NICE: recomendações sobre avaliação de demência](https://www.nice.org.uk/guidance/ng97/chapter/Recommendations).
- [Apple: adicionar um site à Tela de Início](https://support.apple.com/en-ie/guide/iphone/iphea86e5236/ios).

Estas referências fundamentam os limites de interpretação e a instalação; não validam as tarefas deste app. Se a preocupação persistir ou houver impacto no dia a dia, procure avaliação profissional e leve seu histórico.

Verificações automatizadas: pontuação, geração de diferenças visuais, alternância sem reutilizar listas pendentes, validação e combinação de backups, bloqueio/liberação da revisão e execução do ciclo com DOM e relógio simulados, incluindo recarga e interrupção. Esses testes não substituem a verificação visual e a instalação no Safari de um iPhone real.

