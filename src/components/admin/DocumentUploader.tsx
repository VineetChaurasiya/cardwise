import { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, FileText, Loader2, Trash2, UploadCloud, XCircle } from 'lucide-react';
import type { CardDocument, CreditCard } from '../../types';
import { deleteDocument, uploadDocument } from '../../lib/api';

interface Props {
  card: CreditCard;
  docs: CardDocument[];
  token: string;
  onDocsChange: (docs: CardDocument[]) => void;
}

export default function DocumentUploader({ card, docs, token, onDocsChange }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadError(null);

    for (const file of Array.from(files)) {
      try {
        const doc = await uploadDocument(card.id, file, token);
        onDocsChange([doc, ...docs]);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : `Failed to upload ${file.name}`);
      }
    }
  }

  async function handleRemove(id: string) {
    await deleteDocument(card.id, id, token);
    onDocsChange(docs.filter((d) => d.id !== id));
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition
          ${isDragging ? 'border-fuchsia-400 bg-fuchsia-500/10' : 'border-white/15 hover:border-white/30 bg-white/[0.02]'}`}
      >
        <UploadCloud className="w-8 h-8 mx-auto mb-3 text-white/50" />
        <p className="text-white font-medium mb-1">Drop files here or click to browse</p>
        <p className="text-white/40 text-sm">PDF, DOCX up to 10MB — T&amp;Cs, fee schedules, brochures</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {uploadError && (
        <div className="mt-4 flex items-center gap-2 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" /> {uploadError}
        </div>
      )}

      <div className="mt-6 space-y-2">
        {docs.length === 0 && (
          <p className="text-white/30 text-sm text-center py-6">No documents uploaded for {card.name} yet.</p>
        )}
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3"
          >
            <FileText className="w-5 h-5 text-white/40 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{doc.fileName}</p>
              <p className="text-xs text-white/40">{doc.fileSizeKb} KB</p>
            </div>
            {doc.status === 'processing' && (
              <span className="flex items-center gap-1.5 text-xs text-amber-400 shrink-0">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing
              </span>
            )}
            {doc.status === 'ready' && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready
              </span>
            )}
            {doc.status === 'error' && (
              <span className="flex items-center gap-1.5 text-xs text-rose-400 shrink-0">
                <XCircle className="w-3.5 h-3.5" /> Failed
              </span>
            )}
            <button
              onClick={() => handleRemove(doc.id)}
              className="text-white/30 hover:text-rose-400 transition shrink-0"
              aria-label="Remove document"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
