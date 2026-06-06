"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

type State = { hasError: boolean };

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {}

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[16px] border border-border bg-background-secondary p-8 text-center">
        <AlertTriangle className="mb-4 h-10 w-10 text-[#FF4757]" />
        <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
        <button className="mt-5 h-10 rounded-xl bg-[#00D68F] px-4 text-sm font-semibold text-black" type="button" onClick={() => this.setState({ hasError: false })}>
          Try again
        </button>
      </div>
    );
  }
}
