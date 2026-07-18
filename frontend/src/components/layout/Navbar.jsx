import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import Avatar from "../ui/Avatar";
import "./Navbar.css";

const NAV = [
  {
    to: "/",
    label: "Feed",
    end: true,
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    to: "/connections",
    label: "Network",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    to: "/suggestions",
    label: "Discover",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    to: "/profile/me",
    label: "Profile",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { show } = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    show("Signed out. See you soon.", "info");
    navigate("/login");
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar__inner">
          <Link to="/" className="navbar__brand">
            {/* <div className="navbar__logo">n</div> */}
            {/* Option 1: Isse HTML logo div ki jagah replace karein */}
<div className="navbar__logo-container">
  <svg width="34" height="34" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="netlink-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0a66c2" /> {/* LinkedIn Classic Blue */}
        <stop offset="100%" stopColor="#004182" /> {/* Deep Premium Blue */}
      </linearGradient>
    </defs>
    {/* Background Premium Squircle */}
    <rect width="32" height="32" rx="8" fill="url(#netlink-grad)" />
    {/* Geometric NetLink "n" & Link structure */}
    <path 
      d="M9 23V14C9 11.2386 11.2386 9 14 9C16.7614 9 19 11.2386 19 14V23" 
      stroke="#FFFFFF" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
    />
    <path 
      d="M19 15C19 12.2386 21.2386 10 24 10" 
      stroke="#FFFFFF" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
    />
    {/* Central Connection Node */}
    <circle cx="19" cy="14" r="2" fill="#004182" />
  </svg>
</div>
            <span className="navbar__brand-name">NetLink</span>
          </Link>

          <div className="navbar__links">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `navbar__link ${isActive ? "navbar__link--active" : ""}`
                }
              >
                <span className="navbar__link-icon">{n.icon}</span>
                <span className="navbar__link-label">{n.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="navbar__actions" ref={menuRef}>
            <button
              className="navbar__theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle light/dark theme"
              title={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button
              className="navbar__user-btn"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
            >
              <Avatar src={user?.profilePic} name={user?.name} size={32} />
              <div className="navbar__user-info">
                <span className="navbar__user-name">
                  {user?.name?.split(" ")[0]}
                </span>
              </div>
              <svg
                className={`navbar__chevron ${menuOpen ? "navbar__chevron--open" : ""}`}
                width="12"
                height="12"
                viewBox="0 0 12 8"
                fill="none"
              >
                <path
                  d="M1 1l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {menuOpen && (
              <div className="navbar__dropdown anim-fadeDown">
                <div className="navbar__dropdown-profile">
                  <Avatar src={user?.profilePic} name={user?.name} size={44} />
                  <div>
                    <p className="navbar__dropdown-name">{user?.name}</p>
                    <p className="navbar__dropdown-email">{user?.email}</p>
                  </div>
                </div>
                <div className="navbar__dropdown-divider" />
                <button
                  className="navbar__dropdown-item"
                  onClick={() => {
                    navigate("/profile/me");
                    setMenuOpen(false);
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  View Profile
                </button>
                <button
                  className="navbar__dropdown-item navbar__dropdown-item--danger"
                  onClick={handleLogout}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
          <button
            className={`navbar__hamburger ${mobileOpen ? "navbar__hamburger--open" : ""}`}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
        {mobileOpen && (
          <div className="navbar__mobile anim-fadeDown">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `navbar__mobile-link ${isActive ? "navbar__mobile-link--active" : ""}`
                }
                onClick={() => setMobileOpen(false)}
              >
                {n.icon} {n.label}
              </NavLink>
            ))}
            <button className="navbar__mobile-logout" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        )}
      </nav>
    </>
  );
}
