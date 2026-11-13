import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const targets = [
  { source: 'brand/og.svg', output: 'public/og.png', width: 1200, height: 630 },
  { source: 'public/favicon.svg', output: 'public/apple-touch-icon.png', width: 180, height: 180 },
  { source: 'public/favicon.svg', output: 'public/icon-512.png', width: 512, height: 512 },
]

for (const { source, output, width, height } of targets) {
  await sharp(resolve(ROOT, source), { density: 300 }).resize(width, height).png().toFile(resolve(ROOT, output))
  console.log(`${output} (${width}x${height})`)
}
