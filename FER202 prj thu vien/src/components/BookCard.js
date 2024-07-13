import React from "react";
import { useAuth } from "./Auth";
import axios from "axios";
import { Typography, Button, Menu, Dropdown, message } from "antd";
import {
  DownOutlined,
  ImportOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import "../css/bookcard.css";

const { Text } = Typography;

const menu = (handleMarkAs) => (
  <Menu onClick={handleMarkAs}>
    <Menu.Item key="read">Read</Menu.Item>
    <Menu.Item key="currentlyReading">Currently reading</Menu.Item>
    <Menu.Item key="wantToRead">Want to read</Menu.Item>
  </Menu>
);

function Book(props) {
  const { user } = useAuth();

  const authorRender = props.authors.map((author, index) => (
    <Text key={index}>
      {author}
      {index < props.authors.length - 1 ? ", " : ""}
    </Text>
  ));

  const titleRender = props.subtitle ? (
    <Text key={props.name} strong>
      {props.name}: {props.subtitle}
      <br />
    </Text>
  ) : (
    <Text key={props.name} strong>
      {props.name}
      <br />
    </Text>
  );

  const handleAdd = () => {
    if (!user) {
      message.error("You must be logged in to do that");
      return;
    }

    const bookData = {
      title: props.name,
      authors: props.authors,
      subtitle: props.subtitle,
      thumbnail: props.thumbnail,
    };

    axios
      .post("/api/user/add", { bookData, uid: user.uid })
      .then((res) => {
        switch (res.status) {
          case 227:
            message.warning("This book is already in your library");
            break;
          default:
            message.success("Book added to your library");
            break;
        }
      })
      .catch(() => {
        message.error("(Error) book was not added");
      });
  };

  const handleRemove = () => {
    const bookData = {
      title: props.name,
      authors: props.authors,
      subtitle: props.subtitle,
      thumbnail: props.thumbnail,
    };

    axios
      .post("/api/user/remove", { bookData, uid: user.uid })
      .then(() => {
        props.onChange();
      })
      .catch(() => {
        message.error("(Error) book was not removed");
      });
  };

  const handleMarkAs = (e) => {
    const status = e.key;

    if (!user) {
      message.error("You must be logged in to do that");
      return;
    }

    axios
      .post("/api/user/mark", { status, uid: user.uid, bookData: props })
      .then(() => {
        message.success(`Marked as ${status}`);
      })
      .catch(() => {
        message.error("Failed to mark book");
      });
  };

  const button = props.isLibraryRender ? (
    <Button onClick={handleRemove} style={{ marginRight: 5 }}>
      <DeleteOutlined />
    </Button>
  ) : (
    <Button type="primary" onClick={handleAdd} style={{ marginRight: 5 }}>
      <ImportOutlined />
      Add to shelf
    </Button>
  );

  return (
    <div className="bookCard">
      <img className="imageContainer" alt={props.name} src={props.thumbnail} />
      <div className="textContainer">
        {titleRender}
        <br />
        {authorRender}
      </div>
      <div className="options">
        {button}
        {props.isLibraryRender && (
          <Dropdown overlay={menu(handleMarkAs)}>
            <Button type="dashed">
              Mark as <DownOutlined />
            </Button>
          </Dropdown>
        )}
      </div>
    </div>
  );
}

export default Book;
