"use strict";
// //primitive types
// let age: number = 21;
// let name: string = "Gun";
Object.defineProperty(exports, "__esModule", { value: true });
function calculate(x, y, operation) {
    function add(x, y) {
        return x + y;
    }
    function subtract(x, y) {
        return x - y;
    }
    function multiply(x, y) {
        return x * y;
    }
    function divide(x, y) {
        if (y === 0) {
            return "Cannot be divide by 0";
        }
        else {
            return x / y;
        }
    }
    function mod(x, y) {
        return x % y;
    }
    if (operation === "add") {
        return add(x, y);
    }
    if (operation === 'subtract') {
        return subtract(x, y);
    }
    if (operation === 'multiply') {
        return multiply(x, y);
    }
    if (operation === 'divide') {
        return divide(x, y);
    }
    if (operation === 'mod') {
        return mod(x, y);
    }
    else {
        return "Invalid Operation";
    }
}
// should print 5
console.log(calculate(10, 0, "divide")); // should NOT crash
console.log(calculate(5, 3, "add")); // should print 8
console.log(calculate(2, 3, "multiply"));
console.log(calculate(10, 3, "mod"));
//Basic function with types 
// let finalvalue: number = add(10, 34);
// console.log(finalvalue);
// //function types
// let Calculate : (x: number, y: number) => number;
// Calculate = add;
//# sourceMappingURL=calculator.js.map