/*
--- Global Vars ---
*/

let expression = []; //store input in a list
//where each number is one item and each operator is one item
////e.g ["124","+","737","-","2387"]
let currentNum = ""; //currently typed number before its committed to expression
let justCalced = false //store if just calculated so it knows whether to override
let bracketCount = 0; //number of open brackets

const operators = ["+", "-", "*", "/"]; //reference for operators 
const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]; //reference for numbers as string
const displaySymbols = { //for replacing divde and multiply symbols when displaying
  "/": "÷",
  "*": "×"
};
const keyboardKeys = [ //keyboard inputs
  "enter",
  "backspace",
  "delete",
  "(",
  ")",
];



/* 
--- Event Listeners / Input Events ---
*/

const calculator = document.getElementById("calculator"); //get whole calc div
//event listener for whole calculator
calculator.addEventListener("click", (event) => {
  const btn = event.target.closest(".c-btn"); //get closest button to click 
  if (!btn) return; //exit if no button nearby 

  parseInput(btn.dataset.value); //pass value to be parsed
})

document.addEventListener("keydown", (event) => {
  let key = event.key.toLowerCase(); //get key pressed as a lowercase string

  //only act on numbers, operators, enter and backspace
  if (numbers.includes(key) || operators.includes(key) || keyboardKeys.includes(key)) {
    //translate keys 
    key = (key === "enter") ? "=" : key;
    key = (key === "delete") ? "clear" : key;

    parseInput(key); //handle input
  }
})



/*
--- Handle Input ---
*/

//short function to push currentNum easier
function pushCurrentNum() {
  expression.push(currentNum);
  currentNum = "";
}

//get button clicks and figure out how to record them
function parseInput(i) {

  switch (i) { //handle inputs
    case "=": //pressed equals
      justCalced = true; //set just calculated
      pushCurrentNum(); //add current num to list
      expression = checkExpression(expression); //do calculation
      break;

    case ("+"): //pressed an operator
    case ("*"):
    case ("/"):
      justCalced = false; //set not just calculated
      if (currentNum !== "") { //if there is a number currently
        pushCurrentNum(); //add current num to list
      }
      expression.push(i); //add operator to list
      break;

    case ("-"): //special exception for "-" to allow for negative numbers
      if (justCalced) { //if just calced
        expression.push(i); //add operator 
        justCalced = false; //reset
      } else if (currentNum !== "") { //if anything in currentNum
        pushCurrentNum(); //do normal operator code
        expression.push(i);
      } else { //else (special case for negative numbers)
        //the "-" will be for denoting a negative number
        currentNum += i; //so add it to currentNum
      }
      break;

    case ("("): //open bracket 
      if (justCalced) { //if just calced
        expression.push("*"); //push *
        justCalced = false; //reset
      } else if (currentNum !== "") { //elseif there is a current number
        pushCurrentNum(); //push to expression
        expression.push("*"); //treat bracket as multiplication and push *
      }
      expression.push("("); //add bracket
      bracketCount++; //increment bracket depth
      break;

    case (")"): //close bracket 
      if (bracketCount > 0) { //if there is an open bracket
        if (currentNum !== "") { //push and reset currentNum if there is one
          pushCurrentNum();
        }
        expression.push(")"); //add bracket
        bracketCount--; //decrement bracket depth
      }

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
      if (expression.at(-1) === ")") { //add multiply if inputting number after closebracket
        expression.push("*");
      }
      currentNum += i; //add i to currentNum
      break;
  }

  updateDisplay();
}



/*
--- Calculating ---
*/

//check expression for errors
function checkExpression(exp) {
  //error checking
  if (operators.includes(exp.at(-1))) { //if last item in input is an operator 
    exp.pop(); //cut it off and ignore
  }

  if (operators.includes(exp[0])) { //if exp starts with an operator
    outputError();
  }

  while (bracketCount > 0) { //if there are any unmatched brackets
    exp.splice(exp.findLastIndex(b => b === "("), 1); //remove the last bracket in the expression
    bracketCount--; //decrement bracket depth
  }

  //if passed all checks and prepared, send to be calculated
  if (exp.includes("(") || exp.includes(")")) { //do brackets first if any 
    exp = handleBrackets(exp);
  }

  return calculateExpression(exp);
}

//handle brackets in expression
function handleBrackets(exp) {
  while (exp.includes("(") && exp.includes(")")) { //while brackets in exp 
    const cb = exp.findIndex(b => b === ")"); //get index of first appearing close bracket 
    const ob = exp.slice(0, cb).findLastIndex(b => b === "("); //get index of matching open bracket

    const e = exp.slice(ob + 1, cb) //expression within the brackets
    const r = calculateExpression(e); //get result of expression e 
    exp.splice(ob, cb - ob + 1, r.toString()); //replace brackets and contained expression with result
  }

  return exp;
}

//calculate the given expression (exp)
function calculateExpression(exp) {
  //go Left to Right for divide and multiply
  //then go Left to Right for add and subtract 
  const precedence = [["*", "/"], ["+", "-"]]; //operators in order of precendence

  for (const ops of precedence) { //for each set of operators
    let i = 0; //counter

    while (i < exp.length) { //loop through input list
      if (ops.includes(exp[i])) { //if value is operator of current precedence 
        const v1 = Number(exp[i - 1]); //value to the left 
        const op = exp[i]; //operator 
        const v2 = Number(exp[i + 1]); //value to the right 

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
        exp.splice(i - 1, 3, result.toString());

        i--; //move back index to account for shorter array 
      } else { //else value not operator, move to next one
        i++;
      }
    }
  }

  return exp;
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



/*
--- Display ---
*/

function updateDisplay() {
  const display = document.getElementById("display"); //get element

  let output = "0";
  //if there is any input in expression or current num
  if (expression.length > 0 || currentNum.length > 0) { //type it into the display
    output = expression.map(item => displaySymbols[item] || item).join(" "); //copy expression to output 
    //+ replace divide/multiply symbols and separate with spaces

    //add the currentNum if there is one
    output = output + (currentNum !== "" ? " " + currentNum : "");
  }

  display.textContent = output; //set output text in display

  display.scrollLeft = display.scrollWidth; //auto scroll to the right
}

//output an error message to the screen
function outputError() {
  expression = []; //reset expression]
  expression.push("ERROR"); //put in only error
  updateDisplay(); //update
}
