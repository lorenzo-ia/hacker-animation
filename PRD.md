# PRD: Tema Painel cyber

Status: implementado no CLI como `hacker-animation --theme cyber`.

## Resumo

Criar uma variante visual para o `hacker-animation` com aparencia de painel cyber: mais organizada, densa e com secoes fixas de status, em vez do fluxo continuo de comandos do tema Hollywood.

## Objetivo

Permitir que o usuario rode:

```bash
hacker-animation --theme cyber
```

e veja um HUD de terminal com modulos, medidores, telemetria, mapas de rede simulados e alertas visuais. Tudo deve continuar sendo apenas simulacao visual, sem executar comandos reais.

## Experiencia esperada

- Layout de tela cheia com areas fixas: cabecalho, status de modulos, grafo/lista de rede, telemetria e log curto.
- Atualizacoes em tempo real sem rolar a tela continuamente.
- Uso das mesmas flags globais do tema Hollywood: `--color`, `--speed`, `--duration` e `--density`.
- Cores aplicadas ao painel inteiro, com destaque para alertas e progresso.
- Encerramento limpo com `Ctrl+C`, restaurando cursor e cores do terminal.

## Interface

O tema deve ser selecionado pela flag existente:

```bash
hacker-animation --theme cyber --color cyan --speed fast
```

Ao implementar, atualizar a validacao de `--theme` para aceitar `hollywood` e `cyber`. O tema `hollywood` deve continuar sendo o padrao.

## Criterios de aceitacao

- `hacker-animation --theme cyber` renderiza um painel estavel em tela cheia.
- O painel respeita `--color`, `--speed`, `--duration` e `--density`.
- O terminal e restaurado corretamente ao sair.
- Nenhum comando real e executado.
- Os testes cobrem parsing do novo tema e pelo menos uma funcao pura de renderizacao do painel.
