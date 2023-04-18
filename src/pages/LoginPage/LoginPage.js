import { useState } from "react";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";
import authFetch from "helpers/authFetch";
export default function LoginPage() {
    const [title, setTitle] = useState(null);
    const [message, setMessage] = useState("Login or Sign Up to get started!");
    const [loginError, setLoginError] = useState(false);
    return (
        <div id="login-page-body">
            <div id="login-page-round-background-decoration"></div>
            <div id="login-page-bottom-top-banner-background-decoration"></div>
            <div id="login-page-bottom-bot-banner-background-decoration"></div>
            <div id="login-island">
                <h2>{title ? `${title}` : "Member Login"}</h2>
                <p id={loginError ? "login-message-error" : "login-message"}>{message}</p>
                <Login setTitle={setTitle} setMessage={setMessage} setLoginError={setLoginError} />
            </div>
        </div>
    );
}

function Login(props) {
    const { setTitle, setMessage, setLoginError } = props;
    const [isAttemptingFetch, setIsAttemptingFetch] = useState(false); // prevent excessive login button spam

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleResponse = (res) => {
        if (res.status === 200) {
            setLoginError(false);
            return res.json();
        }

        // best way to cancel a Promise chain is to throw an error
        if (res.status === 400) {
            setMessage("Enter a valid email and password!");
            throw new Error(400);
        }

        if (res.status === 401) {
            setMessage("Email and/or password is wrong!");
            throw new Error(401);
        }
    };

    const loginOnClick = async () => {
        if (isAttemptingFetch) {
            return;
        }
        setIsAttemptingFetch(true);
        setLoginError(false);
        setMessage("Logging in...");
        fetch(`${process.env.REACT_APP_GATEWAY_URI}/account/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, password: password }),
        })
            .then(handleResponse)
            .then((json) => {
                console.log(json);
                window.localStorage.accessToken = "1";
                window.localStorage.refreshToken = json.refreshToken;
                return authFetch(`${process.env.REACT_APP_GATEWAY_URI}/profile/users`, {
                    method: "GET",
                    // headers: { Authorization: "Bearer " + json.accessToken },
                });
            })
            .then((res) => res.json())
            .then((json) => {
                window.localStorage.profile = JSON.stringify(json);
                setTitle(`Hello ${json.firstName}!`);
                setMessage("Logged in successfully!");
                setIsAttemptingFetch(false);
                navigate("/");
            })
            .catch(() => {
                setLoginError(true);
                setIsAttemptingFetch(false);
            });
    };

    return (
        <div id="login-island-form">
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        loginOnClick();
                    }
                }}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        loginOnClick();
                    }
                }}
            />
            <p>Forgot Password? Sucks.</p>
            <div id="login-page-buttons">
                <button onClick={loginOnClick}>LOG IN</button>
                <hr />
                <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">SIGN UP</a>
            </div>
        </div>
    );
}
