import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { Link } from 'react-router-dom';

export default function Home(){
    const {userID, logOut} = useContext(AuthContext);
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
                <h1>🏠 Página Inicial</h1>
                <p>Usuário logado com sucesso - ID {userID}</p>
                <button 
                    onClick={() => logOut()}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginBottom: '10px'
                    }}
                >
                    Sair
                </button>
                <Link 
                    to="/settings"
                    style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        textAlign: 'center',
                        boxSizing: 'border-box'
                    }}
                >
                    Configurações
                </Link>
            </div>
        </div>
    )
}