// src/pages/SignupPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store";
import axios from "axios";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useStore((state) => state.login);
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false)
  const {endpoint} = useStore();

  const handleSignup = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }
     
    axios.post(`${endpoint}/api/music-web-app/create/user` , { username : name , email : email , password : password })
    .then((data)=>{
       const msg = data.data?.Message;
       const status = data.data?.Status;
       setIsSubmitted(false);
       status? navigate("/"):setError(msg)
    })
    .catch((error)=>{
       setIsSubmitted(false);
        console.log(error)
    })

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br  from-indigo-900 via-purple-900 to-pink-900 px-4">
      <div className="bg-white/10 border border-white/20 backdrop-blur-lg rounded-2xl shadow-xl p-8 w-full max-w-md">
       <h2 className="text-3xl font-bold text-white mb-6 text-center flex items-center  ">
          <img className="w-16 h-16" src="/icon.png" />
          Signup
        </h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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
            disabled = {isSubmitted}
            className="w-full text-white py-2 rounded-lg transition"
            style={{ backgroundColor: "#2089dc" }}
          >
            Create Account
          </button>
           <button
            type="submit"
            className="w-full text-white py-2 rounded-lg transition"
            style={{ backgroundColor: "#2089dc" }}
            onClick={()=>{
                navigate("/");
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
