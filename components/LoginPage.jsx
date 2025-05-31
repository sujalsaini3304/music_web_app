import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store";
import axios from "axios";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setLogin, setEmailFunc , endpoint } = useStore();
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false)


  const handleLogin = (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!email || !password) {
      setError("Please fill all fields.");
      setIsSubmitted(false);
      return;
    }

    axios
      .post(`${endpoint}/api/music-web-app/login/user`, {
        email,
        password,
      })
      .then((res) => {
        setIsSubmitted(false);
        const { Message, Status } = res.data;

        if (Status) {
          setEmailFunc(email); 
          setLogin(true);
          navigate("/home");
          
        } else {
          setError(Message || "Login failed.");
        }
      })
      .catch((err) => {
        setIsSubmitted(false);
        console.error(err);
        setError("Server error. Please try again later.");
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 px-4">
      <div className="bg-white/10 border border-white/20 backdrop-blur-lg rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-6 text-center flex items-center">
          <img className="w-16 h-16" src="/icon.png" alt="App icon" />
          Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full text-white py-2 rounded-lg transition"
            style={{ backgroundColor:isSubmitted? "gray" :  "#2089dc" }}
          >
            Login
          </button>

          <button
            type="button"
            disabled={isSubmitted}
            className="w-full text-white py-2 rounded-lg transition"
            style={{ backgroundColor: "#2089dc" }}
            onClick={() => navigate("/signup")}
          >
            Signup
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
