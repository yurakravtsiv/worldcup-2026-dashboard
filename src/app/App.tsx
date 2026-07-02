import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/app/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { GroupDetailPage } from '@/pages/GroupDetailPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/groups/:groupName" element={<GroupDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
