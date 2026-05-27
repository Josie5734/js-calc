let expression = []; //store input in a list
//where each number is one item and each operator is one item
////e.g ["124","+","737","-","2387"]
let currentNum = ""; //currently typed number before its committed to expression
let justCalced = false //store if just calculated so it knows whether to override

const operators = ["+", "-", "*", "/"];
const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

const calculator = document.getElementById("calculator"); //get whole calc div
//event listener for whole calculator
calculator.addEventListener("click", (event) => {
  const btn = event.target.closest(".c-btn"); //get closest button to click 
  if (!btn) return; //exit if no button nearby 

  parseInput(btn.dataset.value); //pass value to be parsed
})

//get button clicks and figure out how to record them
function parseInput(i) {

  switch (i) { //handle inputs
    case "=": //pressed equals
      justCalced = true; //set just calculated
      expression.push(currentNum); //add current num to list
      currentNum = ""; //reset current num
      calculate(); //do calculation
      break;

    case ("+"): //pressed an operator
    case ("-"):
    case ("*"):
    case ("/"):
      justCalced = false; //set not just calculated
      if (currentNum !== "") { //if there is a number currently
        expression.push(currentNum); //add current num to list
        currentNum = ""; //reset current num
      }
      expression.push(i); //add operator to list
      break;

    case ("clear"): //clear
      justCalced = false; //set not just calculated
      currentNum = ""; //clear everything
      expression = [];
      break;

    case ("backspace"): //backspace
      justCalced = false; //set not just calculated
      if (currentNum !== "") { //if there is a currentNum 
        currentNum = currentNum.slice(0, -1); //cut off last character 
      } else { //else go to last item of expression
        let i = expression[expression.length - 1] //get item
        i = i.slice(0, -1) //cut off last character
        if (i === "") { //if now empty 
          expression.pop() //remove from expression 
        } else { //else  
          expression[expression.length - 1] = i //replace with removed version
        }
      }
      break;

    default: //else default it has to be a number
      if (justCalced) { //reset expression if number is first input after calculating
        currentNum = "";
        expression = [];
        justCalced = false;
      }
      currentNum += i; //add i to currentNum
      break;
  }

  updateDisplay();
}

//do the calculations stored
function calculate() {
  if (operators.includes(expression.at(-1))) { //if last item in input is an operator 
    expression.pop(); //cut it off and ignore
  }

  //go Left to Right for divide and multiply
  //then go Left to Right for add and subtract 
  const precedence = [["*", "/"], ["+", "-"]]; //operators in order of precendence

  for (const ops of precedence) { //for each set of operators
    let i = 0; //counter

    while (i < expression.length) { //loop through input list
      if (ops.includes(expression[i])) { //if value is operator of current precedence 
        const v1 = Number(expression[i - 1]); //value to the left 
        const op = expression[i]; //operator 
        const v2 = Number(expression[i + 1]); //value to the right 

        let result; //store result of operation 

        switch (op) { //do operation 
          case "*":
            result = opMultiply(v1, v2);
            break;
          case "/":
            result = opDivide(v1, v2);
            break;
          case "+":
            result = opAdd(v1, v2);
            break;
          case "-":
            result = opSubtract(v1, v2);
            break;
        }

        //replace the v1,op,v2 with result 
        expression.splice(i - 1, 3, result.toString());

        i--; //move back index to account for shorter array 
      } else { //else value not operator, move to next one
        i++;
      }
    }
  }
}

//operations

function opAdd(a, b) {
  return a + b;
}

function opSubtract(a, b) {
  return a - b;
}

function opMultiply(a, b) {
  return a * b;
}

function opDivide(a, b) {
  return a / b;
}


function updateDisplay() {
  const display = document.getElementById("display"); //get element

  display.textContent = expression.join(" ") + (currentNum !== "" ? " " + currentNum : "");
}




/* 
TODO:
styling and stuff
*/
