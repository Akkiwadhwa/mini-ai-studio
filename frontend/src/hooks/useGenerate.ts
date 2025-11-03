import { useRef, useState } from 'react';
import { sleep } from './useRetry';

export function useGenerate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const resetRequestedRef = useRef(false);

  async function generate(payload: { prompt: string; style: string; image: File }) {
    resetRequestedRef.current = false;
    setLoading(true);
    setError(null);
    setStatus('Uploading image...');
    setResult(null);
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    const url = (((import.meta as any).env?.VITE_API_URL) || 'http://localhost:4000') + '/generations';
    const maxAttempts = 3;

    try {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        if (controller.signal.aborted) {
          const abortErr = new Error('Aborted');
          abortErr.name = 'AbortError';
          throw abortErr;
        }
        setStatus(attempt === 1 ? 'Generating image...' : `Retrying (${attempt}/${maxAttempts})...`);
        try {
          const form = new FormData();
          form.append('prompt', payload.prompt);
          form.append('style', payload.style);
          form.append('image', payload.image);
          const res = await fetch(url, {
            method: 'POST',
            body: form,
            headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
            signal: controller.signal
          });
          if (!res.ok) {
            const data = await res.json().catch(() => null);
            const raw = data?.message || data?.error;
            const message = typeof raw === 'string'
              ? raw
              : Array.isArray(raw)
                ? raw.join(', ')
                : raw
                  ? JSON.stringify(raw)
                  : `HTTP ${res.status}`;
            throw Object.assign(new Error(message), { status: res.status });
          }
          const data = await res.json();
          setResult(data);
          setStatus(null);
          return data;
        } catch (err: any) {
          if (controller.signal.aborted || err?.name === 'AbortError') {
            throw err;
          }
          const message = err?.message || 'Failed';
          const isLast = attempt === maxAttempts;
          const isOverloaded = message.toLowerCase().includes('model overloaded');
          if (!isLast) {
            setStatus(isOverloaded ? 'Model overloaded. Retrying...' : 'Temporary issue. Retrying...');
            await sleep(500 * attempt);
            continue;
          }
          throw err;
        }
      }
      throw new Error('Generation failed');
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        if (!resetRequestedRef.current) {
          setError('Generation cancelled');
        }
      } else {
        const message = e?.message || 'Failed';
        setError(message.toLowerCase().includes('model overloaded') ? 'Model overloaded. Please try again.' : message);
      }
      setStatus(null);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  function abort() {
    resetRequestedRef.current = false;
    controllerRef.current?.abort();
    setStatus(null);
    setError('Generation cancelled');
    setResult(null);
    setLoading(false);
  }

  function reset() {
    resetRequestedRef.current = true;
    controllerRef.current?.abort();
    setLoading(false);
    setError(null);
    setStatus(null);
    setResult(null);
  }

  return { generate, abort, reset, loading, error, result, status };
}
