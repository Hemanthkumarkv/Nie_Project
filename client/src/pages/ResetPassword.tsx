import { useState, FormEvent, ChangeEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/authApi";
import { ROUTES } from "../utils/constants";
import { CheckCircle, AlertCircle } from "lucide-react";

const ResetPassword = () => {
  const { resetToken } = useParams<{ resetToken: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.newPassword) {
      setError("Password is required");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!resetToken) {
      setError("Invalid reset token");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(resetToken, formData.newPassword);
      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="w-full max-w-md">
          <div className="bg-slate-800 rounded-lg p-8 shadow-lg border border-slate-700 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Password Reset Successful!
              </h2>
              <p className="text-slate-400">
                Your password has been changed successfully.
              </p>
            </div>
            <p className="text-sm text-slate-500 mb-6">Redirecting to login page...</p>
            <Link
              to={ROUTES.LOGIN}
              className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-slate-400 text-base sm:text-lg">Enter your new password below</p>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 sm:p-8 shadow-lg border border-slate-700">
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                required
              />
              <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter new password"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to={ROUTES.LOGIN}
              className="text-sm text-blue-400 hover:text-blue-300 font-medium"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
