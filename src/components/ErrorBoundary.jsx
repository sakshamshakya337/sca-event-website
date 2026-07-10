import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'Inter, system-ui, sans-serif', background: '#FFF8F3', minHeight: '100vh', color: '#1E1B18' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Something went wrong</h1>
          <pre style={{ background: '#F3EDE8', padding: '16px', borderRadius: '8px', overflow: 'auto', fontSize: '14px' }}>
            {this.state.error?.message}
          </pre>
          <pre style={{ background: '#F3EDE8', padding: '16px', borderRadius: '8px', marginTop: '8px', overflow: 'auto', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '16px', padding: '10px 20px', background: '#994700', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
          >
            Reload Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
