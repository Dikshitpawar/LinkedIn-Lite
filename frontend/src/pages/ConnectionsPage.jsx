import { useState, useEffect, useCallback } from "react";
import { connectionApi } from "../api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import AppLayout from "../components/layout/AppLayout";
import PersonCard from "../components/network/PersonCard";
import { PersonSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import "./ConnectionsPage.css";

const TABS = [
  { key: "connections", label: "My Connections" },
  { key: "incoming", label: "Requests Received" },
  { key: "sent", label: "Requests Sent" },
];
function otherPerson(record, myId) {
  const isSender = record.sender._id === myId;
  return isSender ? record.receiver : record.sender;
}

export default function ConnectionsPage() {
  const { user, refreshUser } = useAuth();
  const { socket } = useSocket();
  const [tab, setTab] = useState("connections");
  const [connections, setConnections] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);

    Promise.all([
      connectionApi.getConnections(1, 50, "accept"),
      connectionApi.getConnections(1, 50, "pending"),
    ])
      .then(([acceptedRes, pendingRes]) => {
        const acceptedDocs = acceptedRes.data.data?.docs || [];
        setConnections(acceptedDocs.map((r) => otherPerson(r, user._id)));

        const pendingDocs = pendingRes.data.data?.docs || [];
        setIncoming(
          pendingDocs
            .filter((r) => r.receiver._id === user._id)
            .map((r) => r.sender),
        );
        setSent(
          pendingDocs
            .filter((r) => r.sender._id === user._id)
            .map((r) => r.receiver),
        );
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    if (!socket) return;
    socket.on("connection-update", load);
    return () => socket.off("connection-update", load);
  }, [socket, load]);

  const handleChange = (personId, newStatus) => {
    if (newStatus === "connected") {
      const person = incoming.find((u) => u._id === personId);
      setIncoming((p) => p.filter((u) => u._id !== personId));
      if (person) setConnections((p) => [person, ...p]);
      refreshUser();
    }
    if (newStatus === "declined") {
      setIncoming((p) => p.filter((u) => u._id !== personId));
    }
    if (newStatus === "suggestion") {
      setConnections((p) => p.filter((u) => u._id !== personId));
    }
  };

  const lists = { connections, incoming, sent };
  const statusMap = {
    connections: "connected",
    incoming: "incoming",
    sent: "pending",
  };
  const activeList = lists[tab];

  const emptyConfig = {
    connections: {
      emoji: "🌐",
      title: "No connections yet",
      subtitle:
        "Start building your network by connecting with people in Discover.",
    },
    incoming: {
      emoji: "📬",
      title: "No pending requests",
      subtitle: "When someone wants to connect, you'll see their request here.",
    },
    sent: {
      emoji: "📤",
      title: "No sent requests",
      subtitle: "Requests you've sent will appear here until they respond.",
    },
  };

  return (
    <AppLayout
      rightPanel={
        <div className="conn-side">
          <div className="conn-side__card">
            <h3>Network Overview</h3>
            <div className="conn-stat-row">
              <span>Connections</span>
              <b>{connections.length}</b>
            </div>
            <div className="conn-stat-row">
              <span>Pending Requests</span>
              <b>{incoming.length}</b>
            </div>
            <div className="conn-stat-row">
              <span>Sent Requests</span>
              <b>{sent.length}</b>
            </div>
          </div>
        </div>
      }
    >
      <div className="conn-header anim-fadeUp">
        <h1>My Network</h1>
        <p>Manage your connections and pending requests</p>
      </div>

      <div className="conn-tabs anim-fadeUp stagger-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`conn-tab ${tab === t.key ? "conn-tab--active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {t.key === "incoming" && incoming.length > 0 && (
              <span className="conn-tab__badge">{incoming.length}</span>
            )}
            {t.key === "connections" && (
              <span className="conn-tab__count">{connections.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="conn-grid">
        {loading && [...Array(4)].map((_, i) => <PersonSkeleton key={i} />)}

        {!loading && activeList.length === 0 && (
          <EmptyState {...emptyConfig[tab]} />
        )}

        {!loading &&
          activeList.map((person) => (
            <PersonCard
              key={person._id}
              person={person}
              status={statusMap[tab]}
              onChange={handleChange}
            />
          ))}
      </div>
    </AppLayout>
  );
}
