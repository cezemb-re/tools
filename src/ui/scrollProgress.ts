import { useState, useRef, useEffect, useCallback, RefObject } from 'react';

export function useScrollProgress(
  currentRef: RefObject<Element> | null = null,
): [RefObject<Element | null | undefined>, number, number] {
  const ref = useRef<Element | null | undefined>(currentRef?.current);

  const [progress, setProgress] = useState<number>(0);
  const [progressPx, setProgressPx] = useState<number>(0);

  const calcProgress = useCallback(() => {
    if (ref.current) {
      const { top, bottom, height } = ref.current.getBoundingClientRect();

      if (window.innerHeight > top && bottom > 0) {
        setProgress((window.innerHeight - top) / (height + window.innerHeight));
        setProgressPx(window.innerHeight - top);
      } else if (bottom < 0) setProgress(1);
    }
  }, [setProgress, setProgressPx]);

  useEffect(() => {
    calcProgress();
    window.addEventListener('scroll', calcProgress);
    window.addEventListener('resize', calcProgress);
    return () => {
      window.removeEventListener('scroll', calcProgress);
      window.removeEventListener('resize', calcProgress);
    };
  });

  return [ref, progress, progressPx];
}

export function useScrollThreshold(
  threshold = 0.2,
  currentRef: RefObject<Element> | null = null,
): [RefObject<Element | null | undefined>, boolean, number, number] {
  const [active, setActive] = useState(false);

  const [ref, progress, progressPx] = useScrollProgress(currentRef);

  useEffect(() => {
    if (progress >= threshold && !active) setActive(true);
    else if (progress <= threshold && active) setActive(false);
  }, [progress, threshold, active, setActive]);

  return [ref, active, progress, progressPx];
}

export function useScrollThresholds(
  thresholds = [0.25],
  currentRef?: RefObject<Element> | null,
): [RefObject<Element | null | undefined>, Array<boolean>, number, number] {
  const [actives, setActives] = useState(Array<boolean>(thresholds.length).fill(false));

  const [ref, progress, progressPx] = useScrollProgress(currentRef);

  useEffect(() => {
    let match = false;

    thresholds.forEach((threshold, key) => {
      if (progress >= threshold && !actives[key]) {
        match = true;
        actives[key] = true;
      } else if (progress <= threshold && actives[key]) {
        match = true;
        actives[key] = false;
      }
    });

    if (match) {
      setActives([...actives]);
    }
  }, [progress, thresholds, actives, setActives]);

  return [ref, actives, progress, progressPx];
}
