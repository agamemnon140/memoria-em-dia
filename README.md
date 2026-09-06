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

## Protocolo 1.0

1. Registrar horas de sono, estresse e observações.
2. Seis sequências visuais de dígitos: duas de comprimento 3, duas de 4 e duas de 5. Preparação de 1 segundo; cada dígito aparece por 1 segundo, seguido de intervalo de 250 ms. Até 15 segundos para responder. Um ponto por sequência inteira correta, de 0 a 6.
3. Oito palavras visuais, uma apresentação de 2 segundos por palavra, com intervalo de 250 ms. Há 3 segundos de preparação.
4. Evocação imediata livre por 60 segundos, sem encerramento antecipado.
5. Intervalo de 300 segundos **a partir do fim da evocação imediata**, com contas de adição. A tarefa de distração não recebe nota; sua adesão não é verificada automaticamente.
6. Evocação tardia por 60 segundos. O intervalo desde o fim da apresentação das palavras é de aproximadamente 6 minutos. “Após cinco minutos” na interface se refere ao intervalo de distração.

Evocações recebem de 0 a 8 pontos por correspondência de palavras inteiras, sem considerar ordem, caixa ou acentos. Duplicatas não pontuam novamente. Erros de digitação e sinônimos não são aceitos. Digitação, leitura, atenção e habilidade com o aparelho podem influenciar os resultados. Não há nota total, corte clínico, norma por idade nem alerta automatizado de piora.

O app alterna oito listas próprias por sessão concluída. A primeira lista é aleatória. As listas não foram calibradas quanto à dificuldade e a alternância não elimina o efeito de prática. A periodicidade semanal é uma convenção de uso, não uma recomendação clínica validada. O protocolo mede desempenho imediato e após minutos, não retenção de dias ou semanas.

Ao ocultar a página, sair do app ou detectar atraso de execução superior a 2 segundos, a sessão é cancelada e não pontua. Sessões incompletas não são salvas. Cancelar não desfaz a familiarização com os estímulos. Este controle não detecta toda distração ou uso de ajuda.

## Histórico e backup

Dados ficam no `localStorage` do navegador, sem criptografia própria. Não são gravados no Git nem sincronizados pelo iCloud. Limpeza dos dados do site pode apagá-los. Safari e app instalado podem ter armazenamentos separados: use sempre o mesmo modo e faça backup.

Use **Exportar backup** e salve o JSON no app Arquivos. **Restaurar backup** combina sessões por ID, preservando a sessão local em caso de colisão. Apenas arquivos do protocolo 1.0 são aceitos. Não publique seus backups no repositório.

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

Verificações automatizadas: pontuação, alternância de listas, validação de backups e sintaxe JavaScript. A instalação em iPhone real e a execução completa no Safari precisam de verificação no aparelho.

