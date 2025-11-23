interface ErrorMessageProps {
  message: string;
  className?: string;
}

export function ErrorMessage({ message, className = '' }: ErrorMessageProps) {
  return (
    <div className={`mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded ${className}`}>
      {message}
    </div>
  );
}

