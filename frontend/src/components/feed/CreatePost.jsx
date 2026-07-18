import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { postApi } from "../../api";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import "./CreatePost.css";

export default function CreatePost({ onCreated }) {
  const { user } = useAuth();
  const { show } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file?.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Image must be under 8MB");
      return;
    }
    setError("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const reset = () => {
    setTitle("");
    setContent("");
    setImage(null);
    setPreview(null);
    setError("");
    setOpen(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("content", content.trim());
      if (image) fd.append("file", image);
      const res = await postApi.create(fd);
      onCreated?.(res.data.post);
      show("Post published", "success");
      reset();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`composer ${open ? "composer--open" : ""}`}>
      <div className="composer__trigger">
        <Avatar src={user?.profilePic} name={user?.name} size={42} />
        <button className="composer__trigger-btn" onClick={() => setOpen(true)}>
          Share something with your network, {user?.name?.split(" ")[0]}…
        </button>
      </div>
      {!open && (
        <div className="composer__quick">
          <button
            className="composer__quick-btn"
            onClick={() => {
              setOpen(true);
              setTimeout(() => fileRef.current?.click(), 100);
            }}
          >
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
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            Photo
          </button>
          <button className="composer__quick-btn" onClick={() => setOpen(true)}>
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
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Write Article
          </button>
        </div>
      )}
      {open && (
        <div className="composer__form anim-fadeUp">
          <input
            className="composer__title"
            placeholder="Give your post a headline *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={140}
            autoFocus
          />
          <textarea
            className="composer__content"
            placeholder="Share your thoughts, insights, or updates..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />

          {!preview ? (
            <div
              className={`composer__dropzone ${dragOver ? "composer__dropzone--over" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>
                Drop an image or <em>click to browse</em>
              </span>
              <span className="composer__dropzone-hint">
                PNG, JPG, WEBP up to 8MB • Required
              </span>
            </div>
          ) : (
            <div className="composer__preview">
              <img src={preview} alt="Preview" />
              <button
                className="composer__remove-img"
                onClick={removeImage}
                title="Remove image"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M1 1l12 12M13 1L1 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files[0])}
            hidden
          />

          {error && (
            <p className="composer__error">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </p>
          )}

          <div className="composer__actions">
            <div className="composer__char-count">{title.length}/140</div>
            <div className="composer__btns">
              <Button variant="ghost" size="sm" onClick={reset}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={loading}
                onClick={handleSubmit}
              >
                Publish Post
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
