function RegisterCard({ form, onChange, onSubmit, onLogout }) {
    return (
        <div className="col-12 col-lg-6">
            <div className="card">
                <div className="card-body">
                    <h2 className="card-title">Register</h2>
                    <form onSubmit={onSubmit} className="d-grid gap-2">
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Email"
                            value={form.email}
                            onChange={(e) => onChange({ ...form, email: e.target.email })}
                            required
                        />

                        <input
                            type="password"
                            className="form-control"
                            placeholder="Password"
                            value={form.pwd}
                            onChange={(e) => onChange({ ...form, pwd: e.target.pwd })}
                            required
                        />
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-success"
                                type="submit">Login</button>

                            <button
                                className="d-flex gap-2"
                                type="button"
                                onClick={onLogout}>Logout</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default RegisterCard;