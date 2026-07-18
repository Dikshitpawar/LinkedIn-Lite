import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { postApi, connectionApi } from "../api";
import AppLayout from "../components/layout/AppLayout";
import CreatePost from "../components/feed/CreatePost";
import PostCard from "../components/feed/PostCard";
import { PostSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import "./FeedPage.css";

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    postApi
      .getAll()
      .then((r) => setPosts(r.data.posts || []))
      .catch(() => setError("Unable to load the feed right now."))
      .finally(() => setLoading(false));

    connectionApi
      .getSuggestions()
      .then((r) => setSuggestions((r.data.data?.docs || []).slice(0, 4)))
      .catch(() => {});
  }, []);

  const handleCreated = (post) => setPosts((p) => [post, ...p]);
  const handleDelete = (id) =>
    setPosts((p) => p.filter((post) => post._id !== id));

  return (
    <AppLayout
      rightPanel={
        <div className="feed-side">
          <div className="feed-side__card">
            <div className="feed-side__card-head">
              <h3>Suggested for you</h3>
              <Link to="/suggestions" className="feed-side__link">
                See all
              </Link>
            </div>
            {suggestions.length === 0 ? (
              <p className="feed-side__empty">No suggestions right now</p>
            ) : (
              <div className="feed-side__people">
                {suggestions.map((u) => (
                  <Link
                    to={`/profile/${u._id}`}
                    key={u._id}
                    className="feed-side__person"
                  >
                    <Avatar src={u.profilePic} name={u.name} size={38} />
                    <div className="feed-side__person-info">
                      <span className="feed-side__person-name">{u.name}</span>
                      <span className="feed-side__person-bio line-clamp-2">
                        {u.bio || "NetLink member"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="feed-side__card feed-side__card--gradient">
            <h3>✨ Grow your network</h3>
            <p>
              Connect with professionals who share your interests and goals.
            </p>
            <Link to="/suggestions">
              <Button variant="mint" size="sm" fullWidth>
                Discover People
              </Button>
            </Link>
          </div>

          <p className="feed-side__footer">
            NetLink © {new Date().getFullYear()} · Built for builders
          </p>
        </div>
      }
    >
      <CreatePost onCreated={handleCreated} />

      {loading && (
        <>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </>
      )}

      {!loading && error && (
        <EmptyState
          emoji="📡"
          title="Connection trouble"
          subtitle={error}
          action={
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          }
        />
      )}

      {!loading && !error && posts.length === 0 && (
        <EmptyState
          emoji="🌱"
          title="Your feed is empty"
          subtitle="Be the first to share an update, idea, or milestone with the community."
        />
      )}

      {!loading &&
        posts.map((post, i) => (
          <PostCard key={post._id} post={post} onDelete={handleDelete} />
        ))}
    </AppLayout>
  );
}
