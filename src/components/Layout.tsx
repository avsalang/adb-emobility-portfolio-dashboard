import {
  BatteryCharging,
  CircleHelp,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { usePortfolio } from '../context/PortfolioContext';
import { GlobalFilters } from './GlobalFilters';
import { ProjectDrawer } from './ProjectDrawer';

const NAV_ITEMS = [
  { to: '/', label: 'Portfolio overview', end: true },
  { to: '/funding', label: 'Funding & geography' },
  { to: '/profile', label: 'Technology profile' },
  { to: '/outputs', label: 'Outputs & KPIs' },
  { to: '/projects', label: 'Project explorer' },
  { to: '/about', label: 'About' },
];

export function Layout() {
  const { loading, error, selectedProject, setSelectedProject } = usePortfolio();
  const location = useLocation();
  const navRef = useRef<HTMLElement | null>(null);
  const pageScrollRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    pageScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  useEffect(() => {
    const nav = navRef.current;
    const activeLink = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !activeLink || nav.scrollWidth <= nav.clientWidth) return;

    const frame = requestAnimationFrame(() => {
      activeLink.scrollIntoView({
        behavior: 'auto',
        block: 'nearest',
        inline: 'center',
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-title">Navigation</div>
        <nav ref={navRef} className="sidebar-nav" aria-label="Portfolio views">
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span>{label}</span>
            </NavLink>
          ))}
          <NavLink
            to="/how-to"
            className={({ isActive }) =>
              `nav-link nav-link-guide${isActive ? ' active' : ''}`
            }
          >
            <CircleHelp size={17} aria-hidden="true" />
            <span>How to</span>
          </NavLink>
        </nav>
      </aside>

      <div className="main-shell">
        <header className="masthead">
          <img src={`${import.meta.env.BASE_URL}ato-observatory-logo.svg`} alt="Asian Transport Observatory" />
          <div className="masthead-rule" />
          <div className="product-title">
            <strong>ADB E-Mobility Portfolio</strong>
            <span>Funding, technology and project outputs across Asia and the Pacific</span>
          </div>
        </header>

        {!loading &&
          !error &&
          !['/about', '/how-to'].includes(location.pathname) &&
          <GlobalFilters />}
        <main ref={pageScrollRef} className="page-scroll">
          {loading && (
            <div className="state-panel">
              <BatteryCharging size={24} />
              <strong>Loading portfolio data</strong>
            </div>
          )}
          {error && (
            <div className="state-panel error">
              <strong>Portfolio data could not be loaded</strong>
              <span>{error}</span>
            </div>
          )}
          {!loading && !error && <Outlet />}
          <footer className="app-footer">
            <strong>Asian Transport Observatory</strong>
            <span>Source: Asian Development Bank project data</span>
          </footer>
        </main>
      </div>

      {selectedProject && (
        <ProjectDrawer
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}
