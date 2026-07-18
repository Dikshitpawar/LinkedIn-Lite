import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { profileApi, postApi, connectionApi } from "../api";
import { notifyConnectionsChanged } from "../utils/connectionEvents";
import AppLayout from "../components/layout/AppLayout";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import PostCard from "../components/feed/PostCard";
import { PostSkeleton, ProfileHeroSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import { parseSkills } from "../utils/helpers";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { id } = useParams();
  const { user: me, updateUser } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();

  const isMe = !id || id === "me" || id === me?._id;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [connBusy, setConnBusy] = useState(false);
  const [removeHover, setRemoveHover] = useState(false);
  const [myConnectionsCount, setMyConnectionsCount] = useState(0);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  /* Load profile */
  useEffect(() => {
    setLoading(true);
    const req = isMe ? profileApi.getMe() : profileApi.getUser(id);
    req
      .then((r) => {
        const u = isMe ? r.data.currentUser : r.data.user;
        setProfile(u);
        setEditForm({
          name: u.name || "",
          bio: u.bio || "",
          skills: parseSkills(u.skills).join(", "),
          education: u.education || "",
          experience: u.experience || "",
        });
      })
      .catch(() => show("Could not load profile", "error"))
      .finally(() => setLoading(false));
  }, [id, isMe]);

  useEffect(() => {
    if (!isMe) return;
    connectionApi
      .getConnections(1, 1, "accept")
      .then((r) => setMyConnectionsCount(r.data.data?.totalDocs ?? 0))
      .catch(() => {});
  }, [isMe]);

  useEffect(() => {
    if (isMe || !me || !id) return;
    let cancelled = false;
    setConnectionStatus(null);

    Promise.all([
      connectionApi.getConnections(1, 200, "accept"),
      connectionApi.getConnections(1, 200, "pending"),
    ])
      .then(([acceptedRes, pendingRes]) => {
        if (cancelled) return;
        const accepted = acceptedRes.data.data?.docs || [];
        const pending = pendingRes.data.data?.docs || [];

        const isConnected = accepted.some(
          (r) => r.sender._id === id || r.receiver._id === id,
        );
        if (isConnected) return setConnectionStatus("connected");

        const sentToThem = pending.find(
          (r) => r.sender._id === me._id && r.receiver._id === id,
        );
        if (sentToThem) return setConnectionStatus("pending");

        const receivedFromThem = pending.find(
          (r) => r.receiver._id === me._id && r.sender._id === id,
        );
        if (receivedFromThem) return setConnectionStatus("incoming");

        setConnectionStatus("none");
      })
      .catch(() => !cancelled && setConnectionStatus("none"));

    return () => {
      cancelled = true;
    };
  }, [id, me, isMe]);

  useEffect(() => {
    setPostsLoading(true);
    postApi
      .getAll()
      .then((r) => {
        const targetId = isMe ? me?._id : id;
        setPosts((r.data.posts || []).filter((p) => p.user?._id === targetId));
      })
      .catch(() => {})
      .finally(() => setPostsLoading(false));
  }, [id, isMe, me]);

  const handleDelete = (postId) =>
    setPosts((p) => p.filter((post) => post._id !== postId));

  const openEdit = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setEditOpen(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", editForm.name);
      fd.append("bio", editForm.bio);
      fd.append("skills", editForm.skills);
      fd.append("education", editForm.education);
      fd.append("experience", editForm.experience);
      if (avatarFile) fd.append("file", avatarFile);

      const res = await profileApi.updateMe(fd);
      setProfile(res.data.profile);
      updateUser(res.data.profile);
      setEditOpen(false);
      show("Profile updated successfully", "success");
    } catch (err) {
      show(err.response?.data?.message || "Update failed", "error");
    } finally {
      setSaving(false);
    }
  };
  const handleConnect = async () => {
    setConnBusy(true);
    try {
      await connectionApi.sendRequest(id);
      setConnectionStatus("pending");
      show("Connection request sent", "success");
      notifyConnectionsChanged();
    } catch (err) {
      show(err.response?.data?.message || "Failed", "error");
    } finally {
      setConnBusy(false);
    }
  };
  const handleAccept = async () => {
    setConnBusy(true);
    try {
      await connectionApi.acceptRequest(id);
      setConnectionStatus("connected");
      show("Connection accepted", "success");
      notifyConnectionsChanged();
    } catch (err) {
      show("Failed", "error");
    } finally {
      setConnBusy(false);
    }
  };
  const handleRemove = async () => {
    setConnBusy(true);
    try {
      await connectionApi.removeConnection(id);
      setConnectionStatus("none");
      setRemoveHover(false);
      show("Connection removed", "info");
      notifyConnectionsChanged();
    } catch (err) {
      show("Failed", "error");
    } finally {
      setConnBusy(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <ProfileHeroSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <EmptyState
          emoji="🔍"
          title="Profile not found"
          subtitle="This user doesn't exist or was removed."
        />
      </AppLayout>
    );
  }

  const skills = parseSkills(profile.skills);
  const displayName = isMe ? me?.name : profile.name;
  const displayPic = isMe ? me?.profilePic : profile.profilePic;

  return (
    <AppLayout
      rightPanel={
        <div className="profile-side">
          <div className="profile-side__card">
            <h3>Profile Strength</h3>
            <div className="profile-strength">
              {[
                { label: "Profile photo", done: !!profile.profilePic },
                { label: "Bio added", done: !!profile.bio },
                { label: "Skills listed", done: skills.length > 0 },
                { label: "Experience added", done: !!profile.experience },
                { label: "Education added", done: !!profile.education },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`profile-strength__item ${item.done ? "done" : ""}`}
                >
                  <span className="profile-strength__check">
                    {item.done ? "✓" : "○"}
                  </span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <div className="profile-hero anim-fadeUp">
        <div className="profile-hero__cover">
          <div className="profile-hero__cover-pattern" />
        </div>

        <div className="profile-hero__body">
          <div className="profile-hero__top">
            <Avatar
              src={displayPic}
              name={displayName}
              size={92}
              ring
              className="profile-hero__avatar"
            />

            <div className="profile-hero__actions">
              {isMe ? (
                <Button
                  variant="secondary"
                  onClick={openEdit}
                  icon={
                    <svg
                      width="15"
                      height="15"
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
                  }
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  {connectionStatus === "none" && (
                    <Button
                      variant="primary"
                      loading={connBusy}
                      onClick={handleConnect}
                    >
                      + Connect
                    </Button>
                  )}
                  {connectionStatus === "pending" && (
                    <Button variant="secondary" disabled>
                      Request Sent
                    </Button>
                  )}
                  {connectionStatus === "incoming" && (
                    <Button
                      variant="primary"
                      loading={connBusy}
                      onClick={handleAccept}
                    >
                      Accept Request
                    </Button>
                  )}
                  {connectionStatus === "connected" && !removeHover && (
                    <Button
                      variant="secondary"
                      onClick={() => setRemoveHover(true)}
                    >
                      Connected ✓ · Disconnect
                    </Button>
                  )}
                  {connectionStatus === "connected" && removeHover && (
                    <div className="profile-hero__confirm-row">
                      <span>Remove connection?</span>
                      <Button
                        variant="danger"
                        loading={connBusy}
                        onClick={handleRemove}
                      >
                        Yes
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setRemoveHover(false)}
                      >
                        No
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="profile-hero__info">
            <h1>{displayName}</h1>
            <p className="profile-hero__bio">
              {profile.bio ||
                (isMe
                  ? "Add a bio to tell people about yourself."
                  : "No bio yet.")}
            </p>

            <div className="profile-hero__meta">
              {isMe && (
                <span className="profile-hero__meta-item">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87" />
                    <path d="M16 3.13a4 4 0 010 7.75" />
                  </svg>
                  {myConnectionsCount} connections
                </span>
              )}
              <span className="profile-hero__meta-item">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                </svg>
                {posts.length} posts
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-details anim-fadeUp stagger-2">
        <div className="profile-detail-card">
          <h3>Experience</h3>
          <p>{profile.experience || "Not specified yet."}</p>
        </div>
        <div className="profile-detail-card">
          <h3>Education</h3>
          <p>{profile.education || "Not specified yet."}</p>
        </div>
        <div className="profile-detail-card profile-detail-card--full">
          <h3>Skills</h3>
          {skills.length > 0 ? (
            <div className="profile-skills">
              {skills.map((s, i) => (
                <span key={i} className="profile-skill-tag">
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p>No skills listed yet.</p>
          )}
        </div>
      </div>

      <div className="profile-posts-header anim-fadeUp stagger-3">
        <h2>Posts</h2>
      </div>

      {postsLoading && (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      )}

      {!postsLoading && posts.length === 0 && (
        <EmptyState
          emoji="📝"
          title={
            isMe
              ? "You haven't posted yet"
              : `${profile.name} hasn't posted yet`
          }
          subtitle={
            isMe
              ? "Share your first update with the community from the feed."
              : "Check back later for updates."
          }
          action={
            isMe && (
              <Button variant="outline" onClick={() => navigate("/")}>
                Go to Feed
              </Button>
            )
          }
        />
      )}

      {!postsLoading &&
        posts.map((post) => (
          <PostCard key={post._id} post={post} onDelete={handleDelete} />
        ))}

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Your Profile"
        size="lg"
      >
        <div className="edit-profile">
          <div className="edit-profile__avatar-section">
            <Avatar
              src={avatarPreview || me?.profilePic}
              name={me?.name}
              size={80}
            />
            <div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileRef.current?.click()}
              >
                Change Photo
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          <div className="edit-profile__grid">
            <Input
              label="Full Name"
              value={editForm.name}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, name: e.target.value }))
              }
            />

            <Input
              label="Skills"
              placeholder="React, Node.js, UI/UX (comma separated)"
              value={editForm.skills}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, skills: e.target.value }))
              }
            />

            <div className="edit-profile__full-width">
              <Input
                label="Bio"
                textarea
                rows={3}
                placeholder="A short headline about yourself"
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, bio: e.target.value }))
                }
              />
            </div>

            <div className="edit-profile__full-width">
              <Input
                label="Experience"
                textarea
                rows={3}
                placeholder="e.g. Software Engineer at Acme Inc. (2021–Present)"
                value={editForm.experience}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, experience: e.target.value }))
                }
              />
            </div>

            <div className="edit-profile__full-width">
              <Input
                label="Education"
                textarea
                rows={3}
                placeholder="e.g. B.Tech in Computer Science, XYZ University"
                value={editForm.education}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, education: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="edit-profile__actions">
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={saving} onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
