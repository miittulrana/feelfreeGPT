import { signOut } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav id="navbar">
      <div id="navbar-content">
        <h1 id="navbar-title">FeelFreeGPT</h1>
        <button
          onClick={handleLogout}
          id="logout-button"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;