# hacker-animation

Uma animacao de terminal no estilo "hacker de Hollywood": comandos falsos, logs, blocos hexadecimais, progresso, carregamento de arquivos, pausas dramaticas, erros simulados e cores. E apenas uma simulacao visual; nenhum comando real do sistema e executado.

## Instalar localmente

```bash
npm link
```

Depois disso, rode:

```bash
hacker-animation
```

Por padrao, o comando pergunta a cor e continua rodando ate `Ctrl+C`.

## Exemplos

```bash
hacker-animation --color cyan --speed fast
hacker-animation --color random --density high
hacker-animation --color purple --duration 10
hacker-animation --color green --speed slow --density low
hacker-animation --theme cyber --color cyan --speed fast
```

## Temas

### Hollywood

O tema padrao imprime um fluxo de comandos falsos, logs, blocos hexadecimais, carregamentos e falhas simuladas.

### Cyber

O tema `cyber` renderiza uma tela fixa inspirada em paineis de monitoramento tipo `btop`, com caixas separadas para modulos, graficos de telemetria, rede, fila de carregamento e log ao vivo:

```bash
hacker-animation --theme cyber
```

Durante a animacao, o fluxo alterna entre logs rapidos e pequenas operacoes de carga simulada:

- `[LOAD]` abre um lote falso de arquivos.
- `[WAIT]` cria uma pausa curta de carregamento, atualizando a mesma linha.
- `[FILE]` mostra progresso por arquivo, redesenhando a barra na mesma linha ate concluir.
- `[OK]` marca arquivos carregados.
- `[ERR]` e `[RETRY]` simulam falhas recuperaveis.
- `[DONE]` conclui o lote e volta ao fluxo normal.

## Opcoes

| Opcao | Valores | Padrao |
| --- | --- | --- |
| `--color` | `green`, `cyan`, `blue`, `red`, `purple`, `yellow`, `white`, `random` | pergunta no terminal |
| `--speed` | `slow`, `normal`, `fast` | `normal` |
| `--duration` | numero de segundos maior que zero | roda ate `Ctrl+C` |
| `--density` | `low`, `normal`, `high` | `normal` |
| `--theme` | `hollywood`, `cyber` | `hollywood` |
| `--help` | mostra ajuda | - |
| `--version` | mostra versao | - |

Em ambientes sem terminal interativo, quando `--color` nao for informado, a cor padrao e `green`.

## Desenvolvimento

```bash
npm test
node bin/hacker-animation.js --color cyan --duration 3
```

## Seguranca

Este projeto nao executa comandos reais. A animacao e feita com texto, temporizadores e codigos ANSI de terminal. O conteudo exibido imita comandos e logs, mas nao chama shell, processos externos ou ferramentas do sistema.
