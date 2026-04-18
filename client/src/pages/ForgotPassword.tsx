import { useState, FormEvent } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { authApi } from "../api/authApi";
import { ROUTES } from "../utils/constants";

export default function ForgotPassword() {
  // export default function ForgotAndResetPassword() {
  const { resetToken } = useParams<{ resetToken: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState(resetToken ? "reset" : "forgot");
  const [email, setEmail] = useState("");
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetTokenDev, setResetTokenDev] = useState("");

  // 🔹 Handle email submit (forgot password)
  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) return setError("Email is required");
    setIsLoading(true);

    try {
      const res = await authApi.forgotPassword(email);
      setSuccess(true);
      if (res.data?.resetTokenDevOnly) {
        setResetTokenDev(res.data.resetTokenDevOnly);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Handle password reset submit
  const handleResetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.newPassword || formData.newPassword.length < 6)
      return setError("Password must be at least 6 characters");

    if (formData.newPassword !== formData.confirmPassword)
      return setError("Passwords do not match");

    const token = resetToken || resetTokenDev;
    if (!token) return setError("Invalid or missing token");

    setIsLoading(true);
    try {
      await authApi.resetPassword(token, formData.newPassword);
      setSuccess(true);
      setStep("done");
      setTimeout(() => navigate(ROUTES.LOGIN), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Shared input handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Done screen
  if (step === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="w-full max-w-md bg-slate-800 rounded-lg p-6 sm:p-8 shadow-lg border border-slate-700 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Password Reset Successful!
          </h2>
          <p className="text-slate-400 mb-6">Redirecting to login...</p>
          <Link
            to={ROUTES.LOGIN}
            className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // 🔹 Forgot Password Step
  if (step === "forgot") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="w-full max-w-md bg-slate-800 rounded-lg p-8 shadow-lg border border-slate-700">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 text-center">
            Forgot Password
          </h1>
          <p className="text-slate-400 text-base sm:text-lg text-center mb-6">
            Enter your email to receive a reset link
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success ? (
            <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg text-sm">
              <p className="font-medium mb-2">Reset link sent!</p>
              <p className="text-xs text-green-300 mb-2">
                Check your email for instructions.
              </p>

                <div className="mt-3 p-3 bg-slate-700 rounded">
                  <p className="text-xs text-yellow-400 mb-1">Dev Token:</p>
                  <button
                    onClick={() => setStep("reset")}
                    className="text-blue-400 hover:text-blue-300 text-xs underline"
                  >
                    Click to reset now
                  </button>
                </div>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 🔹 Reset Password Step
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md bg-slate-800 rounded-lg p-8 shadow-lg border border-slate-700">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          Reset Password
        </h1>
        <p className="text-slate-400 text-center mb-6">
          Enter your new password below
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleResetSubmit} className="space-y-4">
          {/* New Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-slate-200 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter new password"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
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
  );
}
