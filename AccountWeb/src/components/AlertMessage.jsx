function AlertMessage({message}){
    if(!message) return null;
    return <div className="alert alert-info py-2">{message}</div>
}

export default AlertMessage;