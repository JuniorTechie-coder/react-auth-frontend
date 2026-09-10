// //primitive types
// let age: number = 21;
// let name: string = "Gun";

// console.log(age);

// let numbers: number[] = [1, 2, 3, 4]

// //tuples it help us define multiple types of data to store inside a variable 
// let user: [string, number] = ["Raj", 21];

// //Enum
// enum Color {
//     Red,
//     Green,
//     Blue
// }
// //now here it will only take values from above enum it is just like Object
// let favouriteColor: Color = Color.Blue

//Creating a Calculator 

type Operation = "add" | "subtract" | "multiply" | "divide" | "mod"

function calculate(x: number, y: number, operation: Operation): number | string {

    function add(x: number, y: number): number {
        return x + y;
    }

    
    function subtract(x: number, y: number): number {
        return x - y;
    }

    
    function multiply(x: number, y: number): number {
        return x * y;
    }

    
    function divide(x: number, y: number): number | string  {
        if(y === 0){
           return "Cannot be divide by 0";
        }else{
            return x / y;
        }
        
    }

    function mod(x: number, y: number){
        return x % y;
    }

if(operation ==="add"){
    return add(x, y);
}
if(operation === 'subtract'){
    return subtract(x, y);
}
if(operation === 'multiply'){
    return multiply(x, y);
}
if(operation === 'divide'){
    return divide(x, y);
}
if(operation === 'mod'){
    return mod(x, y);
}
else{
    return "Invalid Operation";
}

}

  // should print 5
console.log(calculate(10, 0, "divide"))   // should NOT crash
console.log(calculate(5, 3, "add"))       // should print 8
console.log(calculate(2, 3, "multiply"));
console.log(calculate(10, 3, "mod"));



//Basic function with types 


// let finalvalue: number = add(10, 34);
// console.log(finalvalue);

// //function types
// let Calculate : (x: number, y: number) => number;
// Calculate = add;

