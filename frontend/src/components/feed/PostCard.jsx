import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { useToast } from "../../context/ToastContext";
import { postApi } from "../../api";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import { timeAgo } from "../../utils/helpers";
import "./PostCard.css";

export default function PostCard({
  post: initialPost,
  onDelete,
  compact = false,
}) {
  const { user } = useAuth();
  const { show } = useToast();
  const { socket, joinPostRoom, leavePostRoom } = useSocket();
  const navigate = useNavigate();

  const [post, setPost] = useState(initialPost);

  useEffect(() => {
    if (!socket) return;
    joinPostRoom(post._id);

    const onLikeUpdate = (payload) => {
      if (payload.postId !== post._id) return;
      setPost((p) => {
        const already = p.likes?.some(
          (id) => (id?._id ?? id) === payload.userId,
        );
        if (payload.liked === already) return p;
        const likes = payload.liked
          ? [...(p.likes ?? []), payload.userId]
          : (p.likes ?? []).filter((id) => (id?._id ?? id) !== payload.userId);
        return { ...p, likes };
      });
    };

    const onNewComment = (payload) => {
      if (payload.postId !== post._id) return;
      setPost((p) => {
        const exists = p.comments?.some((c) => c._id === payload.comment._id);
        if (exists) return p;
        return { ...p, comments: [...(p.comments ?? []), payload.comment] };
      });
    };

    socket.on("like-update", onLikeUpdate);
    socket.on("new-comment", onNewComment);

    return () => {
      leavePostRoom(post._id);
      socket.off("like-update", onLikeUpdate);
      socket.off("new-comment", onNewComment);
    };
  }, [socket, post._id]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [liking, setLiking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content || "");
  const [editLoading, setEditLoading] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(post.image || "");
  const [removeExistingImage, setRemoveExistingImage] = useState(false);

  const isOwner = user && post.user?._id === user._id;
  const isLiked =
    user && post.likes?.some((id) => id === user._id || id?._id === user._id);
  const likeCount = post.likes?.length ?? 0;
  const commentCount = post.comments?.length ?? 0;
  const contentRef = useRef(null);
  const editFileRef = useRef(null);

  useEffect(() => {
    if (compact || !contentRef.current) return;
    const el = contentRef.current;
    setIsClamped(el.scrollHeight > el.clientHeight + 1);
  }, [post.content, compact]);

  useEffect(() => {
    if (!editOpen) return;
    setEditTitle(post.title);
    setEditContent(post.content || "");
    setEditImageFile(null);
    setEditImagePreview(post.image || "");
    setRemoveExistingImage(false);
  }, [editOpen, post.title, post.content, post.image]);

  const toggleLike = async () => {
    if (!user || liking) return;
    setLiking(true);
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 600);
    const wasLiked = isLiked;
    setPost((p) => ({
      ...p,
      likes: wasLiked
        ? p.likes.filter((id) => (id?._id ?? id) !== user._id)
        : [...(p.likes ?? []), user._id],
    }));

    try {
      const res = await postApi.like(post._id);
      const { liked } = res.data.post;
      setPost((p) => ({
        ...p,
        likes: liked
          ? [
              ...(p.likes ?? []).filter((id) => (id?._id ?? id) !== user._id),
              user._id,
            ]
          : (p.likes ?? []).filter((id) => (id?._id ?? id) !== user._id),
      }));
    } catch {
      setPost((p) => ({
        ...p,
        likes: wasLiked
          ? [...(p.likes ?? []), user._id]
          : p.likes.filter((id) => (id?._id ?? id) !== user._id),
      }));
    } finally {
      setLiking(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || commenting || !user) return;
    setCommenting(true);
    try {
      const res = await postApi.comment(post._id, commentText.trim());
      setPost(res.data.data);
      setCommentText("");
    } catch {
      show("Failed to post comment", "error");
    } finally {
      setCommenting(false);
    }
  };

  const handleDelete = () => {
    if (deleting || !user) return;
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await postApi.delete(post._id);
      onDelete?.(post._id);
      show("Post deleted", "success");
    } catch {
      show("Could not delete post", "error");
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  const handleEdit = async () => {
    if (!editTitle.trim()) return;
    setEditLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", editTitle.trim());
      fd.append("content", editContent.trim());
      if (editImageFile) {
        fd.append("file", editImageFile);
      } else if (removeExistingImage) {
        fd.append("removeImage", "true");
      }
      const res = await postApi.update(post._id, fd);
      setPost((p) => ({
        ...p,
        title: res.data.post.title,
        content: res.data.post.content,
        image: res.data.post.image,
      }));
      setEditImageFile(null);
      setRemoveExistingImage(false);
      setEditOpen(false);
      show("Post updated", "success");
    } catch {
      show("Update failed", "error");
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditImageFile(file);
    setRemoveExistingImage(false);
    setEditImagePreview(URL.createObjectURL(file));
  };

  const handleEditImageRemove = () => {
    setEditImageFile(null);
    setEditImagePreview("");
    setRemoveExistingImage(true);
  };

  return (
    <>
      <article
        className={`post-card anim-fadeUp ${compact ? "post-card--compact" : ""}`}
      >
        <div className="post-card__header">
          <Link to={`/profile/${post.user?._id}`} className="post-card__author">
            <Avatar
              src={post.user?.profilePic}
              name={post.user?.name}
              size={42}
            />
            <div className="post-card__author-meta">
              <span className="post-card__author-name">{post.user?.name}</span>
              <span className="post-card__timestamp">
                {timeAgo(post.createdAt)}
              </span>
            </div>
          </Link>

          <div className="post-card__controls">
            {isOwner && (
              <>
                <button
                  className="post-card__ctrl-btn"
                  onClick={() => setEditOpen(true)}
                  title="Edit"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  className="post-card__ctrl-btn post-card__ctrl-btn--danger"
                  onClick={handleDelete}
                  disabled={deleting}
                  title="Delete"
                >
                  {deleting ? (
                    "…"
                  ) : (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="post-card__body">
          <h2 className="post-card__title">{post.title}</h2>
          {post.content && (
            <>
              <p
                ref={contentRef}
                className={`post-card__content ${!compact && !expanded ? "line-clamp-3" : ""}`}
              >
                {post.content}
              </p>
              {!compact && (isClamped || expanded) && (
                <button
                  type="button"
                  className="post-card__see-more"
                  onClick={() => setExpanded((v) => !v)}
                >
                  {expanded ? "See less" : "See more"}
                </button>
              )}
            </>
          )}
        </div>

        {post.image && (
          <div
            className={`post-card__image-wrap ${imgLoaded ? "post-card__image-wrap--loaded" : ""}`}
          >
            <div className="post-card__image-skeleton skeleton-pulse" />
            <img
              src={post.image}
              alt={post.title}
              className="post-card__image"
              onLoad={() => setImgLoaded(true)}
            />
          </div>
        )}
        <div className="post-card__stats">
          <div className="post-card__stat-group">
            <span
              className={`post-card__stat-like-indicator ${isLiked ? "liked" : ""}`}
            >
              ♥
            </span>
            <span>
              {likeCount} {likeCount === 1 ? "like" : "likes"}
            </span>
          </div>
          <button
            className="post-card__stat-comments"
            onClick={() => setShowComments((v) => !v)}
          >
            {commentCount} {commentCount === 1 ? "comment" : "comments"}
          </button>
        </div>
        <div className="post-card__actions">
          <button
            className={`post-card__action ${isLiked ? "post-card__action--liked" : ""} ${likeAnim ? "post-card__action--pop" : ""}`}
            onClick={toggleLike}
            disabled={!user}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill={isLiked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            {isLiked ? "Liked" : "Like"}
          </button>

          <button
            className={`post-card__action ${showComments ? "post-card__action--active" : ""}`}
            onClick={() => setShowComments((v) => !v)}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            Comment
          </button>
        </div>
        {showComments && (
          <div className="post-card__comments anim-fadeUp">
            {/* Comment input */}
            {user && (
              <form
                className="post-card__comment-form"
                onSubmit={handleComment}
              >
                <Avatar src={user.profilePic} name={user.name} size={34} />
                <div className="post-card__comment-input-wrap">
                  <input
                    className="post-card__comment-input"
                    placeholder="Add a thoughtful comment…"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    maxLength={500}
                  />
                  {commentText && (
                    <button
                      type="submit"
                      className="post-card__comment-submit"
                      disabled={commenting}
                    >
                      {commenting ? (
                        "…"
                      ) : (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </form>
            )}
            <div className="post-card__comment-list">
              {commentCount === 0 && (
                <p className="post-card__no-comments">
                  No comments yet. Be the first!
                </p>
              )}
              {post.comments?.map((c, i) => (
                <div key={i} className="post-card__comment anim-fadeUp">
                  <Avatar
                    src={c.user?.profilePic}
                    name={c.user?.name}
                    size={32}
                  />
                  <div className="post-card__comment-bubble">
                    <span className="post-card__comment-name">
                      {c.user?.name}
                    </span>
                    <span className="post-card__comment-time">
                      {timeAgo(c.createdAt)}
                    </span>
                    <p className="post-card__comment-text">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Post"
        size="md"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          <Input
            label="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            maxLength={140}
          />
          <Input
            label="Content"
            textarea
            rows={5}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />

          <div className="post-edit-image">
            <label className="field__label">Image</label>
            {editImagePreview ? (
              <div className="post-edit-image__preview-wrap">
                <img
                  src={editImagePreview}
                  alt=""
                  className="post-edit-image__preview"
                />
                <button
                  type="button"
                  className="post-edit-image__remove"
                  onClick={handleEditImageRemove}
                  title="Remove image"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="post-edit-image__add"
                onClick={() => editFileRef.current?.click()}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                Add an image
              </button>
            )}
            <input
              ref={editFileRef}
              type="file"
              accept="image/*"
              onChange={handleEditImagePick}
              hidden
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "var(--space-2)",
              justifyContent: "flex-end",
            }}
          >
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={editLoading}
              onClick={handleEdit}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete post?"
        size="sm"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "14px",
              margin: 0,
            }}
          >
            This action cannot be undone. The post will be permanently removed.
          </p>
          <div
            style={{
              display: "flex",
              gap: "var(--space-2)",
              justifyContent: "flex-end",
            }}
          >
            <Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
