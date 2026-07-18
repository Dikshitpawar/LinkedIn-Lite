import { useState, useEffect } from "react";
import { connectionApi } from "../api";
import AppLayout from "../components/layout/AppLayout";
import PersonCard from "../components/network/PersonCard";
import { PersonSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import Input from "../components/ui/Input";
import "./SuggestionsPage.css";

export default function SuggestionsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    connectionApi
      .getSuggestions(1, 20)
      .then((r) => setUsers(r.data.data?.docs || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (id, status) => {
    if (status === "pending") {
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.bio?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AppLayout
      rightPanel={
        <div className="sugg-side">
          <div className="sugg-side__card">
            <h3>💡 Why connect?</h3>
            <ul className="sugg-side__list">
              <li>Expand your professional circle</li>
              <li>Stay updated on their posts</li>
              <li>Collaborate on new ideas</li>
              <li>Build meaningful relationships</li>
            </ul>
          </div>
        </div>
      }
    >
      <div className="sugg-header anim-fadeUp">
        <h1>Discover People</h1>
        <p>Grow your network with these recommended connections</p>
      </div>

      <div className="sugg-search anim-fadeUp stagger-1">
        <Input
          placeholder="Search by name or bio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          }
        />
      </div>

      <div className="sugg-grid">
        {loading && [...Array(6)].map((_, i) => <PersonSkeleton key={i} />)}

        {!loading && filtered.length === 0 && (
          <EmptyState
            emoji="🔭"
            title={search ? "No matches found" : "No suggestions right now"}
            subtitle={
              search
                ? "Try a different search term."
                : "You're connected with everyone we currently know about. Check back later!"
            }
          />
        )}

        {!loading &&
          filtered.map((person) => (
            <PersonCard
              key={person._id}
              person={person}
              status="suggestion"
              onChange={handleChange}
            />
          ))}
      </div>
    </AppLayout>
  );
}
