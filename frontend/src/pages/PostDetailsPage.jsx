import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { postApi } from "../api";
import AppLayout from "../components/layout/AppLayout";
import PostCard from "../components/feed/PostCard";
import { PostSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import "./PostDetailsPage.css";

export default function PostDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    postApi
      .getById(id)
      .then((r) => setPost(r.data.post))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <AppLayout>
      <button className="post-details__back" onClick={() => navigate(-1)}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back
      </button>

      {loading && <PostSkeleton />}

      {!loading && error && (
        <EmptyState
          emoji="🔍"
          title="Post not found"
          subtitle="This post may have been deleted or doesn't exist."
          action={
            <Link to="/">
              <Button variant="outline">Back to Feed</Button>
            </Link>
          }
        />
      )}

      {!loading && post && (
        <PostCard post={post} compact onDelete={() => navigate("/")} />
      )}
    </AppLayout>
  );
}
