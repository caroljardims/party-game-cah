interface WaitingScreenProps {
  message: string;
  progress?: string;
}

export function WaitingScreen({ message, progress }: WaitingScreenProps) {
  return (
    <div className="screen screen--center">
      <div className="spinner" aria-hidden />
      <p>{message}</p>
      {progress && <p className="muted">{progress}</p>}
    </div>
  );
}
