import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Upload from '../src/components/Upload';
import App from '../src/App';
import * as retry from '../src/hooks/useRetry';

const headers = { 'Content-Type': 'application/json' };

const createJsonResponse = (data: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(data), {
    status: init.status ?? 200,
    headers
  });

describe('Upload component', () => {
  it('renders the upload call to action', () => {
    render(<Upload onChange={() => undefined} />);
    expect(screen.getByText(/image upload/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /browse/i })).toBeInTheDocument();
  });
});

describe('Studio flows', () => {
  const originalFetch = globalThis.fetch;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'test-token');

    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    vi.spyOn(retry, 'sleep').mockImplementation(() => Promise.resolve());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = originalFetch;
    localStorage.clear();
  });

  const renderStudio = () =>
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

  const uploadSampleImage = (container: HTMLElement) => {
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['dummy'], 'sample.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });
  };

  it('renders upload, prompt, and style controls when authenticated', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse([]));

    renderStudio();

    expect(await screen.findByText(/image upload/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/creative prompt/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/style palette/i)).toBeInTheDocument();
  });

  it('completes a generate flow and refreshes history', async () => {
    const generation = {
      id: 42,
      prompt: 'Red jacket',
      style: 'Streetwear',
      status: 'succeeded',
      imageUrl: '/uploads/red-jacket.png',
      createdAt: new Date().toISOString()
    };

    fetchMock
      .mockResolvedValueOnce(createJsonResponse([])) // initial history
      .mockResolvedValueOnce(createJsonResponse(generation, { status: 201 })) // create
      .mockResolvedValueOnce(createJsonResponse([generation])); // refreshed history

    const { container } = renderStudio();
    await screen.findByText(/image upload/i);
    uploadSampleImage(container);

    const generateButton = screen.getByRole('button', { name: /generate look/i });
    fireEvent.click(generateButton);

    expect(await screen.findByText(/generating image/i)).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText(/latest output/i)).toBeInTheDocument());
    expect(screen.getByText(/prompt: red jacket/i)).toBeInTheDocument();

    const historyList = await screen.findByRole('list', { name: /recent generations/i });
    expect(within(historyList).getByText('Streetwear')).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('Ready.')).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('retries up to three attempts and surfaces overload errors', async () => {
    fetchMock
      .mockResolvedValueOnce(createJsonResponse([])) // initial history
      .mockResolvedValueOnce(createJsonResponse({ message: 'Model overloaded' }, { status: 503 }))
      .mockResolvedValueOnce(createJsonResponse({ message: 'Model overloaded' }, { status: 503 }))
      .mockResolvedValueOnce(createJsonResponse({ message: 'Model overloaded' }, { status: 503 }));

    const { container } = renderStudio();
    await screen.findByText(/image upload/i);
    uploadSampleImage(container);

    const generateButton = screen.getByRole('button', { name: /generate look/i });
    fireEvent.click(generateButton);

    expect(await screen.findByText(/model overloaded\. retrying/i)).toBeInTheDocument();
    expect(await screen.findByText(/model overloaded\. please try again\./i)).toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('aborts an in-flight request and clears the loading state', async () => {
    fetchMock.mockImplementation((_, init: RequestInit | undefined) => {
      if (init?.method === 'POST') {
        const controllerSignal = init.signal as AbortSignal | undefined;
        return new Promise<never>((_resolve, reject) => {
          controllerSignal?.addEventListener('abort', () => {
            reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }));
          });
        });
      }
      return Promise.resolve(createJsonResponse([]));
    });

    const { container } = renderStudio();
    await screen.findByText(/image upload/i);
    uploadSampleImage(container);

    const generateButton = screen.getByRole('button', { name: /generate look/i });
    fireEvent.click(generateButton);

    expect(await screen.findByText(/generating image/i)).toBeInTheDocument();

    const abortButton = screen.getByRole('button', { name: /abort/i });
    expect(abortButton).not.toBeDisabled();

    fireEvent.click(abortButton);

    expect(await screen.findByText(/generation cancelled/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: /abort/i })).toBeDisabled());
  });
});
