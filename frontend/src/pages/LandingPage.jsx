import "../styles/LandingPage.css";
import { usePWAInstall } from "../hooks/usePWAInstall.js";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const { isInstallable, install } = usePWAInstall();
  return (
    <div className="LandingPage">
      <h1>ATTSYS2-0</h1>
      <div className="landing-actions">
        <Link className="landing-link" to="/login/teacher">
          Teacher
        </Link>
        <Link className="landing-link" to="/login/student">
          Student
        </Link>
      </div>
        {isInstallable && (
          <button id="install-btn" onClick={install}>
            Install App
          </button>
        )}
    </div>
  );
};

export default LandingPage;
