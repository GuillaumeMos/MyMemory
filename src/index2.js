


import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Square extends React.Component {

    render() {
        return (
            <button className="square" >
                {this.props.value}
            </button>
        );
    }
}

let Arr = shuffle([1, 2, 2, 1])

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            squares: Arr,
            symbol: [],

        };
    }



    renderSquare(i) {
        return (<Square value={this.state.squares[i]}
            onClick={() => this.handleSquareClick(i)}
        />
        );
    }

    handleSquareClick(i) {

        this.setState((prevState) => {

            const squares = [...prevState.squares];

            const newSymbol = prevState.symbol.length === 2 ? [] : [...prevState.symbol];
            newSymbol.push(i);

            if (squares[newSymbol[0]] === squares[newSymbol[1]]
                && squares[newSymbol[0]] !== undefined
                && squares[newSymbol[1]] !== undefined) {

                console.log("C bon");

                squares[newSymbol[0]] = null;
                squares[newSymbol[1]] = null;
            }

            return {
                squares: squares,
                symbol: newSymbol,
            }

        }
        );

    }

    render() {


        const winner = arrayEquals(this.state.squares, Array(4).fill(null));
        let status;
        if (winner) {
            status = " gg bro";
        } else {
            status = 'OK';
        }


        return (
            <div>
                <div className="status">{status}</div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                </div>
                <div className="board-row">
                    {this.renderSquare(2)}
                    {this.renderSquare(3)}
                </div>

            </div>
        );
    }
}


class Game extends React.Component {
    render() {
        return (
            <div className="game">
                <div className="game-board">
                    <Board />
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



function arrayEquals(a, b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
}



// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);



