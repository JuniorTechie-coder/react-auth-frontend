import { useState } from "react";

function Login({ setIsLoggedIn, onSwitchToRegister }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    async function handleLogin(e) {
        if (e) e.preventDefault();
        setErrorMessage("");

        if (!email.trim() || !password.trim()) {
            setErrorMessage("Please enter both email and password.");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch("https://trello-backend-1dsq.onrender.com/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password: password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Save JWT and user metadata
                localStorage.setItem("token", data.token);
                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        user_id: data.user_id,
                        name: data.name,
                        email: data.email,
                    })
                );

                // Update application state
                setIsLoggedIn(true);
            } else {
                setErrorMessage(data.error || "Login failed. Please verify your credentials.");
            }
        } catch (error) {
            console.error("Login request error:", error);
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
                        <h2>Log in to FlowDesk</h2>
                        <p>Welcome back! Enter your details to access your workspace.</p>
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

                    <form onSubmit={handleLogin} className="auth-form">
                        {/* Email Input */}
                        <div className="auth-field">
                            <label htmlFor="email">Email Address</label>
                            <div className="auth-input-wrapper">
                                <span className="auth-input-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                        <polyline points="22,6 12,13 2,6"></polyline>
                                    </svg>
                                </span>
                                <input
                                    id="email"
                                    type="email"
                                    className="auth-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="e.g. alex@example.com"
                                    autoComplete="email"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="auth-field">
                            <label htmlFor="password">Password</label>
                            <div className="auth-input-wrapper">
                                <span className="auth-input-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                </span>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className="auth-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
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

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="auth-spinner"></span>
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                "Log In"
                            )}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    <div className="auth-footer">
                        Don't have an account?{" "}
                        <button
                            type="button"
                            onClick={() => onSwitchToRegister && onSwitchToRegister()}
                        >
                            Sign up here
                        </button>
                    </div>
                </div>

                <div className="auth-footer-tagline">
                    Simplify your workflow and collaborate with ease.
                </div>
            </div>
        </div>
    );
}

export default Login;
