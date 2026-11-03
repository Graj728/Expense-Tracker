import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/transactions', label: 'Transactions' },
  { to: '/groups', label: 'Groups' },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-ledger-bg">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-ledger-primary flex items-center justify-center font-display font-bold text-white text-lg">
              E
            </div>
            <div>
              <p className="font-display text-lg text-ledger-ink leading-none">ExpCome Flow</p>
              <p className="text-[11px] uppercase tracking-widest text-ledger-inkFaint mt-0.5">
                Income · Expenses · Splits
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-ledger-paperDark rounded-full p-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-ledger-primary text-white'
                      : 'text-ledger-inkFaint hover:text-ledger-ink'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-ledger-inkFaint">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm px-4 py-2 rounded-full border border-ledger-rule text-ledger-ink hover:bg-ledger-paperDark transition-colors"
            >
              Log out
            </button>
          </div>
        </header>

        <nav className="flex md:hidden gap-1 pb-4 -mt-2 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                  isActive ? 'bg-ledger-primary text-white' : 'bg-ledger-paperDark text-ledger-inkFaint'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="pb-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
