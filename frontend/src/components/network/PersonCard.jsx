import { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Check, X, UserMinus } from "lucide-react";
import { connectionApi } from "../../api";
import { useToast } from "../../context/ToastContext";
import { useSocket } from "../../context/SocketContext";
import { notifyConnectionsChanged } from "../../utils/connectionEvents";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import { parseSkills } from "../../utils/helpers";
import "./PersonCard.css";

export default function PersonCard({
  person,
  status = "suggestion",
  onChange,
}) {
  const { show } = useToast();
  const { onlineUsers } = useSocket();
  const [busy, setBusy] = useState(false);
  const [localStatus, setLocalStatus] = useState(status);
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  const skills = parseSkills(person.skills);
  const isOnline = onlineUsers.has(person._id);

  const act = async (fn, success, nextStatus) => {
    setBusy(true);
    try {
      await fn(person._id);
      setLocalStatus(nextStatus);
      show(success, "success");
      onChange?.(person._id, nextStatus);
      notifyConnectionsChanged();
    } catch (err) {
      show(err.response?.data?.message || "Action failed", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="person-card anim-fadeUp">
      <Link to={`/profile/${person._id}`} className="person-card__main">
        <div className="person-card__avatar-wrap">
          <Avatar src={person.profilePic} name={person.name} size={54} />
          <span
            className={`status-dot ${isOnline ? "status-dot--online" : ""}`}
            title={isOnline ? "Online" : "Offline"}
          />
        </div>
        <div className="person-card__info">
          <h3 className="person-card__name">{person.name}</h3>
          {person.bio && (
            <p className="person-card__bio line-clamp-2">{person.bio}</p>
          )}
          {skills.length > 0 && (
            <div className="person-card__skills">
              {skills.slice(0, 3).map((s, i) => (
                <span key={i} className="person-card__skill">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>

      <div className="person-card__action">
        {localStatus === "suggestion" && (
          <Button
            variant="outline"
            size="sm"
            loading={busy}
            onClick={() =>
              act(connectionApi.sendRequest, "Request sent", "pending")
            }
          >
            <UserPlus size={14} /> Connect
          </Button>
        )}
        {localStatus === "pending" && (
          <span className="person-card__badge person-card__badge--pending">
            Request Sent
          </span>
        )}
        {localStatus === "incoming" && (
          <div className="person-card__pair">
            <Button
              variant="primary"
              size="sm"
              loading={busy}
              onClick={() =>
                act(
                  connectionApi.acceptRequest,
                  "Connection accepted",
                  "connected",
                )
              }
            >
              <Check size={14} /> Accept
            </Button>
            <Button
              variant="ghost"
              size="sm"
              loading={busy}
              onClick={() =>
                act(connectionApi.rejectRequest, "Request declined", "declined")
              }
            >
              <X size={14} /> Decline
            </Button>
          </div>
        )}
        {localStatus === "connected" && !confirmingRemove && (
          <div className="person-card__connected-row">
            <span className="person-card__badge person-card__badge--connected">
              <Check size={13} /> Connected
            </span>
            <button
              type="button"
              className="person-card__icon-btn"
              onClick={() => setConfirmingRemove(true)}
              aria-label="Disconnect"
              title="Disconnect"
            >
              <UserMinus size={15} />
            </button>
          </div>
        )}
        {localStatus === "connected" && confirmingRemove && (
          <div className="person-card__confirm-row">
            <span className="person-card__confirm-text">
              Remove connection?
            </span>
            <Button
              variant="danger"
              size="sm"
              loading={busy}
              onClick={() =>
                act(
                  connectionApi.removeConnection,
                  "Connection removed",
                  "suggestion",
                )
              }
            >
              Yes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmingRemove(false)}
            >
              No
            </Button>
          </div>
        )}
        {localStatus === "declined" && (
          <span className="person-card__badge person-card__badge--muted">
            Declined
          </span>
        )}
      </div>
    </div>
  );
}
