import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';

export default function AppLayout({ auth }) {
  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', 
      overflow: 'hidden', backgroundColor: 'var(--color-bg-base)'
    }}>
      <Topbar auth={auth} />
      <main style={{ flex: 1, marginTop: '60px', position: 'relative', height: 'calc(100vh - 60px)' }}>
        <Outlet />
      </main>
    </div>
  );
}
