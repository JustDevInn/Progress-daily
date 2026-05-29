import { useEffect, useMemo, useRef, useState } from 'react';

export function useRestTimer(initialTimer = null, vibrationEnabled = false) {
  const didVibrateRef = useRef(false);
  const [timer, setTimer] = useState(initialTimer || {
    secondsLeft: 0,
    totalSeconds: 0,
    running: false,
    label: '',
    finished: false,
  });

  useEffect(() => {
    if (!timer.running || timer.secondsLeft <= 0) return undefined;
    const id = window.setInterval(() => {
      setTimer((current) => {
        if (current.secondsLeft <= 1) {
          return { ...current, secondsLeft: 0, running: false, finished: true };
        }
        return { ...current, secondsLeft: current.secondsLeft - 1 };
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timer.running, timer.secondsLeft]);

  useEffect(() => {
    if (!timer.finished) {
      didVibrateRef.current = false;
      return;
    }
    if (didVibrateRef.current || !vibrationEnabled) return;
    didVibrateRef.current = true;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([180, 80, 180]);
  }, [timer.finished, vibrationEnabled]);

  const progress = useMemo(() => {
    if (!timer.totalSeconds) return 0;
    return Math.max(0, Math.min(100, ((timer.totalSeconds - timer.secondsLeft) / timer.totalSeconds) * 100));
  }, [timer.secondsLeft, timer.totalSeconds]);

  function start(seconds, label = '') {
    if (!seconds) return;
    setTimer({ secondsLeft: seconds, totalSeconds: seconds, running: true, label, finished: false });
  }

  function pause() {
    setTimer((current) => ({ ...current, running: false }));
  }

  function resume() {
    setTimer((current) => {
      if (current.finished && current.totalSeconds > 0) {
        return {
          ...current,
          secondsLeft: current.totalSeconds,
          running: true,
          finished: false,
        };
      }
      return { ...current, running: current.secondsLeft > 0, finished: false };
    });
  }

  function reset() {
    setTimer((current) => ({
      ...current,
      secondsLeft: current.totalSeconds,
      running: false,
      finished: false,
    }));
  }

  function adjust(amount) {
    setTimer((current) => {
      const nextSeconds = Math.max(0, current.secondsLeft + amount);
      return {
        ...current,
        secondsLeft: nextSeconds,
        totalSeconds: Math.max(current.totalSeconds, nextSeconds),
        running: nextSeconds > 0 ? current.running : false,
        finished: nextSeconds === 0 && current.totalSeconds > 0,
      };
    });
  }

  function stop() {
    setTimer((current) => ({
      ...current,
      secondsLeft: 0,
      running: false,
      finished: false,
    }));
  }

  return { timer, progress, start, pause, resume, reset, adjust, stop };
}
