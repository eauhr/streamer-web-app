import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function CodeBlock({ code, label = 'Copy code' }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black">
      <button type="button" onClick={copy} aria-label={label} className="absolute right-2 top-2 inline-flex h-8 items-center gap-1.5 rounded-full bg-white/10 px-3 text-xs font-medium text-white transition hover:bg-white/15">
        {copied ? <Check className="h-3.5 w-3.5 text-teev-lime" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre className="overflow-x-auto p-4 pr-24 text-[13px] leading-relaxed text-[#D4D4D8]"><code className="font-mono">{code}</code></pre>
    </div>
  );
}