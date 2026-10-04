import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import { WorkspaceProvider } from './context/WorkspaceContext'
import Shell from './components/workspace/Shell'
import Overview from './pages/workspace/Overview'
import Scenes from './pages/workspace/Scenes'
import Analyze from './pages/workspace/Analyze'
import Compare from './pages/workspace/Compare'
import Change from './pages/workspace/Change'
import Landcover from './pages/workspace/Landcover'
import Spectral from './pages/workspace/Spectral'
import Objects from './pages/workspace/Objects'
import Evidence from './pages/workspace/Evidence'
import Reports from './pages/workspace/Reports'
import History from './pages/workspace/History'
import Settings from './pages/workspace/Settings'

export default function App() {
  return (
    <WorkspaceProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Shell />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="scenes" element={<Scenes />} />
          <Route path="analyze" element={<Analyze />} />
          <Route path="compare" element={<Compare />} />
          <Route path="change" element={<Change />} />
          <Route path="landcover" element={<Landcover />} />
          <Route path="spectral" element={<Spectral />} />
          <Route path="objects" element={<Objects />} />
          <Route path="evidence" element={<Evidence />} />
          <Route path="reports" element={<Reports />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </WorkspaceProvider>
  )
}
