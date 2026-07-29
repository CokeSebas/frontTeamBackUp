import { createI18n } from 'vue-i18n'

// Importar archivos de traducción
import en from '@/locales/en.json'
import es from '@/locales/es.json'
import br from '@/locales/br.json'
import fr from '@/locales/fr.json'
import it from '@/locales/it.json'
import de from '@/locales/de.json'

const i18n = createI18n({
  locale: localStorage.getItem('locale') || 'es',
  fallbackLocale: 'es',
  messages: {
    en,
    es,
    br,
    fr,
    it,
    de,
  },
})

export default i18n
