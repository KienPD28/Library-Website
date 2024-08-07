import React from "react";
import { Switch, Route, HashRouter as Router, Link } from "react-router-dom";
import { useAuth } from "./Auth";
import { Button } from "antd";
import { ApiOutlined } from "@ant-design/icons";

import SearchPage from "./SearchPage";
import Library from "./Library";
import Login from "./Login";
import Logout from "./Logout";
import PrivateRoute from "./PrivateRoute";

import "../css/index.css";
import "../css/navbar.css";
import "antd/dist/antd.css";

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="App">
        <div className="navbar">
          <div className="leftInfo">
            <div className="title">
              <Link id="title" to="/">
                Books Library
              </Link>
            </div>

            <div className="buttons">
              <ul>
                <li>
                  <Link to="/library">My Library</Link>
                </li>
                <li>
                  <Link to="/search">Search</Link>
                </li>
                <li>
                  <Link to="/settings">Settings</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="rightInfo">
            <div className="links">
              <ul>
                <li>
                  <Button
                    href="https://developers.google.com/books"
                    target="_blank"
                    type="link"
                    block
                  >
                    <ApiOutlined />
                    Google Books
                  </Button>
                </li>
              </ul>
            </div>

            <div className="login">
              <ul>
                <li>
                  {!user ? (
                    <Link to="/login">
                      <Button type="primary" size="large">
                        Login
                      </Button>
                    </Link>
                  ) : (
                    <Logout />
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Switch>
        <Route exact path="/search" component={SearchPage} />
        <PrivateRoute exact path="/library" component={Library} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/" component={SearchPage} />
      </Switch>
    </Router>
  );
}

export default App;
