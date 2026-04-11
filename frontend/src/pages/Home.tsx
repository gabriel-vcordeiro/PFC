import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"

export default function Home(){
    const {userID, logOut} = useContext(AuthContext);
    return (<div>
        Usuário logado com sucesso - ID {userID}
        <button onClick={() => logOut()}>Sair</button>
    </div>)
}