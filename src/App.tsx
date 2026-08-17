import { Navigate, Route, Routes } from 'react-router';
import { PortfolioProvider } from './context/PortfolioContext';
import { Layout } from './components/Layout';
import { AboutPage } from './pages/AboutPage';
import { FundingPage } from './pages/FundingPage';
import { HowToPage } from './pages/HowToPage';
import { OutputsPage } from './pages/OutputsPage';
import { OverviewPage } from './pages/OverviewPage';
import { PortfolioProfilePage } from './pages/PortfolioProfilePage';
import { ProjectsPage } from './pages/ProjectsPage';

export function App() {
  return (
    <PortfolioProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<OverviewPage />} />
          <Route path="funding" element={<FundingPage />} />
          <Route path="profile" element={<PortfolioProfilePage />} />
          <Route path="outputs" element={<OutputsPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="how-to" element={<HowToPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </PortfolioProvider>
  );
}
