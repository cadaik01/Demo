function userTable({ users, loading, onRefresh }) {
    return (
        <div className="card">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h2>User List</h2>
                    <button className="btn btn-outline-primary btn-sm" onClick={onRefresh}>Refresh</button>
                </div>
                {loading ? (
                    <p>Loading...</p>
                ) : users.length === 0 ? (
                    <p className="mb-0">No Users</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-striped table-border mb-0">
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Fullname</th>
                                    <th>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                { userTable.map(( item ) =>(
                                    <tr key={item._id}>
                                        <td>{item.email}</td>
                                        <td>{item.phone}</td>
                                        <td>{item.fullname}</td>
                                        <td>{item.role}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
export default userTable;