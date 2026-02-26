interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="admin-loading">
      <div className="admin-spinner"></div>
      <p>{message}</p>
    </div>
  );
}
