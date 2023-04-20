import { useState, useEffect } from "react";
import { useRef } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  FormControl,
  ListGroup,
} from "react-bootstrap";
import { io } from "socket.io-client";

const socket = io("http://localhost:3002", { transports: ["websocket"] });

const Home = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const stateRef = useRef();

  stateRef.current = onlineUsers;

  useEffect(() => {
    socket.on("welcome", (welcomeMessage) => {
      console.log(welcomeMessage);

      socket.on("loggedIn", (onlineUsers) => {
        console.log("Online peeps are:" + stateRef.current);
        setOnlineUsers(onlineUsers);
        setLoggedIn(true);
      });

      socket.on("updateOnlineUsersList", (updatedList) => {
        setOnlineUsers(updatedList);
      });

      socket.on("newMessage", (newMessage) => {
        console.log(newMessage);
        setChatHistory((chatHistory) => [...chatHistory, newMessage.message]);
        scrollToBottom();
      });
    });
  }, []);

  const scrollToBottom = () => {
    const invisiBottom = document.getElementById("bottomLine");
    const chatBox = document.getElementsByClassName("chat");
    invisiBottom.scrollIntoView({ behavior: "smooth" });
  };

  const submitUsername = () => {
    socket.emit("setUsername", { name });
  };

  const sendMessage = () => {
    const newMessage = {
      sender: name,
      text: message,
      createdAt: new Date().toLocaleString("en-US"),
    };
    socket.emit("sendMessage", { message: newMessage });
    setChatHistory([...chatHistory, newMessage]);
    setMessage("");
    scrollToBottom();
  };

  return (
    <Container fluid>
      <Row style={{ height: "95vh" }} className="chatStuff">
        <Col md={9} className="d-flex flex-column justify-content-between">
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              submitUsername();
              console.log(name);
            }}
          >
            <FormControl
              placeholder="Set your username here"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loggedIn}
            />
          </Form>
          <div className="chat">
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={
                  message.sender === name
                    ? "myChatBubble singleMessage"
                    : "otherChatBubble singleMessage"
                }
              >
                <div className="messageTop">
                  <div>{<strong>{message.sender}:</strong>}</div>
                  <div>{message.text}</div>
                </div>
                <div className="messageBottom">at {message.createdAt}</div>
              </div>
            ))}
            <div id="bottomLine"></div>
          </div>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              if (message === "") {
                alert("Please write something first");
                return;
              } else {
                sendMessage();
              }
            }}
          >
            <FormControl
              placeholder="Write your message here"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!loggedIn}
            />
          </Form>
        </Col>
        <Col md={3} className="rightSide">
          <div className="mb-3 rightTitle">Connected users:</div>
          {onlineUsers.length === 0 && (
            <ListGroup.Item>Log in to check who's online!</ListGroup.Item>
          )}
          <ListGroup>
            {onlineUsers.map((user) => (
              <ListGroup.Item key={user.socketId}>
                {user.username}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
