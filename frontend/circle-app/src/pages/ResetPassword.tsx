import { useState } from "react";

const ResetPasswordPage = () => {
  const [form, setForm] = useState({ password: "", confirm_password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.password && !form.confirm_password) return;
    window.location.href = "/auth/login";
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-full max-w-md rounded-xl shadow-lg p-8 text-start">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-green-500 text-4xl font-bold">circle</h1>
        <p className="text-gray-300 mt-1 text-xl font-bold">Forgot password</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="New Password *"
          name="password"
          value={form.password}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-md bg-[#1f1f1f] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <input
          type="text"
          placeholder="Confirm New Password *"
          name="confirm_password"
          value={form.confirm_password}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-md bg-[#1f1f1f] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <button
          type="submit"
          className="w-full cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-full transition"
        >
          Create New Password
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;