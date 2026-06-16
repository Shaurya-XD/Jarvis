import { Navigate } from 'react-router-dom';
import { useUserContext } from '../context/user.context';

const UserAuth = ({ children }) => {
    const { user, loading } = useUserContext();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default UserAuth; 