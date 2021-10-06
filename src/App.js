import './App.css';
import React, { Component } from 'react';


const initialLevel = [
  {value: 'easy', label: 'Easy'},
  {value: 'medium', label: 'Medium'},
  {value: 'hard', label: 'Hardcord'},
]

const initialGrid = [
  {value: 10, label: '10'},
  {value: 20, label: '20'},
  {value: 30, label: '30'}
]

export default class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      rows: 10,
      cols: 10,
      grid: [],
      snake: {
        head: {},
        tail: []
      },
      foodPos: {},
      speed: 300,
      direction: '',
      die: false,
      isMove: true,
      score: 0,
      scoreFactor: 1,
      victory: false,
      level: 'easy',
    };
    this.handleKey = this.handleKey.bind(this);
  } 

  //AVOID GOING BACKWARDS AND LOSE THE GAME
  moveable(bool){
    if(bool === true){
      this.setState({ isMove : true});
    }
    if(bool === false){
      this.setState({ isMove: false});
    }
  }

  randomFood(){
    let newRow = Math.floor((Math.random() * this.state.rows));
    let newCol = Math.floor((Math.random() * this.state.cols));
    let newPos = {col: newCol, row: newRow};
    if (!this.state.snake.tail.includes(newPos))  
      return newPos;
    else{
      return this.randomFood();
    }
  }

  //MAKE THE FOOD UPDATE ONLY 1 INSTEAD OF 2 ( when put in the snakeMove )
  snakeEatFood(){
    this.setState({ foodPos : this.randomFood() })
  }

  snakeMove(){
    this.setState((state) => {
      let { 
        direction,
        snake,
        foodPos,
        die,
      } = state;

      const {row, col} = state.snake.head;
      let head = {row, col}; //use destructing of head above to new head

      let {tail} = snake;


      //Check if die or not to remove interval
      if (state.die){
        clearInterval(window.tickFnInterval);
      }

      //Snake eat food
      if (head.row === foodPos.row && head.col === foodPos.col){
        this.snakeEatFood();
    
        //longer at tail
        let items = [...tail];
        let item = {col: head.col, row: head.row};
        items.unshift(item);
        tail = items;
      }

      //SNAKE MOVE
      let snakeBody = [...tail];
      let newHead = {col, row};


      switch (direction){
        case 'LEFT':
          if(head.col === 0){
            newHead = head;
            head.col = state.cols - 1;
            break;
          }
          else{        
            newHead = head; 
            head.col--;
          break;
          }
        
        case 'UP':
          if(head.row === 0){
            newHead = head;
            head.row = state.rows -1;
            break;
          }
          else{
            newHead = head;
            head.row--;
            break;
          }

        case 'RIGHT':
          if(head.col === state.cols - 1){
            newHead = head;
            head.col = 0;
            break;
          }
          else {
            newHead = head;
            head.col++;
            break;
          }
  
        case 'DOWN':
          if(head.row === state.rows - 1){
            newHead = head;
            head.row = 0;
            break;
          }
          else{
            newHead = head;
            head.row++;
            break;
          }

        default:
          newHead = head;
          break;
      }

      //push the new head then remove the tail
      snakeBody.push(newHead);
      snakeBody.shift();


      
      const newState = {
        ...state, //previous state
        foodPos,
        snake:{
          head,
          tail : snakeBody, // make tail = snakeBody
        }
      }

      //update grid to see new css (the snake and food)
      const grid = this.resetGrid(newState);
      //update score
      const score = (newState.snake.tail.length - 1) * newState.scoreFactor;

      //return new state
      return {
        ...newState,
        grid,
        score,
        die
      }
    })

  }

  handleKey(e){
    let { isMove } = this.state;
    if(isMove){
      let { direction } = this.state;
      switch(e.keyCode){
        case 65:
          if(direction === 'RIGHT')
            break;
          else {
            direction = 'LEFT';
            this.moveable(false);
            break;
          }
  
        case 87:
          if (direction === 'DOWN')
            break;
          else{
            direction = 'UP';
            this.moveable(false);
            break;
          }
  
        case 68:
          if (direction === 'LEFT')
            break;
          else{
            direction = 'RIGHT';
            this.moveable(false);
            break;
          }
  
        case 83: 
          if(direction === 'UP'){
            break;
          }
          else{
            direction = 'DOWN';
            this.moveable(false);
            break;
          }
      }
      
      const newState = {
        ...this.state,
        direction,
      }
      this.setState(state=>{
        return {
          ...newState
        }
      })
    }

  }

  resetGrid(state = {}){
    if(!Object.keys(state).length){
      state = this.state;
    }

    const {
      rows,
      cols,
      foodPos,
      snake
    } = state;

    const arr = [];
    for (let row = 0; row < rows; row ++){
      for (let col = 0; col < cols; col++){
        const food = (foodPos.row === row && foodPos.col === col);
        const head = (snake.head.row === row && snake.head.col === col);
        let isTail = false;
        snake.tail.forEach(item => {// isTail equals tail length
          if(item.row === row && item.col === col)
            isTail = true
        })
        arr.push({
          row: row,
          col: col, // can be written as row, col
          food: food,
          head: head,
          isTail
        })
      }
    }
    this.setState({grid : arr});
  }



  //Check If Collapse
  checkCollapse(){
    let { head } = this.state.snake;
    let { die } = this.state;
    let snakeBody = [...this.state.snake.tail];
    snakeBody.pop();
    snakeBody.forEach(part=>{
      if(head.col === part.col && head.row === part.row){
        die = true;
        this.gameOver();
      }
    })
  }

  resetWhenAlert(){
    this.setState(state=>{
      const newState = {
        ...state,
        foodPos: this.randomFood(),
        snake: {
          head:{
            row: 0,
            col: 0
          },
          tail: [{col: 0, row: 0}]
        }
      }

      const grid = this.resetGrid(newState);

      return {
        ...newState,
        grid,
        direction: ''
      }
    })
  }

  gameOver(){
    alert(`Game Over. Snake's length: ${this.state.snake.tail.length}`);
    this.resetWhenAlert();
  }

  gameVictory(condition=99){
    if(this.state.snake.tail.length == condition){
      alert(`You won. Snake's length: ${this.state.snake.tail.length}. Congratulation!!!`);
      this.resetWhenAlert();
    }
  }

  handleSelectChange = (e) =>{
    let value = e.target.value
    this.setState({ level : value });
    if (value === 'easy'){
      this.gameVictory(50);
      this.setState({ speed: 300 });
    }
    if (value === 'medium'){
      this.gameVictory(70);
      this.setState({ speed: 100 });
    }
    if (value === 'hard'){
      this.gameVictory(90);
      this.setState({ speed: 1 });
    }
  }

  
  handleGridChange = (e)=>{
    let value = e.target.value;
    if(value == 10){
      this.setState({
        rows: 10,
        cols: 10
      })
    }
    if(value == 20){
      this.setState({
        rows: 20,
        cols: 20
      })
    }
    if(value == 30){
      this.setState({
        rows: 30,
        cols: 30
      })
    }
  }

  //Update Grid, handle interval
  componentDidMount(){
    this.setState(state=>{
      const newState = {
        ...state,
        foodPos: this.randomFood(),
        snake: {
          head:{
            row: 0,
            col: 0
          },
          tail: [{col: 0, row: 0}]
        }
      }

      const grid = this.resetGrid(newState);

      return {
        ...newState,
        grid,
      }
    })

    //handle key press event
    document.body.addEventListener('keydown', this.handleKey);

    //set timeTick
    window.tickFnInterval = setInterval(()=>{
      this.moveable(true);
      this.snakeMove();
    }, this.state.speed);
  }

  componentDidUpdate(){
    this.checkCollapse();
  }

  componentWillUnmount(){
    document.body.removeEventListener('keydown', this.handleKey);
    clearInterval(window.tickFnInterval);
    this.checkCollapse();
  }

  render(){
    const { grid } = this.state;
    return (
      <div className="App">
        <h1>SNAKE GAME</h1>
        <h3 className='start'>PRESS W,A,S,D KEYS TO START</h3>
        <div className={`grid-container block-${this.state.rows == 10 ? 'ten' : this.state.rows == 20 ? 'twenty' : 'thirty'}`}>
          {grid && grid.map(item=>(
              <div
                key={`${item.row.toString()} - ${item.col.toString()}`}
                className={
                  item.head ? 'grid-item is-head' 
                  : item.isTail ? 'grid-item is-tail'
                  : item.food ? 'grid-item is-food' :'grid-item'}
              >
              </div>
            )
          )}
        
        </div>
        <div className='info'>
            <div className='score'>
              <h3>SCORE</h3>
              <p>{this.state.score}</p>
            </div>
            <div className='change-level'>
              <h3>CHANGE DIFFICULT</h3>
              <select value={this.state.level} onChange={this.handleSelectChange}>
                {initialLevel.map(option=>(
                  <option value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className='change-grid'>
              <h3>CHANGE GRID</h3>
              <select value={this.state.rows} onChange={this.handleGridChange}>
                {initialGrid.map(option=>(
                  <option value={option.value}>{`${option.label}x${option.label}`}</option>
                ))}
              </select>
            </div>
            <div className='win-condition'>
              <h3>WIN CONDITION</h3>
              <p>Score: {this.state.level === 'easy' ? '50' 
                : this.state.level ==='medium' ? '70' : '90'}
              </p>
            </div>
        </div>
      </div>
    );
  }
}

