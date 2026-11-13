import React from 'react';

export default class AppErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('TeeV encountered a rendering error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#090909] px-6 text-center text-white">
          <div className="max-w-md space-y-4">
            <h1 className="text-2xl font-semibold">This page ran into a problem</h1>
            <p className="text-sm text-[#A1A1AA]">Reload TeeV to try again.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full bg-[#E7FF4F] px-5 py-2.5 font-semibold text-black"
            >
              Reload page
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
