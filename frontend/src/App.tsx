import React, { useCallback, useEffect, useState, Suspense } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AUTH_CHANGED_EVENT, useAuth } from './hooks/useAuth';
import Upload from './components/Upload';
import { useGenerate } from './hooks/useGenerate';
import { api } from './services/api';
const HistoryList = React.lazy(() => import('./components/HistoryList'));
type Gen = { id: number; imageUrl: string; prompt: string; style: string; status: string; createdAt: string };

function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#4f46e5_0%,transparent_55%),radial-gradient(circle_at_bottom,#0ea5e9_0%,transparent_55%)] opacity-70"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-12 lg:flex-row lg:items-stretch lg:py-24">
        <article className="glass-panel hidden flex-1 flex-col justify-between rounded-3xl p-10 text-slate-100 lg:flex">
          <div className="space-y-6">
            <span className="section-title">Mini AI Studio</span>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white">
              Generate on-brand product visuals in seconds.
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-slate-300">
              Upload a reference photo, describe the mood, and let the model do the rest. You'll get styled
              looks, consistent angles, and beautiful lighting fast.
            </p>
          </div>
          <ul className="grid gap-5 text-sm text-slate-200">
            <li className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-200">
                1
              </span>
              Upload your reference look.
            </li>
            <li className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-200">
                2
              </span>
              Pick a style direction or mood board.
            </li>
            <li className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-200">
                3
              </span>
              Generate and iterate with your history.
            </li>
          </ul>
        </article>
        <div className="glass-panel w-full max-w-md self-center rounded-3xl px-6 py-8 text-slate-100 sm:px-10">
          <div className="mb-6 space-y-2 text-center lg:text-left">
            <p className="section-title">Welcome back</p>
            <h2 className="text-2xl font-semibold tracking-tight">Sign in to continue</h2>
            <p className="text-sm text-slate-400">
              Use your account to manage prompts, iterate on past generations, and export final assets.
            </p>
          </div>
          <Routes>
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="login" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
function Login() {
  const { login, loading, error } = useAuth(); const nav = useNavigate();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  return (
    <form className="space-y-5" onSubmit={async e => { e.preventDefault(); if (await login(email, password)) nav('/'); }}>
      <label className="space-y-2 text-sm font-medium text-slate-200">
        Email
        <input required type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} />
      </label>
      <label className="space-y-2 text-sm font-medium text-slate-200">
        Password
        <input required type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} />
      </label>
      {error && <p role="alert" className="rounded-2xl bg-rose-500/20 px-3 py-2 text-sm font-medium text-rose-200">{String(error)}</p>}
      <button disabled={loading} className="primary-button w-full" aria-busy={loading}>
        {loading ? 'Signing you in...' : 'Continue'}
      </button>
      <p className="text-sm text-slate-400">
        No account yet?{' '}
        <Link to="/auth/signup" className="font-semibold text-indigo-200 underline decoration-dotted underline-offset-4">
          Create one
        </Link>
      </p>
    </form>
  );
}
function Signup() {
  const { signup, loading, error } = useAuth(); const nav = useNavigate();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  return (
    <form className="space-y-5" onSubmit={async e => { e.preventDefault(); if (await signup(email, password)) nav('/'); }}>
      <label className="space-y-2 text-sm font-medium text-slate-200">
        Email
        <input required type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} />
      </label>
      <label className="space-y-2 text-sm font-medium text-slate-200">
        Password
        <input required type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} />
      </label>
      {error && <p role="alert" className="rounded-2xl bg-rose-500/20 px-3 py-2 text-sm font-medium text-rose-200">{String(error)}</p>}
      <button disabled={loading} className="primary-button w-full" aria-busy={loading}>
        {loading ? 'Creating your account...' : 'Create account'}
      </button>
      <p className="text-sm text-slate-400">
        Already registered?{' '}
        <Link to="/auth/login" className="font-semibold text-indigo-200 underline decoration-dotted underline-offset-4">
          Log in instead
        </Link>
      </p>
    </form>
  );
}
function Studio() {
  const nav = useNavigate();
  const { logout } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState(''); const [style, setStyle] = useState('Streetwear');
  const [history, setHistory] = useState<Gen[]>([]);
  const { generate, abort, reset, loading, error, result, status } = useGenerate();
  const [activeGeneration, setActiveGeneration] = useState<Gen | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [uploadResetKey, setUploadResetKey] = useState(0);
  const normalizeGeneration = useCallback((gen: Gen): Gen => ({
    ...gen,
    imageUrl: gen.imageUrl.replace(/\\/g, '/')
  }), []);
  const handleUploadChange = useCallback((uploaded: File | null) => {
    setFile(uploaded);
    if (uploaded) {
      setInputError(null);
    }
  }, []);
  const handleReset = useCallback(() => {
    reset();
    setFile(null);
    setPrompt('');
    setStyle('Streetwear');
    setActiveGeneration(null);
    setInputError(null);
    setUploadResetKey(key => key + 1);
  }, [reset]);
  const refresh = useCallback(async () => {
    try {
      const data = await api<Gen[]>('/generations?limit=5');
      setHistory(data.map(normalizeGeneration));
    } catch (e: any) {
      if (e.status === 401) { logout(); nav('/auth/login'); }
    }
  }, [logout, nav, normalizeGeneration]);
  useEffect(() => { refresh(); }, [refresh]); useEffect(() => { if (result) { setActiveGeneration(normalizeGeneration(result)); refresh(); } }, [result, refresh, normalizeGeneration]);
  const lastUpdated = history[0]?.createdAt ?? activeGeneration?.createdAt ?? null;
  const formattedLastUpdated = lastUpdated
    ? new Date(lastUpdated).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    : 'Awaiting first run';

  return (
    <div className="relative min-h-screen pb-16">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,#4f46e5_0%,transparent_55%),radial-gradient(circle_at_bottom_right,#0ea5e9_0%,transparent_50%)] opacity-60"
        aria-hidden="true"
      />
      <main className="relative mx-auto max-w-6xl px-4 pb-20 pt-12 lg:px-6 lg:pt-16">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <p className="section-title">Workspace</p>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Design Studio</h1>
              <p className="mt-2 max-w-xl text-sm text-slate-300">
                Combine your product imagery with AI styling. Upload a reference, describe the shot, and
                we'll handle the lighting and setting.
              </p>
            </div>
          </div>
          <button
            onClick={() => { logout(); nav('/auth/login'); }}
            className="secondary-button self-start sm:self-auto"
          >
            Sign out
          </button>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <div className="glass-panel space-y-6 rounded-3xl p-6 sm:p-8">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)]">
                <Upload key={uploadResetKey} onChange={handleUploadChange} />

                <div className="space-y-5">
                  <label className="space-y-2 text-sm font-medium text-slate-200">
                    Creative prompt
                    <textarea
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      rows={4}
                      className="input-field min-h-[140px] resize-none"
                      placeholder="e.g. Soft studio lighting, elevated streetwear styling, subtle motion blur"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-slate-200">
                    Style palette
                    <select
                      value={style}
                      onChange={e => setStyle(e.target.value)}
                      className="input-field"
                      aria-label="Select style"
                    >
                      {['Streetwear', 'Minimal', 'Avant-garde', 'Vintage'].map(s => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <div className="flex flex-col gap-3">
                    {/* Row 1 – Generate + Abort */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                      <button
                        type="button"
                        onClick={async () => {
                          if (!file) {
                            setInputError('Please upload an image before generating.');
                            return;
                          }
                          try {
                            setInputError(null);
                            await generate({ prompt, style, image: file });
                          } catch {
                            /* handled in hook */
                          }
                        }}
                        disabled={loading}
                        className="primary-button min-w-[135px] flex items-center justify-center gap-2"
                        aria-busy={loading}
                      >
                        {loading && (
                          <span
                            className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                            aria-hidden="true"
                          />
                        )}
                        <span>{loading ? 'Generating…' : 'Generate look'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={abort}
                        disabled={!loading}
                        className="secondary-button"
                      >
                        Abort
                      </button>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="secondary-button text-xs md:text-sm"
                      >
                        Reset
                      </button>
                    </div>

                    {/* Row 2 – Reset + Status */}
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">


                      <div
                        className="text-sm text-slate-400"
                        aria-live="polite"
                        aria-atomic="true"
                      >
                        {status ? (
                          status
                        ) : error ? (
                          <span className="font-medium text-rose-400">{error}</span>
                        ) : inputError ? (
                          <span className="font-medium text-rose-300">{inputError}</span>
                        ) : (
                          'Ready.'
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
              <div className="grid gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-slate-200 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Last updated</p>
                  <p className="font-semibold text-white">{formattedLastUpdated}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Current style</p>
                  <p className="font-semibold text-white">{style}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Recent variations</p>
                  <p className="font-semibold text-white">{history.length || '—'}</p>
                </div>
              </div>
            </div>

            {activeGeneration && (
              <div className="glass-panel rounded-3xl p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="section-title">Latest output</p>
                    <h2 className="text-xl font-semibold text-white">{activeGeneration.style}</h2>
                    <p className="text-sm text-slate-300">Prompt: {activeGeneration.prompt}</p>
                  </div>
                  <a
                    href={activeGeneration.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="secondary-button text-xs"
                  >
                    Open full image
                  </a>
                </div>
                <figure className="mt-6 overflow-hidden rounded-3xl border border-white/10">
                  <img
                    src={activeGeneration.imageUrl}
                    alt="Generated result preview"
                    className="max-h-[28rem] w-full object-cover"
                  />
                </figure>
                <dl className="mt-5 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Prompt</dt>
                    <dd className="mt-1 text-slate-200">{activeGeneration.prompt}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Style</dt>
                    <dd className="mt-1 text-slate-200">{activeGeneration.style}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Created</dt>
                    <dd className="mt-1 text-slate-200">
                      {new Date(activeGeneration.createdAt).toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-200">
                Recent history
              </h2>
              <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-[11px] font-semibold text-indigo-100">
                Last 5
              </span>
            </div>
            <Suspense
              fallback={
                <div className="glass-panel rounded-3xl p-6 text-sm text-slate-300" role="status" aria-live="polite">
                  Loading history...
                </div>
              }
            >
              <HistoryList
                items={history}
                onSelect={(it: Gen) => {
                  const normalized = normalizeGeneration(it);
                  setPrompt(normalized.prompt);
                  setStyle(normalized.style);
                  setActiveGeneration(normalized);
                }}
              />
            </Suspense>
          </aside>
        </section>
      </main>
    </div>
  );
}
export default function App() {
  const [isAuthed, setIsAuthed] = useState(() => (typeof window !== 'undefined' ? !!localStorage.getItem('token') : false));
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => setIsAuthed(!!localStorage.getItem('token'));
    update();
    window.addEventListener(AUTH_CHANGED_EVENT, update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, []);
  return <Routes>
    <Route path="/auth/*" element={<AuthLayout />} />
    <Route path="/" element={isAuthed ? <Studio /> : <Navigate to="/auth/login" />} />
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>;
}
