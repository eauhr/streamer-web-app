import { useEffect, useState } from 'react';
import { STORAGE_EVENT } from '@/lib/storage';

export default function useStore(read, deps = []) {
  const [value, setValue] = useState(read);
  useEffect(() => {
    const sync = () => setValue(read());
    sync();
    window.addEventListener(STORAGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(STORAGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, deps);
  return value;
}