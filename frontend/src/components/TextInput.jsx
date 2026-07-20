import { SAMPLE_TEXTS } from '../sampleData.js'

export default function TextInput({ value, onChange }) {
  const count = value.split('\n').filter((l) => l.trim()).length

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
        placeholder={'Um texto por linha, ex.:\nO gato dorme no sofá\nPython é uma linguagem popular'}
        rows={10}
        spellCheck={false}
      />
    </section>
  )
}
