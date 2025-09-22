'use client';

interface Props {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: Props) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
      <p>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          もう一度試す
        </button>
      )}
    </div>
  );
}
