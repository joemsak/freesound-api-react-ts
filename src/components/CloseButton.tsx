interface CloseButtonProps {
  onClick: () => void;
  title?: string;
  className?: string;
}

export function CloseButton({ onClick, title = 'Close', className = '' }: CloseButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer ${className}`}
      title={title}
    >
      <svg
        className="w-5 h-5 text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
}

