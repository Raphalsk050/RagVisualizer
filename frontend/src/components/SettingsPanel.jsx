export default function SettingsPanel({ provider, onChange, hasServerKey }) {
  const set = (field) => (e) => onChange({ ...provider, [field]: e.target.value })

  return (
    <section className="panel">
      <h2>Provedor de embeddings</h2>
      <label>
        Base URL
        <input
          type="text"
          value={provider.base_url}
          onChange={set('base_url')}
          placeholder="https://api.openai.com/v1"
        />
      </label>
      <label>
        API key
        <input
          type="password"
          value={provider.api_key}
          onChange={set('api_key')}
          placeholder={hasServerKey ? 'usando key do servidor (.env)' : 'sk-...'}
          autoComplete="off"
        />
      </label>
      <label>
        Modelo
        <input
          type="text"
          value={provider.model}
          onChange={set('model')}
          placeholder="text-embedding-3-small"
        />
      </label>
      <p className="hint">
        Compatível com OpenAI, Azure, Ollama (http://localhost:11434/v1), LM Studio etc.
        A key é usada só nesta sessão — não é salva em disco.
      </p>
    </section>
  )
}
