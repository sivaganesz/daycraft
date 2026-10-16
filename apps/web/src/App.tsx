import { healthResponseSchema, readinessResponseSchema } from '@daycraft/shared';
import { useQuery } from '@tanstack/react-query';
import { getJson } from './lib/api';

type Status = 'checking' | 'up' | 'down';

const REFRESH_MS = 10_000;

function useServiceStatus() {
  const live = useQuery({
    queryKey: ['health'],
    queryFn: ({ signal }) => getJson('health', healthResponseSchema, { signal }),
    refetchInterval: REFRESH_MS,
    retry: false,
  });
  const ready = useQuery({
    queryKey: ['health', 'ready'],
    // 503 still carries a valid body ("database: down"), so it isn't treated as an error.
    queryFn: ({ signal }) =>
      getJson('health/ready', readinessResponseSchema, { acceptStatuses: [503], signal }),
    refetchInterval: REFRESH_MS,
    retry: false,
  });

  const api: Status = live.isPending ? 'checking' : live.isSuccess ? 'up' : 'down';
  const database: Status = ready.isPending
    ? 'checking'
    : ready.data?.checks.database === 'up'
      ? 'up'
      : 'down';

  return { api, database, version: live.data?.version };
}

const statusStyles: Record<Status, { dot: string; label: string }> = {
  checking: { dot: 'bg-zinc-400 animate-pulse', label: 'Checking…' },
  up: { dot: 'bg-emerald-500', label: 'Operational' },
  down: { dot: 'bg-rose-500', label: 'Unavailable' },
};

function StatusRow({ name, status }: { name: string; status: Status }) {
  const { dot, label } = statusStyles[status];
  return (
    <li className="flex items-center justify-between py-3">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{name}</span>
      <span className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <span className={`size-2.5 rounded-full ${dot}`} aria-hidden="true" />
        {label}
      </span>
    </li>
  );
}

export function App() {
  const { api, database, version } = useServiceStatus();

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-zinc-50 px-4 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
        <img src="/favicon.svg" alt="" className="size-12 rounded-xl" />
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">Hello from DayCraft</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Phase 1 · Local foundation. The app, API, and database are talking to each other.
        </p>

        <ul className="mt-6 divide-y divide-zinc-100 border-y border-zinc-100 dark:divide-zinc-800 dark:border-zinc-800">
          <StatusRow name="API" status={api} />
          <StatusRow name="Database" status={database} />
        </ul>

        <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
          API version: <code>{version ?? '—'}</code>
        </p>
      </section>

      <footer className="mt-8 text-xs text-zinc-400 dark:text-zinc-500">
        DayCraft by Whitraworks
      </footer>
    </main>
  );
}
