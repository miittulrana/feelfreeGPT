import Navbar from './navbar/Navbar';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const showNavbar = location.pathname !== '/login';

  return (
    <div id="layout">
      {showNavbar && <Navbar />}
      <main id="main-content">{children}</main>
    </div>
  );
};

export default Layout;