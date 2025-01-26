import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f4f7fa;
`;

const FormContainer = styled.div`
    background-color: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
`;

const Title = styled.h2`
    font-size: 2rem;
    text-align: center;
    color: #333;
    margin-bottom: 20px;
`;

const Label = styled.label`
    font-size: 1rem;
    color: #333;
    margin-bottom: 5px;
    display: block;
`;

const Input = styled.input`
    width: 100%;
    padding: 12px;
    margin: 10px 0;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 1rem;
    outline: none;

    &:focus {
        border-color: #4caf50;
    }
`;

const Button = styled.button`
    width: 100%;
    padding: 12px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    margin-top: 10px;

    &:hover {
        background-color: #45a049;
    }

    &:focus {
        outline: none;
    }
`;

const LoginButton = styled.button`
    width: 100%;
    padding: 12px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    margin-top: 10px;

    &:hover {
        background-color: #0056b3;
    }

    &:focus {
        outline: none;
    }
`;

const Message = styled.p`
    text-align: center;
    color: ${props => (props.success ? 'green' : 'red')};
    margin-top: 10px;
`;

function Register() {
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:5000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, last_name: lastName, email, password }),
            });

            const data = await response.json();
            setMessage(data.message || data.error);
        } catch (error) {
            setMessage('An error occurred while registering.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container>
            <FormContainer>
                <Title>Rejestracja</Title>
                <form onSubmit={handleRegister}>
                    <div>
                        <Label htmlFor="name">Imię:</Label>
                        <Input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="lastName">Nazwisko:</Label>
                        <Input
                            type="text"
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="email">Email:</Label>
                        <Input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="password">Hasło:</Label>
                        <Input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Rejestracja...' : 'Zarejestruj się'}
                    </Button>
                </form>
                {message && <Message success={message === 'Rejestracja udana!'}>{message}</Message>}
                <LoginButton onClick={() => navigate('/login')}>
                    Masz już konto? Zaloguj się
                </LoginButton>
            </FormContainer>
        </Container>
    );
}

export default Register;
