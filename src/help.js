export function getHelp(version) {
  return `
hacker-animation v${version}

Uso:
  hacker-animation [opcoes]

Opcoes:
  --color <cor>          green, cyan, blue, red, purple, yellow, white, random
  --speed <velocidade>   slow, normal, fast
  --duration <segundos>  encerra automaticamente apos a duracao informada
  --density <densidade>  low, normal, high
  --theme <tema>         hollywood, cyber
  -h, --help             mostra esta ajuda
  -v, --version          mostra a versao

Exemplos:
  hacker-animation
  hacker-animation --color cyan --speed fast
  hacker-animation --color random --density high --duration 10
  hacker-animation --theme cyber --color cyan
`.trimStart();
}
