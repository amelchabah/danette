// import './Signin.scss';
import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useRouter } from 'next/router';

const Signup = () => {
    const router = useRouter();
    const { loggedIn, isLoading, getUser, setLoggedIn } = useContext(AuthContext);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isLoading) return;
        if (loggedIn) {
            router.push('/');
            return;
        };
    }, [isLoading, loggedIn]);

    const onSubmit = async (e) => {
        e.preventDefault();
        const pseudo = e.target.pseudo.value;
        const email = e.target.email.value;
        const password = e.target.password.value;
        if (pseudo === '' || password === '' || email === '') {
            setError('Please fill in all fields');
            return;
        }
        try {
            const response = await fetch('http://localhost:5001/v1/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    pseudo: pseudo,
                    email: email,
                    password: password
                })
            });
            const data = await response.json();
            console.log(data);
            if (data.token) {
                localStorage.setItem('token', data.token);
                setLoggedIn(true);
                getUser();
            } else {
                setError(data.error);
            }
        } catch (error) {
            // console.error(error);
            setError(error.error);
        }
    }

    return (
        <>
            <div className='login'>
                <form action="" className='signform' onSubmit={(e) => onSubmit(e)}>

                    <article>
                        <h2>Sign up</h2>
                        <h5>Welcome, please create an account to continue.</h5>

                    </article>
                    <fieldset>
                        <label htmlFor="pseudo">Pseudo</label>
                        <input required type="text" className="form-control" id='pseudo' name='pseudo' placeholder="Enter your pseudo..." />
                    </fieldset>
                    <fieldset>
                        <label htmlFor="email">Email</label>
                        <input required type="email" className="form-control" id='email' name='email' placeholder="Enter your email..." />
                    </fieldset>
                    <fieldset>
                        <label htmlFor="password">Password</label>
                        <input required type="password" className="form-control" id='password' name='password' placeholder="Enter your password..." />
                    </fieldset>
                    {
                        error && <p className='error'>{error}</p>
                    }
                    <button type="submit" className="primary">Sign up</button>
                </form>
            </div>
        </>
    )
}

export default Signup;