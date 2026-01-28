import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword(){
  const [form, setForm] = useState({ email: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email) return;
    navigate("/forgot_password");
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-full max-w-md rounded-xl shadow-lg p-8 text-start">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white text-start capitalize mb-2">circle<span className="text-blue-800">App</span></h1>
        <p className="text-gray-300 mt-1 text-xl font-bold">Forgot password</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email/Username *"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-md bg-[#1f1f1f] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <button
          type="submit"
          className="w-full font-bold py-6 rounded-full text-lg transition-all"
        >
          Send 
        </button>
      </form>

      {/* Login */}
      <p className="text-sm text-gray-400 mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-800 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
};