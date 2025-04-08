import { Link } from 'react-router-dom';

function NavBar() {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                Countdown Vibes
              </Link>
            </div>
          </div>
          {/* Login/Logout and Sign Up buttons removed as they are available in the bottom navigation bar */}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;