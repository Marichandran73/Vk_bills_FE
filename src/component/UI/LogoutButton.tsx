import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/authService";

type LogoutButtonProps = {
  className?: string;
  label?: string;
  onLoggedOut?: () => void;
};

const LogoutButton = ({
  className = "",
  label = "Logout",
  onLoggedOut,
}: LogoutButtonProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onLoggedOut?.();
    navigate("/", { replace: true });
  };

  return (
    <button type="button" onClick={handleLogout} className={className}>
      <LogOut className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
};

export default LogoutButton;
