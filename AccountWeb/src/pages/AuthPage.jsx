import { useState } from "react";
import { registerUser, login } from "../services/authService";
import PageHeader from "../components/PageHeader";
import LoginCard from "../components/LoginCard";
import RegisterCard from "../components/RegisterCard";

function AuthPage({ onSetMessage, onLogginSuccess, onLogout}){
    const [registerForm,setRegisterForm] = useState ({email: '', pwd: ''});
    const [loginForm, setLoginForm] = useState({email:'', pwd: ''});

    const onRegister = async (e) =>{
        e.preventDefault();
        onSetMessage('');

        try{
            const data = await registerUser(registerForm);
            onSetMessage(typeof data === 'string' ?'data': 'Register successfully. Please check your email!')
            setRegisterForm ({email:'', pwd: ''});
        }catch(error){
            onSetMessage(error.message || 'Connection error!');
        }
    }

    const onLogin = async (e) =>{
        e.preventDefault();
        onSetMessage('');

        try{
            const data = await login(loginForm);
            localStorage.setItem('token', data.token);
            onLogginSuccess(data.token);
            onSetMessage('Login successfully.')
            setLoginForm ({email:'', pwd: ''});
        }catch(error){
            onSetMessage(error.message || 'Connection error!');
        }
    }
    return(
        <>
            <PageHeader title="Authentication" description="Register new account and login."></PageHeader>
            <div className="">
                <RegisterCard form={registerForm} onChange={setRegisterForm} onSubmit={onRegister}></RegisterCard>
                <LoginCard form={loginForm} onChange={setLoginForm} onSubmit={onLogginSuccess}></LoginCard>
            </div>
        </>
    )
}