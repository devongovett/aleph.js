import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts'
import cssLoader from './css.ts'

Deno.test('css loader', async () => {
  const loader = cssLoader()
  const { code } = await loader.transform!({
    url: '/test.css',
    content: (new TextEncoder).encode('h1 { font-size: 18px; }'),
  })
  assertEquals(loader.test.test('/test.css'), true)
  assertEquals(loader.test.test('/test.pcss'), true)
  assertEquals(loader.acceptHMR, true)
  assertEquals(code, 'import { applyCSS } from "https://deno.land/x/aleph/framework/core/style.ts"\napplyCSS("/test.css", "h1 { font-size: 18px; }")')
})

Deno.test('css loader for inline style', async () => {
  const loader = cssLoader()
  const { code, type } = await loader.transform!({
    url: '#inline-style-{}',
    content: (new TextEncoder).encode('h1 { font-size: 18px; }'),
  })
  assertEquals(code, 'h1 { font-size: 18px; }')
  assertEquals(type, 'css')
})

Deno.test('css loader in production mode', async () => {
  Deno.env.set('BUILD_MODE', 'production')

  const loader = cssLoader()
  const { code } = await loader.transform!({
    url: '/test.css',
    content: (new TextEncoder).encode('h1 { font-size: 18px; }'),
  })
  assertEquals(code, 'import { applyCSS } from "https://deno.land/x/aleph/framework/core/style.ts"\napplyCSS("/test.css", "h1{font-size:18px}")')

  Deno.env.delete('BUILD_MODE')
})

Deno.test('css loader with postcss plugins', async () => {
  const loader = cssLoader({ postcss: { plugins: ['postcss-nested'] } })
  const { code } = await loader.transform!({
    url: '/test.css',
    content: (new TextEncoder).encode('.foo { .bar { font-size: 100%; } }'),
  })
  assertEquals(code, 'import { applyCSS } from "https://deno.land/x/aleph/framework/core/style.ts"\napplyCSS("/test.css", ".foo .bar { font-size: 100%; }")')
})
