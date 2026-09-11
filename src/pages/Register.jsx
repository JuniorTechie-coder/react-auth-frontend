import { useState } from "react";

function Register({ onSwitchToLogin }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    async function handleRegister(e) {
        if (e) e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        if (!name.trim() || !email.trim() || !password.trim()) {
            setErrorMessage("All fields are required.");
            return;
        }

        if (password.length < 6) {
            setErrorMessage("Password must be at least 6 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch("https://trello-backend-1dsq.onrender.com/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    password: password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage("Account created successfully! Redirecting to login...");
                // Clear input fields
                setName("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");

                // Transition to login page after short delay
                setTimeout(() => {
                    if (onSwitchToLogin) onSwitchToLogin();
                }, 1600);
            } else {
                setErrorMessage(data.error || "Registration failed. Please try again.");
            }
        } catch (error) {
            console.error("Registration request error:", error);
            setErrorMessage("Unable to connect to server. Please check your backend.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Brand Header */}
                <div className="auth-brand">
                    <div className="auth-brand-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="24" height="24" rx="5" fill="#0052cc" />
                            <rect x="4" y="4" width="6.5" height="15" rx="1.5" fill="#ffffff" />
                            <rect x="13.5" y="4" width="6.5" height="10" rx="1.5" fill="#ffffff" />
                        </svg>
                    </div>
                    <span className="auth-brand-name">FlowDesk</span>
                </div>

                {/* Glassmorphic Auth Card */}
                <div className="auth-card">
                    <div className="auth-header">
                        <h2>Create your account</h2>
                        <p>Sign up to start organizing boards, lists, and cards with your team.</p>
                    </div>

                    {/* Error Banner */}
                    {errorMessage && (
                        <div className="auth-alert auth-alert-error">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {/* Success Banner */}
                    {successMessage && (
                        <div className="auth-alert auth-alert-success">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            <span>{successMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="auth-form">
                        {/* Full Name Input */}
                        <div className="auth-field">
                            <label htmlFor="name">Full Name</label>
                            <div className="auth-input-wrapper">
                                <span className="auth-input-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </span>
                                <input
                                    id="name"
                                    type="text"
                                    className="auth-input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Jane Doe"
                                    autoComplete="name"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="auth-field">
                            <label htmlFor="reg-email">Email Address</label>
                            <div className="auth-input-wrapper">
                                <span className="auth-input-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                        <polyline points="22,6 12,13 2,6"></polyline>
                                    </svg>
                                </span>
                                <input
                                    id="reg-email"
                                    type="email"
                                    className="auth-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="e.g. jane@example.com"
                                    autoComplete="email"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="auth-field">
                            <label htmlFor="reg-password">Password</label>
                            <div className="auth-input-wrapper">
                                <span className="auth-input-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                </span>
                                <input
                                    id="reg-password"
                                    type={showPassword ? "text" : "password"}
                                    className="auth-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="At least 6 characters"
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="auth-toggle-pwd-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    title={showPassword ? "Hide password" : "Show password"}
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Input */}
                        <div className="auth-field">
                            <label htmlFor="reg-confirm-password">Confirm Password</label>
                            <div className="auth-input-wrapper">
                                <span className="auth-input-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                    </svg>
                                </span>
                                <input
                                    id="reg-confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    className="auth-input"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter your password"
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="auth-toggle-pwd-btn"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    title={showConfirmPassword ? "Hide password" : "Show password"}
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="auth-spinner"></span>
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    <div className="auth-footer">
                        Already have an account?{" "}
                        <button
                            type="button"
                            onClick={() => onSwitchToLogin && onSwitchToLogin()}
                        >
                            Log in here
                        </button>
                    </div>
                </div>

                <div className="auth-footer-tagline">
                    By signing up, you agree to our Terms of Service & Privacy Policy.
                </div>
            </div>
        </div>
    );
}

export default Register;