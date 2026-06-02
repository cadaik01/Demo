import { use, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateUserCard from "../components/CreateUserCard";
import UserTable from "../components/UserTable";
import { getAccounts, createAccount } from '../services/accountService';
import PageHeader from "../components/PageHeader";

function UserPage({ token, onSetMessage }) {
    const navigate = useNavigate();
    const [userForm, setUserForm] = useState({
        email: '',
        pwd: '',
        phone: '',
        role: 'User',
        fullname: ''
    });
    const [users, setUsers] = useState([]) //làm thành danh sách 
    const [loading, setLoading] = useState(false);
    const isLoggedIn = useMemo(() => Boolean(token), [token])

    const loadUsers = async () => {
        setLoading(true); //làm loading - vòng xoay xuất hiện khi load data từ database
        onSetMessage('');

        try {
            const data = await getAccounts();
            console.log(data);
            setUsers(data || []);
        } catch (error) {
            onSetMessage(error.message || 'Connection error!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const onCreateUser = async (e) => {
        e.preventDefault();

        if (!isLoggedIn) {
            onSetMessage('Must login first');
            navigate('/auth');
            return;
        }

        onSetMessage('');

        try {
            const result = await createAccount(userForm, token);
            onSetMessage(result.message || "Create new User");
            setUserForm({
                email: '',
                pwd: '',
                phone: '',
                role: 'User',
                fullname: ''
            });
            loadUsers();
        } catch (error) {
            onSetMessage(error.message || 'Connection error!');
        }
    }
    return(
        <>
        <PageHeader title= 'user' description='View users and create'></PageHeader>
        <CreateUserCard form={userForm} onChange={setUserForm} onSubmit={onCreateUser} isLoggedIn={isLoggedIn}></CreateUserCard>
        <UserTable users={users} loading={loading} onRefresh={loadUsers}></UserTable>
        </>
    );
}
export default UserPage();