import React from "react";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => (
  <div className="flex flex-col items-center justify-center h-screen">
    <h2 className="text-red-600 text-xl mb-4">Something went wrong:</h2>
    <p className="text-gray-700 mb-4">{error.message}</p>
    <button
      onClick={resetErrorBoundary}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      Try again
    </button>
  </div>
);

export default ErrorFallback;