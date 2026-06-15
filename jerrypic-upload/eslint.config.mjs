// eslint.config.mjs
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default [...tseslint.configs.recommended, { ignores: ['dist/**'] }, prettier]
