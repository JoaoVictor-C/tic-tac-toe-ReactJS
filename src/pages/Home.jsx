import { Link } from 'react-router-dom';

const Home = () => {
    return (
       <div className="home">
            <h1>Jogo da velha!</h1>
            <div className="links">
                <Link to="/create">Criar jogo</Link>
                <Link to="/join">Entrar em um jogo</Link>
                <Link to="/offline">Jogar offline</Link>
            </div>
       </div>
    )
}

export default Home;