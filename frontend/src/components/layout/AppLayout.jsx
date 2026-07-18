import { useState, useEffect, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { Zap, Globe, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { profileApi, connectionApi } from "../../api";
import { onConnectionsChanged } from "../../utils/connectionEvents";
import Avatar from "../ui/Avatar";
import "./AppLayout.css";

const NAV_ITEMS = [
  { to: "/", label: "Home Feed", end: true, Icon: Zap },
  { to: "/connections", label: "My Network", Icon: Globe },
  { to: "/suggestions", label: "Discover People", Icon: Sparkles },
];

export default function AppLayout({ children, rightPanel }) {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [profile, setProfile] = useState(null);
  const [connections, setConnections] = useState(0);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    profileApi
      .getMe()
      .then((r) => setProfile(r.data.currentUser))
      .catch(() => {});
  }, []);
  const refetchStats = useCallback(() => {
    if (!user) return;
    connectionApi
      .getConnections(1, 1, "accept")
      .then((r) => setConnections(r.data.data?.totalDocs ?? 0))
      .catch(() => {});
    connectionApi
      .getConnections(1, 100, "pending")
      .then((r) => {
        const incoming = (r.data.data?.docs || []).filter(
          (c) => c.receiver._id === user._id,
        );
        setPending(incoming.length);
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    refetchStats();
  }, [refetchStats]);

  useEffect(() => onConnectionsChanged(refetchStats), [refetchStats]);

  useEffect(() => {
    if (!socket) return;
    socket.on("connection-update", refetchStats);
    return () => socket.off("connection-update", refetchStats);
  }, [socket, refetchStats]);

  const isOnline = user && onlineUsers.has(user._id);

  return (
    <div className="app-layout">
      <aside className="app-layout__sidebar">
        <NavLink to="/profile/me" className="sidebar-card">
          <div className="sidebar-card__cover" />
          <div className="sidebar-card__avatar-wrap">
            <Avatar
              src={user?.profilePic}
              name={user?.name}
              size={62}
              ring
              className="sidebar-card__avatar"
            />
            {isOnline && (
              <span className="status-dot status-dot--online" title="Online" />
            )}
          </div>
          <div className="sidebar-card__info">
            <h3 className="sidebar-card__name">{user?.name}</h3>
            <p className="sidebar-card__bio line-clamp-2">
              {profile?.bio || user?.bio || "Add a bio to your profile"}
            </p>
          </div>
          <div className="sidebar-card__stats">
            <div className="sidebar-stat">
              <span className="sidebar-stat__val">{connections}</span>
              <span className="sidebar-stat__key">Connections</span>
            </div>
            <div className="sidebar-stat sidebar-stat--highlight">
              <span className="sidebar-stat__val">{pending}</span>
              <span className="sidebar-stat__key">Pending</span>
            </div>
          </div>
        </NavLink>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `sidebar-nav__link ${isActive ? "sidebar-nav__link--active" : ""}`
              }
            >
              <span className="sidebar-nav__icon">
                <item.Icon size={17} strokeWidth={1.75} />
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="app-layout__main">{children}</main>

      {rightPanel && <aside className="app-layout__right">{rightPanel}</aside>}
    </div>
  );
}
