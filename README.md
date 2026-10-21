# ProtoLab

Home responsiva da ProtoLab, em português, com Vite, JavaScript e Three.js.

## Desenvolvimento

Requer Node.js 22.12+ (validado com Node.js 24).

```sh
npm ci
npm run dev
```

```sh
npm run build
npm run preview
```

O build estático é gerado em `dist/`. As fontes e ilustrações são locais; não é necessário configurar chaves ou serviços externos.

## Interface

- Tema inicial acompanha o sistema; o seletor permite Claro, Escuro e Sistema. A preferência é salva no navegador quando o armazenamento está disponível.
- Animações de entrada com IntersectionObserver e escultura 3D com Three.js. Movimento reduzido é respeitado, e a renderização pausa fora da tela e em abas ocultas.
- Ilustração SVG de reserva para navegadores sem WebGL.
- Os links “Nossos produtos” são elementos `<a>` sem `href`, com `aria-disabled="true"`, aguardando a futura loja. Ao integrar a loja, adicionar a URL e remover o estado desabilitado.
- Símbolo vetorial inspirado na referência de marca fornecida. As imagens das peças são ilustrativas.

## Verificação

```sh
npx playwright install chromium
npm test
```

O Chromium do sistema é usado automaticamente quando disponível em `/usr/bin/chromium`; nesse caso, a instalação pelo Playwright é dispensada.

Os testes verificam navegação móvel, responsividade, temas, preferência do sistema, acessibilidade e ausência de erros de execução. Na nuvem, se o cache padrão não puder ser gravado, use `npm ci --cache /tmp/protolab-npm-cache`. Para o navegador de testes, configure `PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright` na instalação e na execução.
