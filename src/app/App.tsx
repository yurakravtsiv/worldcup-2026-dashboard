import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/app/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { GroupDetailPage } from '@/pages/GroupDetailPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/table" replace />} />
          <Route path="table" element={<DashboardPage />} />
          <Route path="insights" element={<DashboardPage />} />
          <Route path="groups/:groupName" element={<GroupDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
