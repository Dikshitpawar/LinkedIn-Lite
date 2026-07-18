import "./Skeleton.css";

export default function Skeleton({
  w,
  h,
  circle = false,
  className = "",
  style = {},
}) {
  return (
    <div
      aria-hidden
      className={`skel ${circle ? "skel--circle" : ""} ${className}`}
      style={{ width: w, height: h, ...style }}
    />
  );
}

export function PostSkeleton() {
  return (
    <div className="post-skel anim-fadeIn">
      <div className="post-skel__header">
        <Skeleton circle w={44} h={44} />
        <div className="post-skel__meta">
          <Skeleton w="45%" h={13} />
          <Skeleton w="28%" h={11} style={{ marginTop: 6 }} />
        </div>
      </div>
      <Skeleton w="80%" h={13} style={{ marginTop: 14 }} />
      <Skeleton w="60%" h={13} style={{ marginTop: 7 }} />
      <Skeleton w="100%" h={220} style={{ marginTop: 14, borderRadius: 12 }} />
      <div className="post-skel__actions">
        <Skeleton w={80} h={32} style={{ borderRadius: 99 }} />
        <Skeleton w={80} h={32} style={{ borderRadius: 99 }} />
      </div>
    </div>
  );
}

export function PersonSkeleton() {
  return (
    <div className="person-skel anim-fadeIn">
      <Skeleton circle w={52} h={52} />
      <div style={{ flex: 1 }}>
        <Skeleton w="55%" h={13} />
        <Skeleton w="70%" h={11} style={{ marginTop: 6 }} />
      </div>
      <Skeleton w={90} h={32} style={{ borderRadius: 99 }} />
    </div>
  );
}

export function ProfileHeroSkeleton() {
  return (
    <div className="profile-hero-skel anim-fadeIn">
      <Skeleton w="100%" h={160} style={{ borderRadius: "14px 14px 0 0" }} />
      <div className="profile-hero-skel__body">
        <Skeleton
          circle
          w={88}
          h={88}
          style={{ marginTop: -44, border: "4px solid var(--surface-2)" }}
        />
        <Skeleton w={180} h={18} style={{ marginTop: 14 }} />
        <Skeleton w={240} h={13} style={{ marginTop: 8 }} />
        <Skeleton w={140} h={13} style={{ marginTop: 6 }} />
      </div>
    </div>
  );
}
