import React from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from "./Auth";
import { Button } from "react-bootstrap";

function Logout() {
  const { logout } = useAuth();
  const history = useHistory();

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.clear();
      sessionStorage.clear();
      history.push("/"); // Redirect to homepage after logout
    } catch {
      console.error("Logout failed");
    }
  };

  return (
    <Button onClick={handleLogout} variant="secondary">
      Logout
    </Button>
  );
}

export default Logout;
