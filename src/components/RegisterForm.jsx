import { useState } from "react";
import {
    GraduationCap,
    ArrowLeft,
    Loader2,
    Mail,
    Lock,
    User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function RegisterForm({ onBack, onLoginClick, onSuccess }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const { register } = useAuth();

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const result = await register(
                formData.email,
                formData.password,
                formData.name,
                "student"
            );

            if (result.success) {
                alert("Registration successful! Welcome to EduPath!");
                onSuccess();
            } else {
                alert(result.error || "Registration failed. Please try again.");
            }
        } catch (error) {
            alert("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field) => (e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    return (
        <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-card/95 border rounded-2xl p-6 animate-scale-in relative">
                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="absolute top-4 left-4 p-2 rounded-lg hover:bg-accent/10"
                >
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </button>

                {/* Header */}
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center gradient-primary">
                        <GraduationCap className="w-8 h-8 text-primary-foreground" />
                    </div>

                    <h2 className="text-2xl font-bold">Create Student Account</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Join EduPath and start your learning journey
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                    {/* Name Field */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Full Name</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange("name")}
                                className={`w-full h-12 px-4 border rounded-lg ${errors.name ? "border-red-500" : ""
                                    }`}
                            />
                        </div>
                        {errors.name && (
                            <p className="text-xs text-red-500">{errors.name}</p>
                        )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Email</label>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="your.email@student.com"
                                value={formData.email}
                                onChange={handleChange("email")}
                                className={`w-full h-12 px-4 border rounded-lg ${errors.email ? "border-red-500" : ""
                                    }`}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-xs text-red-500">{errors.email}</p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange("password")}
                                className={`w-full h-12 px-4 border rounded-lg ${errors.password ? "border-red-500" : ""
                                    }`}
                            />
                        </div>
                        {errors.password && (
                            <p className="text-xs text-red-500">{errors.password}</p>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Confirm Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange("confirmPassword")}
                                className={`w-full h-12 px-4 border rounded-lg ${errors.confirmPassword ? "border-red-500" : ""
                                    }`}
                            />
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 rounded-lg flex items-center justify-center gap-2 text-white bg-primary"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            "Register"
                        )}
                    </button>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <button
                            onClick={onLoginClick}
                            className="text-primary font-medium hover:underline"
                        >
                            Login
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
