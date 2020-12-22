import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import logo from './images/card_back.png'
import Cookies from 'universal-cookie';



class Square extends React.Component {
    render() {
        return (
            <button className="square" onClick={this.props.onClick}>
                {this.props.displayed ? <img src={this.props.image} alt="Logo" /> : <img src={logo} alt="Logo" />}
            </button>
        );
    }
}

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            board: this.setupBoard(props.count),
            items: this.setupItems(props.count),

            enabled: true,
            first: null,
            second: null,

            chrono: 0,
            chronoInterval: setInterval(() => {
                this.setState((state) => state.chrono++)
            }, 1000),
            score: 0,
        };
    }

    setupItems(count) {
        const items = [];
        for (let i = 0; i < count; i++) {
            items[i] = {
                validated: false,
                txt: i.toString(),
                image: `/images/card_${i}.jpg`,
            }
        }
        return items;
    }

    setupBoard(count) {
        let board = [];
        for (let i = 0; i < count * 2; i++) {
            board.push(Math.floor(i / 2));
        }
        board = shuffle(board);
        return board;
    }

    hasNiceTime(count, chrono) {
        return (count === 4 && chrono <= 10)
            || (count === 7 && chrono <= 20)
            || (count === 10 && chrono <= 30)
    }

    resetGame() {
        clearInterval(this.state.chronoInterval)
        this.setState({
            board: this.setupBoard(this.props.count),
            items: this.setupItems(this.props.count),

            enabled: true,
            first: null,
            second: null,

            chrono: 0,
            chronoInterval: setInterval(() => {
                this.setState((state) => state.chrono++)
            }, 1000),
            score: 0,
        });
    }

    renderSquare(i) {
        const itemId = this.state.board[i];
        return (
            <Square key={i} txt={this.state.items[itemId].txt} image={this.state.items[itemId].image}
                displayed={this.state.items[itemId].validated === true || this.state.first === i || this.state.second === i}
                onClick={() => this.handleSquareClick(i)}
            />
        );
    }

    hasWon() {
        return this.state.items.filter((element) => !element.validated).length === 0;
    }

    handleSquareClick(i) {
        if (!this.state.enabled || this.state.first === i || this.state.items[this.state.board[i]].validated) {
            return;
        }

        const state = this.state;
        if (state.first === null) {
            state.first = i;
            this.setState(state)
        } else {
            state.second = i;

            const itemId = state.board[state.first];
            if (itemId === state.board[state.second]) {
                state.items[itemId].validated = true;
                state.first = null;
                state.second = null;
                state.score += 3;

                this.setState(state)
            } else {
                state.enabled = false;
                state.score -= 1;

                this.setState(state)
                setTimeout(() => {
                    state.first = null;
                    state.second = null;
                    state.enabled = true;
                    this.setState(state)
                }, 1000)
            }
        }

        if (this.hasWon()) {
            clearInterval(this.state.chronoInterval);

            const cookies = new Cookies();
            cookies.set(
                `user_time_${this.props.username}`,
                this.state.chrono,
            );

            let newScore = this.state.score;
            if (this.hasNiceTime(parseInt(this.props.count, 10), this.state.chrono)) {
                newScore += 5;
                this.setState((state) => state.score += 5);
            }

            cookies.set(
                "last_user_score",
                newScore,
            );
            cookies.set(
                `user_score_` + this.props.username,
                newScore,
            );

            this.setState((state) => state.enabled = false)
        }
    }

    render() {
        const cookies = new Cookies();
        const hasWon = this.hasWon();
        let status;

        if (hasWon) {
            status = 'GG bro';
        } else {
            const userScore = cookies.get("last_user_score");
            status = `Hey ${this.props.username}, bonne chance ! `;
            status += (userScore != null ? `Le dernier score est ${userScore}` : 'Il n\'y pas de score enregistré');
        }

        const boardItems = this.state.board.map((_, index) => {
            return this.renderSquare(index)
        })

        const players = Object.entries(cookies.getAll())
            .filter((el) => el[0].startsWith('user_score_'))
            .map((el) => {
                const name = el[0].replace('user_score_', '');
                return (<tr key={name}><td>{name}</td><td>{el[1]}</td><td>{cookies.get(`user_time_${name}`)}s</td></tr>)
            })

        const scoreBoard = hasWon ? (
            <table>
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Score</th>
                        <th>Temps</th>
                    </tr>
                </thead>
                <tbody>
                    {players}
                </tbody>
            </table>
        ) : ''

        return (
            <div>
                <div className="status">{status}</div>
                <div className="status">Score : {this.state.score}</div>
                <div className="status">Temps actuel : {this.state.chrono}s</div>
                <button onClick={() => this.resetGame()}>Reset</button>
                <div>{scoreBoard}</div>
                <div className="board-row">
                    {boardItems}
                </div>
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: null,
            difficulty: null,
            ready: false,
        };
    }

    gameBoard() {
        if (this.state.ready) {
            return <Board username={this.state.username} count={this.state.difficulty} />
        } else {
            return this.renderLogin()
        }
    }

    renderLogin() {
        return (
            <div>
                <input type="text" name="username" value={this.state.username ?? ''} onChange={(event) => {
                    this.setState((state) => state.username = event.target.value)
                }} />
                <select value={this.state.difficulty ?? 0} onChange={(event) => {
                    this.setState((state) => state.difficulty = event.target.value)
                }}>
                    <option value="0">Sélectionner une difficulté</option>
                    <option value="4">Facile</option>
                    <option value="7">Moyen</option>
                    <option value="10">Difficile</option>
                </select>
                <button onClick={() => {
                    if (this.state.difficulty && this.state.difficulty > 0 && this.state.username) {
                        this.setState((state) => state.ready = true)
                    }
                }}>GO</button>
            </div>
        );
    }

    render() {
        return (
            <div className="game">
                <div className="game-board">
                    {this.gameBoard()}
                </div>

                <div className="game-info">
                    <div>{/* status */}</div>
                    <ol>{/* TODO */}</ol>
                </div>
            </div>
        );
    }
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}






// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);



