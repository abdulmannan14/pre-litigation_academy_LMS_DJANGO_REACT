import Button from './Button';

export default function ErrorMessage({ message, onRetry, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 gap-4 text-center ${className}`}>
      <div className="w-14 h-14 rounded-full bg-red-950/30 flex items-center justify-center text-2xl">
        ⚠️
      </div>
      <div>
        <p className="font-medium text-textDark">Something went wrong</p>
        <p className="text-sm text-gray-400 mt-1">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          Try again
        </Button>
      )}
    </div>
  );
}
