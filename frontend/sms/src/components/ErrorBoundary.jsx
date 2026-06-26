import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: "#ef4444", fontFamily: "Outfit, sans-serif", background: "#0f0f1a", minHeight: "100vh" }}>
          <h2 style={{ marginBottom: 12 }}>Something went wrong</h2>
          <pre style={{ fontSize: 13, color: "#a0a0c0" }}>{this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}