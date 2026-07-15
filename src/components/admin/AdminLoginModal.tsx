import { useState } from 'react';
import { Lock, X } from 'lucide-react';
import { adminLogin } from '../../lib/api';

interface Props {
  onSuccess: (token: string) => void;
  onClose: () => void;
}

export default function AdminLoginModal({ onSuccess, onClose }: Props) {
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const token = await adminLogin(password);
      onSuccess(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl bg-[#15131f] border border-white/10 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-fuchsia-400" />
            <h2 className="text-lg font-semibold text-white">Admin login</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              placeholder="Enter admin password"
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/30
                focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60"
            />
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={!password || submitting}
            className="w-full rounded-lg px-4 py-2.5 font-semibold text-sm text-white bg-gradient-to-r from-fuchsia-500 to-indigo-600
              disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
