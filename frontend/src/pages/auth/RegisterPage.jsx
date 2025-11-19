import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import useAuthStore from "../../stores/authStore";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const RegisterPage = () => {
  const { register: registerUser, isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/profile");
    }
  }, [isAuthenticated, navigate]);

  const password = watch("password");

  const onSubmit = async (data) => {
    console.log("[RegisterPage] Form submitted:", { name: data.name, email: data.email });
    setError("");
    
    try {
      const result = await registerUser(data.name, data.email, data.password);
      console.log("[RegisterPage] Registration result:", result);

      if (result.success) {
        console.log("[RegisterPage] Registration successful, navigating to profile");
        toast.success("Account created successfully! Welcome!");
        setTimeout(() => {
          navigate("/profile");
        }, 1000);
      } else {
        console.error("[RegisterPage] Registration failed:", result.error);
        const errorMsg = result.error || "Registration failed";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("[RegisterPage] Registration exception:", error);
      const errorMsg = error.message || "An unexpected error occurred";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-black">
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="bg-gray-950 backdrop-blur-xl border border-gray-900 p-8 rounded-2xl shadow-2xl">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Or{" "}
              <Link
                to="/auth/login"
                className="font-medium text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                sign in to existing account
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300"
                >
                  Full Name
                </label>
                <input
                  {...register("name", {
                    required: "Name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                  })}
                  type="text"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 bg-gray-900 border border-gray-800 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300"
                >
                  Email address
                </label>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  type="email"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 bg-gray-900 border border-gray-800 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300"
                >
                  Password
                </label>
                <input
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  type="password"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 bg-gray-900 border border-gray-800 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-300"
                >
                  Confirm Password
                </label>
                <input
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  type="password"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 bg-gray-900 border border-gray-800 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : "Sign up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
