import { createContext, useState, useEffect } from 'react';

import PropTypes from 'prop-types';

const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState({});
    const [loggedIn, setLoggedIn] = useState(false);
    const [errorMessages, setErrorMessages] = useState('');

    const getUser = () => {
        fetch('http://localhost:5001/v1/users/me', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                setUser(data.user);
                setLoggedIn(true);
            } else {
                setErrorMessages(data);
                setLoggedIn(false);
            }
            setIsLoading(false);
        })
        .catch(error => {
            console.error(error);
            setErrorMessages(error);
        })
    }

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            getUser();
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = (email, password) => {
        fetch('http://localhost:5001/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              'email': email,
              'password': password
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                localStorage.setItem('token', data.token);
                setLoggedIn(true);
                getUser();
            } else {
                setErrorMessages(data);
            }
        })
    }

    const logout = () => {
        localStorage.removeItem('token');
        setLoggedIn(false);
    }

    return (
        <AuthContext.Provider value={{ isLoading, loggedIn, user, login, logout, errorMessages }}>
            {children}
        </AuthContext.Provider>
    );
}

AuthContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
}

export { AuthContext, AuthContextProvider };