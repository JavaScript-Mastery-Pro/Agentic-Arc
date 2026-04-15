"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface EditorErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface EditorErrorBoundaryState {
  hasError: boolean;
}

export class EditorErrorBoundary extends Component<
  EditorErrorBoundaryProps,
  EditorErrorBoundaryState
> {
  state: EditorErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Editor crashed", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
