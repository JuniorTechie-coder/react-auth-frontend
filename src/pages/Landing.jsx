import React from "react";

function Landing({ onOpenWorkspace, onOpenLogin, onOpenRegister, isLoggedIn }) {
    return (
        <div className="landing-body">
            {/* NAVIGATION HEADER */}
            <header className="landing-nav">
                <a
                    className="logo"
                    href="/"
                    onClick={(e) => {
                        e.preventDefault();
                        window.history.pushState({}, "", "/");
                    }}
                >
                    FlowDesk
                </a>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    {isLoggedIn ? (
                        <button
                            className="ghost-btn"
                            onClick={onOpenWorkspace}
                            id="openWorkspaceBtn"
                        >
                            Open Workspace &rarr;
                        </button>
                    ) : (
                        <>
                            <button
                                className="ghost-btn"
                                onClick={onOpenLogin}
                                id="landingLoginBtn"
                                style={{ background: "rgba(255, 255, 255, 0.12)" }}
                            >
                                Sign In
                            </button>
                            <button
                                className="primary-btn"
                                onClick={onOpenRegister}
                                id="landingRegisterBtn"
                                style={{ padding: "8px 16px", fontSize: "13px" }}
                            >
                                Get Started Free &rarr;
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* MAIN HERO & FEATURES */}
            <main style={{ flex: 1 }}>
                <section className="hero">
                    <div className="hero-text">
                        <span className="eyebrow">✨ Boards · Lists · Cards · Backlogs</span>
                        <h1>One board.<br />Every task in its place.</h1>
                        <p>
                            Spin up a workspace, add boards for each project, and move work
                            from <strong>To Do</strong> to <strong>Done</strong> by dragging
                            cards where they belong. Team leads stage the backlog and assign cards —
                            the team pulls cards in when they're ready to start.
                        </p>
                        <div className="hero-actions" style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                            <button
                                onClick={isLoggedIn ? onOpenWorkspace : onOpenRegister}
                                className="primary-btn large"
                                id="createWorkspaceHeroBtn"
                                style={{ cursor: "pointer", border: "none" }}
                            >
                                {isLoggedIn ? "Open Your Workspace →" : "+ Create your first workspace"}
                            </button>
                            {!isLoggedIn && (
                                <button
                                    onClick={onOpenLogin}
                                    className="ghost-btn large"
                                    style={{
                                        cursor: "pointer",
                                        padding: "12px 24px",
                                        borderRadius: "var(--radius-md)",
                                        fontSize: "15px",
                                        fontWeight: "600"
                                    }}
                                >
                                    Log In to Account
                                </button>
                            )}
                        </div>
                    </div>

                    {/* INTERACTIVE BOARD PREVIEW */}
                    <div className="hero-board-preview" aria-hidden="true">
                        <div className="preview-list">
                            <div className="preview-list-title">To Do (2)</div>
                            <div className="preview-card">
                                <div>Design Landing Page</div>
                                <span className="badge priority-high" style={{ marginTop: "6px", fontSize: "10px" }}>High</span>
                            </div>
                            <div className="preview-card">
                                <div>Create User API</div>
                                <span className="badge priority-medium" style={{ marginTop: "6px", fontSize: "10px" }}>Medium</span>
                            </div>
                        </div>
                        <div className="preview-list">
                            <div className="preview-list-title">In Progress (1)</div>
                            <div className="preview-card dragging">
                                <div>Team Lead Backlog</div>
                                <span className="badge priority-high" style={{ marginTop: "6px", fontSize: "10px" }}>High</span>
                            </div>
                        </div>
                        <div className="preview-list">
                            <div className="preview-list-title">Completed (1)</div>
                            <div className="preview-card done">
                                <div>User Auth &amp; CRUD</div>
                                <span className="badge priority-done" style={{ marginTop: "6px", fontSize: "10px" }}>Done</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURE STRIP */}
                <section className="feature-strip">
                    <div className="feature">
                        <h3>📁 Workspaces &amp; Boards</h3>
                        <p>Group boards by team or project inside a workspace, and drill into any board with smooth transitions.</p>
                    </div>
                    <div className="feature">
                        <h3>⚡ Drag-and-Drop Cards</h3>
                        <p>Move cards smoothly between lists and backlogs as work progresses with instant persistence.</p>
                    </div>
                    <div className="feature">
                        <h3>👑 Team Lead Backlog &amp; Delegation</h3>
                        <p>Leads stage upcoming work in an integrated backlog and assign cards to members; members drag cards into active lists when ready.</p>
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="landing-footer">
                <span>FlowDesk — Complete Workspace &amp; Team Lead Task Management</span>
            </footer>
        </div>
    );
}

export default Landing;
