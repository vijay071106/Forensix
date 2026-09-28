import React, { useState } from 'react';
import { Copy, Check, ShieldCheck, Lock } from 'lucide-react';

interface HashDisplayProps {
  hash: string;
  legacyMd5?: string;
  label?: string;
  showReadOnlyNotice?: boolean;
}

export const HashDisplay: React.FC<HashDisplayProps> = ({
  hash,
  legacyMd5,
  label = 'SHA-256 HASH INTEGRITY',
  showReadOnlyNotice = true,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 font-mono text-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold tracking-wider text-[11px] uppercase">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          {label}
        </div>
        <button
          onClick={handleCopy}
          id="btn-copy-sha256"
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors px-2 py-0.5 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">COPIED</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>COPY HASH</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-slate-950 border border-slate-800/80 rounded p-2.5 text-emerald-400 font-mono text-[11px] break-all select-all leading-relaxed">
        {hash}
      </div>

      {legacyMd5 && (
        <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
          <span className="text-slate-500 uppercase">Legacy / Compatibility Hash (MD5):</span>
          <span className="text-slate-400 font-mono select-all">{legacyMd5}</span>
        </div>
      )}

      {showReadOnlyNotice && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-start gap-1.5 text-[10px] text-slate-400">
          <Lock className="w-3 h-3 text-sky-400 shrink-0 mt-0.5" />
          <span>
            <b>FORENSIC PRINCIPLE:</b> Original evidence is preserved as read-only. Analysis is performed on a verified working copy.
          </span>
        </div>
      )}
    </div>
  );
};
