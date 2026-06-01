function CreateUserCard({ form, onChange, onSubmit, isLoggedIn }) {
    return (
        <div className="card mb-4">
            <div className="card-body">
                <h2 className="card-title">Create User</h2>
                <form onSubmit={onSubmit} className="row g-2">
                    <div className="col-md-3">
                        <input type="text"
                            className="form-control"
                            placeholder="Email"
                            value={form.email}
                            onChange={(e) => onChange({ ...form, email: e.target.email })}
                            required
                            disabled={!isLoggedIn}
                        />
                    </div>

                    <div className="col-md-3">
                        <input type="password"
                            className="form-control"
                            placeholder="Password"
                            value={form.pwd}
                            onChange={(e) => onChange({ ...form, pwd: e.target.pwd })}
                            required
                            disabled={!isLoggedIn}
                        />
                    </div>
                    <div className="col-md-3">
                        <input type="phone"
                            className="form-control"
                            placeholder="Phone"
                            value={form.phone}
                            onChange={(e) => onChange({ ...form, phone: e.target.phone })}
                            required
                            disabled={!isLoggedIn}
                        />
                    </div>

                    <div className="col-md-3">
                        <input type="fullname"
                            className="form-control"
                            placeholder="Full name"
                            value={form.fullname}
                            onChange={(e) => onChange({ ...form, fullname: e.target.fullname })}
                            required
                            disabled={!isLoggedIn}
                        />
                    </div>
                    <div className="col-md-8">
                        <button className="btn btn-dark" type="submit">
                            {isLoggedIn?'Add':'Login to Add'}
                        </button>
                    </div>
                </form>
                {!isLoggedIn && <small className="text-muted">Must push login button to create new Account</small>}
            </div>
        </div>
    )
}

export default CreateUserCard;