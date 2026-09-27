export function BlinkSecurityAlert({ message }: { message: string }) {
  return (
    <div className="blink-security-alert" role="alert">
      <span className="blink-security-icon" aria-hidden="true">!</span>
      <span>{message}</span>
    </div>
  );
}