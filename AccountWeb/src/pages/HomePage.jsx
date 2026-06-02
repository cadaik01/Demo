import { registerUser, login } from "../services/authService";
import PageHeader from "../components/PageHeader";
import LoginCard from "../components/LoginCard";
import RegisterCard from "../components/RegisterCard";

function HomePage(){
    return (
        <div className="card">
            <div className="card-body">
                <PageHeader
                    title = "Demo Frontend React"
                    description = "This is a demo for some functions with React.">
                </PageHeader>
                <ol className="mb-0">
                    <li>Go to Auth Page to register</li>
                    <li>After login - you can create new user</li>
                    <li>For demo only</li>
                </ol>
            </div>
        </div>
    );
}

export default HomePage();