interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export function LoadingSpinner({ message = 'Loading...', className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`text-center py-8 text-gray-500 ${className}`}>
      <p>{message}</p>
    </div>
  );
}

