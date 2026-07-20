import { SAMPLE_TEXTS } from '../sampleData.js'

const TIPS = {
  line: 'Cada linha vira um item do gráfico. Vírgulas fazem parte do texto.',
  comma:
    'Separa também por vírgula: "gato, cachorro, leão" vira 3 itens. ' +
    'Útil para listas de palavras. Quebras de linha continuam separando.',
}

// Divide o texto bruto em itens conforme o modo escolhido na UI.
export function splitTexts(raw, mode) {
  const parts = mode === 'comma' ? raw.split(/[,\n]/) : raw.split('\n')
  return parts.map((p) => p.trim()).filter(Boolean)
}

export default function TextInput({ value, onChange, splitMode, onSplitModeChange }) {
  const count = splitTexts(value, splitMode).length

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Textos <span className="count">({count})</span></h2>
        <button
          type="button"
          className="secondary"
          onClick={() => onChange(SAMPLE_TEXTS.join('\n'))}
        >
          Carregar exemplo
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          splitMode === 'comma'
            ? 'Separe por vírgula ou linha, ex.:\ngato, cachorro, leão\nPython, JavaScript'
            : 'Um texto por linha, ex.:\nO gato dorme no sofá\nPython é uma linguagem popular'
        }
        rows={10}
        spellCheck={false}
      />
      <label title={splitMode === 'comma' ? TIPS.comma : TIPS.line}>
        Separador
        <select value={splitMode} onChange={(e) => onSplitModeChange(e.target.value)}>
          <option value="line" title={TIPS.line}>Por linha</option>
          <option value="comma" title={TIPS.comma}>Por vírgula (e linha)</option>
        </select>
      </label>
    </section>
  )
}
