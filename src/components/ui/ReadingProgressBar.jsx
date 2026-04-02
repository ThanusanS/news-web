import { useReadingProgress } from '../hooks';

export default function ReadingProgressBar() {
  const progress = useReadingProgress();
  return (
    <div
      className="fixed top-0 left-0 z-[200] h-0.5 bg-accent transition-all duration-100 ease-out"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  );
}
