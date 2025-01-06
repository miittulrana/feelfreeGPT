import Navbar from './navbar/Navbar';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const showNavbar = location.pathname !== '/login';

  return (
    <div className="min-h-screen bg-gray-50">
      {showNavbar && <Navbar />}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
};

export default Layout;