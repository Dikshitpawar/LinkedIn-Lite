import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import "./NotFoundPage.css";

export default function NotFoundPage() {
  return (
    <div className="notfound">
      <div className="notfound__content anim-fadeUp">
        <div className="notfound__code">404</div>
        <h1>Page not found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/">
          <Button variant="primary" size="lg">
            Back to Feed
          </Button>
        </Link>
      </div>
    </div>
  );
}
