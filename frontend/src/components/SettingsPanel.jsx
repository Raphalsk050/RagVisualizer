const TIPS = {
  base_url:
    'Endpoint do provedor de embeddings, no formato da API OpenAI. Ex.: ' +
    'https://api.openai.com/v1 (OpenAI), http://localhost:1234/v1 (LM Studio), ' +
    'http://localhost:11434/v1 (Ollama).',
  api_key:
    'Chave de autenticação do provedor. Provedores locais (LM Studio, Ollama) não exigem — ' +
    'deixe em branco. A key é usada só nesta sessão e nunca é salva em disco.',
  model:
    'Modelo que converte texto em vetor. A qualidade da separação semântica depende dele. ' +
    'Ex.: text-embedding-3-small (OpenAI), text-embedding-mxbai-embed-large-v1 (LM Studio). ' +
    'Para textos em português, prefira modelos multilíngues.',
}

export default function SettingsPanel({ provider, onChange, hasServerKey }) {
  const set = (field) => (e) => onChange({ ...provider, [field]: e.target.value })

  return (
    <section className="panel">
      <h2>Provedor de embeddings</h2>
      <label title={TIPS.base_url}>
        Base URL
        <input
          type="text"
          value={provider.base_url}
          onChange={set('base_url')}
          placeholder="https://api.openai.com/v1"
        />
      </label>
      <label title={TIPS.api_key}>
        API key
        <input
          type="password"
          value={provider.api_key}
          onChange={set('api_key')}
          placeholder={hasServerKey ? 'usando key do servidor (.env)' : 'sk-...'}
          autoComplete="off"
        />
      </label>
      <label title={TIPS.model}>
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
