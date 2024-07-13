import React from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from "./Auth.js";
import { Typography, message, Button, Card } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import "../css/login.css";

const { Title } = Typography;

function Login() {
  const { login } = useAuth();
  const history = useHistory();

  async function handleLogin() {
    try {
      await login();
      history.push("/library"); // if logged in, redirect to /library
    } catch {
      message.error("Error occurred");
    }
  }

  return (
    <div className="login-container">
      <Card className="login-card">
        <Title level={3} className="login-title">
          Login
        </Title>
        <Button
          type="primary"
          icon={<GoogleOutlined />}
          size="large"
          onClick={handleLogin}
          className="google-login-button"
        >
          Sign in with Google
        </Button>
      </Card>
    </div>
  );
}

export default Login;
