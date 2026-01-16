import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import apiService from './services/api'

function App() {
  const [count, setCount] = useState(0)
  const [apiStatus, setApiStatus] = useState<{
    connected: boolean;
    message: string;
    loading: boolean;
    error: string | null;
  }>({
    connected: false,
    message: '',
    loading: true,
    error: null,
  })

  useEffect(() => {
    // Test API connection on component mount
    testApiConnection()
  }, [])

  const testApiConnection = async () => {
    try {
      setApiStatus(prev => ({ ...prev, loading: true, error: null }))
      const response = await apiService.ping()
      setApiStatus({
        connected: true,
        message: response.message,
        loading: false,
        error: null,
      })
    } catch (error) {
      setApiStatus({
        connected: false,
        message: '',
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to connect to API',
      })
    }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Nepal Cozy Care</h1>
      
      {/* API Connection Status */}
      <div className="card">
        <h2>Backend Connection Status</h2>
        {apiStatus.loading ? (
          <p>Connecting to backend...</p>
        ) : apiStatus.connected ? (
          <div style={{ color: 'green' }}>
            <p>✅ {apiStatus.message}</p>
            <p style={{ fontSize: '0.9em', color: '#666' }}>
              Backend API is connected successfully!
            </p>
          </div>
        ) : (
          <div style={{ color: 'red' }}>
            <p>❌ Connection Failed</p>
            <p style={{ fontSize: '0.9em' }}>{apiStatus.error}</p>
            <button onClick={testApiConnection} style={{ marginTop: '10px' }}>
              Retry Connection
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
