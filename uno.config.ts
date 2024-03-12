import {
  defineConfig, presetAttributify, presetIcons,
  presetTypography, presetUno, presetWebFonts,
  transformerDirectives, transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  theme: {
    colors: {
      primary: {
        DEFAULT: '#0064c8',
        10: '#0064c81A',
      },
      warning: {
        DEFAULT: '#ffd813',
        bg: '#fff9d9',
      },
      error: {
        DEFAULT: '#e00000',
        bg: '#ffeaea',
      },
      red: {
        DEFAULT: '#d93026',
      },
      gray: {
        DEFAULT: '#8995AD',
        holder: '#B0BCC8',
        bg: '#f1f3f5',
        200: '#e5e7eb',
      },
      black: {
        DEFAULT: '#282C3B',
      },
    },
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
    presetTypography(),
    presetWebFonts({
      fonts: {
        // ...
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
