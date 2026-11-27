import { useCallback, useEffect, useRef, useState } from 'react';
import { checkAiHealth } from '../utils/aiClient';
import type { AiAvailability } from '../utils/aiClient';
import type { AiMode } from '../../shared/ai';

export function useAiMode() {
  const [aiMode, setMode] = useState<AiMode>('mock');
  const [aiAvailability, setAvailability] = useState<AiAvailability>({ status: 'checking', model: '' });
  const [version, setVersion] = useState(0);
  const manualChoice = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setAvailability(previous => ({ ...previous, status: 'checking' }));
    void checkAiHealth({ signal: controller.signal }).then(result => {
      if (!active) return;
      setAvailability(result);
      if (result.status !== 'ready') setMode('mock');
      else if (!manualChoice.current) setMode('real');
    });
    return () => { active = false; controller.abort(); };
  }, [version]);
  const changeAiMode = useCallback((mode: AiMode) => {
    if (mode === 'real' && aiAvailability.status !== 'ready') return;
    manualChoice.current = true;
    setMode(mode);
  }, [aiAvailability.status]);
  const refreshAiHealth = useCallback(() => { manualChoice.current = false; setVersion(previous => previous + 1); }, []);
  return { aiMode, aiAvailability, changeAiMode, refreshAiHealth, aiChecking: aiAvailability.status === 'checking' };
}
