import React from 'react';
import { Check, Play, Plus, Share2, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import useStore from '@/hooks/useStore';
import { listStore, reactionStore } from '@/lib/storage';

function IconAction({ label, pressed, onClick, children }) {
  return (
    <button type="button" aria-label={label} aria-pressed={pressed} onClick={onClick}
      className={`icon-btn ${pressed ? 'border-white bg-white text-black hover:bg-white/90' : ''}`}>
      {children}
    </button>
  );
}

export default function ActionRow({ item, onWatch, resumeNote }) {
  const { toast } = useToast();
  const type = item.mediaType;
  const inList = useStore(() => listStore.has(type, item.id), [item.id]);
  const reaction = useStore(() => reactionStore.get(type, item.id), [item.id]);
  const react = (v) => reactionStore.set(type, item.id, reaction === v ? null : v);

  const share = async () => {
    const url = window.location.href.replace(/[?&]play=1/, '');
    if (navigator.share) return navigator.share({ title: `${item.title} on TeeV`, url }).catch(() => {});
    await navigator.clipboard.writeText(url);
    toast({ title: 'Link copied', description: `Share ${item.title} with anyone.` });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 py-5">
      <button type="button" onClick={onWatch} className="btn-light h-12 px-7 text-base">
        <Play className="h-4 w-4 fill-current" aria-hidden="true" /> Watch free
      </button>
      <IconAction label={inList ? 'Remove from My List' : 'Add to My List'} pressed={inList} onClick={() => listStore.toggle(item)}>
        {inList ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
      </IconAction>
      <IconAction label="Like" pressed={reaction === 'like'} onClick={() => react('like')}>
        <ThumbsUp className={`h-[18px] w-[18px] ${reaction === 'like' ? 'fill-current' : ''}`} />
      </IconAction>
      <IconAction label="Dislike" pressed={reaction === 'dislike'} onClick={() => react('dislike')}>
        <ThumbsDown className={`h-[18px] w-[18px] ${reaction === 'dislike' ? 'fill-current' : ''}`} />
      </IconAction>
      <IconAction label="Share" onClick={share}><Share2 className="h-[18px] w-[18px]" /></IconAction>
      {resumeNote && <p className="w-full text-xs text-[#A1A1AA] sm:ml-2 sm:w-auto">{resumeNote}</p>}
    </div>
  );
}