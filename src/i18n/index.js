import { createI18n } from 'vue-i18n'

// Importar archivos de traducción
import en from '@/locales/en.json'
import es from '@/locales/es.json'
import br from '@/locales/br.json'

const i18n = createI18n({
  locale: localStorage.getItem('locale') || 'es',
  fallbackLocale: 'es',
  messages: {
    en,
    es,
    br,
  },
})

export default i18n
