// Things that aren't working with ostack: .s, empty/reset functions...

// Defined stack class
function Stack(){
    this.size = 0;      // initializing size to 0
    this.stack = {};    // stack as an object
}

// stack methods - push and pop
Stack.prototype.push = function(elem){
    this.stack[this.size] = elem;
    this.size++;
}

Stack.prototype.pop = function(){
    // var top = this.stack[this.size];
    // delete this.stack[this.size];
    // this.size--;
    // return top;
    var top = this.stack[this.size-1];
    var s = this.size-1;
    delete this.stack[s.toString()];
    this.size--;
    return top;
}

// ObservableStack class - subclass of stack class defined above
// Allowing for inheritence
ObservableStack.prototype = new Stack();
// Implementing the observers
function ObservableStack(){
    this.observers = [];     // observers - a list of functions
}

ObservableStack.prototype.subscribe = function(fn){
    this.observers.push(fn);
}

ObservableStack.prototype.fire = function(){
    this.observers.forEach(function(fn){
    fn(this.stack);
    }, this);
}


ObservableStack.prototype.push = function(elem){
    Stack.prototype.push.call(this, elem);
    ObservableStack.prototype.fire.call(this);
} 

ObservableStack.prototype.pop = function(){
    var top = Stack.prototype.pop.call(this); // set as var and return it
    ObservableStack.prototype.fire.call(this); // goes after
    return top;
}

// Empty stack
function emptyStack(stack){
    while(stack.length > 0){
        stack.pop();
    }
}

// Allowing for HTML buttons of user-defined functions
function makebtn(stack, key, terminal){
    return $('<button/>', {
        text: key,
        id: 'btn_'+key,
        click: function(){process(stack, key, terminal); runRepl(terminal , stack);},
        'class':'btn btn-danger'
    });
}

// See the following on using objects as key/value dictionaries
// https://stackoverflow.com/questions/1208222/how-to-do-associative-array-hashing-in-javascript
var words = {};
var userdef = {};

words["."] = popp;
words["+"] = add;
words["-"] = sub;
words["*"] = mult;
words["/"] = div;
words["="] = equals;
words["<"] = less;
words[">"] = greater;
words["nip"] = nip;
words["swap"] = swap;
words["over"] = over;

words["circle"] = circle;

// Circle function - part 12 of the final project
// Similar to the stack functions, arithmetic, etc, tbe circle function consumes 3 elements 
// from the stack, and uses them to create a circle - they are the radius and (x,y) coordinates,
// respectively. (ie radius xpos ypos followed by the keyword circle)
// Resources:
// https://www.w3schools.com/tags/canvas_arc.asp
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes
function circle(stack){
    var canvas = document.getElementById('circle');     // getting the circle canvas from html
    var display = canvas.getContext('2d');              // allowing for display of 2D canvas
    var y = stack.pop();
    var x = stack.pop();
    var radius = stack.pop();                           // must be done in 'reverse' order for obvious reasons
    display.canvas.height = Math.max(y,x,radius)*2;
    display.canvas.width = Math.max(y,x,radius)*2;
    display.beginPath();
    display.arc(x,y,radius,0,2 * Math.PI, false);
    display.lineWidth = 1;
    display.strokeStyle = '#000000'                     // creating a black circle
    display.stroke();                                   // actually making the circle; stroking path outline
}

// Stack functions: ., +, -, *, /, =, <, >, nip, swap, over
function popp(stack){
    stack.pop();
}

function add(stack){
    var first = stack.pop();
    var second = stack.pop();
    stack.push(first+second);
}

function sub(stack){
    var first = stack.pop();
    var second = stack.pop();
    stack.push(first-second);
}

function mult(stack){
    var first = stack.pop();
    var second = stack.pop();
    stack.push(first*second);
}

function div(stack){
    var first = stack.pop();
    var second = stack.pop();
    stack.push(first/second);
}

function equals(stack){
    var first = stack.pop();
    var second = stack.pop();
    if(first === second){
        stack.push(-1)
    }
    else{
        stack.push(0)
    }
}

function less(stack){
    var first = stack.pop();
    var second = stack.pop();
    if(first < second){
        stack.push(-1)
    }
    else{
        stack.push(0)
    }
}

function greater(stack){
    var first = stack.pop();
    var second = stack.pop();
    if(first > second){
        stack.push(-1)
    }
    else{
        stack.push(0)
    }
}

function nip(stack){
    var first = stack.pop();
    var second = stack.pop();
    stack.push(first);
}

function swap(stack){
    var first = stack.pop();
    var second = stack.pop();
    stack.push(first);
    stack.push(second);
}

function over(stack){
    var first = stack.pop();
    var second = stack.pop();
    stack.push(second);
    stack.push(first);
    stack.push(second);
}

/**
 * Print a string out to the terminal, and update its scroll to the
 * bottom of the screen. You should call this so the screen is
 * properly scrolled.
 * @param {Terminal} terminal - The `terminal` object to write to
 * @param {string}   msg      - The message to print to the terminal
 */
function print(terminal, msg) {
    terminal.print(msg);
    $("#terminal").scrollTop($('#terminal')[0].scrollHeight + 40);
}

/** 
 * Sync up the HTML with the stack in memory
 * @param {Array[Number]} The stack to render
 */
function renderStack(stack) {
    $("#thestack").empty();
    for(var i = Object.keys(stack).length-1; i>=0; i--){
        $("#thestack").append("<tr><td>" + stack[i] + "</td></tr>");
    }
    // Below no longer works b/c stack.slice() is no longer a method for 
    // the stack object. (.slice is an array method...)
    // stack.slice().reverse().forEach(function(element) {
    //     $("#thestack").append("<tr><td>" + element + "</td></tr>");
    // });
};

/** 
 * Process a user input, update the stack accordingly, write a
 * response out to some terminal.
 * @param {Array[Number]} stack - The stack to work on
 * @param {string} input - The string the user typed
 * @param {Terminal} terminal - The terminal object
 */
function process(stack, input, terminal) {
    // The user typed a number
    var inputstring = input.trim().split(/ +/);
    for(var i = 0; i < inputstring.length; i++){
        // Implementing user-defined words
        if (inputstring[i] === ":"){
            i++; // goes to the next element - the function name...
            var userdefinedfn = inputstring[i]; // setting fn name to a var
            i++;
            var fnstring = "";
            while(inputstring[i] != ";"){   // ; - end of user-defined fn
                fnstring += inputstring[i] + " "; // appending it to fnstring
                i++;        // going to the next element
            }
            userdef[userdefinedfn] = fnstring;
            // Adding the button to the right class
            $("#user-defined-funcs").append(makebtn(stack, userdefinedfn, terminal));
            $("#user-defined-funcs").append('<br></br>');
        }
        else if(!(isNaN(Number(inputstring[i])))) {
            print(terminal,"pushing " + Number(inputstring[i]));
            stack.push(Number(inputstring[i]));
        } 
        else if(inputstring[i] === ".s"){
            print(terminal, " <" + stack.length + "> " + stack.slice().join(" "));
        }
        else if(inputstring[i] in words){
            words[inputstring[i]](stack);
        }
        else if (inputstring[i] in userdef){
            process(stack, userdef[inputstring[i]], terminal);
        }

        else {
            print(terminal, ":-( Unrecognized input");
        }
}
    //renderStack(stack);   // remove when implementing ostack
    console.log(stack);

};

function runRepl(terminal, stack) {
    terminal.input("Type a forth command:", function(line) {
        print(terminal, "User typed in: " + line);
        process(stack, line, terminal);
        runRepl(terminal, stack);
    });
};

// Whenever the page is finished loading, call this function. 
// See: https://learn.jquery.com/using-jquery-core/document-ready/
$(document).ready(function() {
    var terminal = new Terminal();
    terminal.setHeight("400px");
    terminal.blinkingCursor(true);
    
    // Find the "terminal" object and change it to add the HTML that
    // represents the terminal to the end of it.
    $("#terminal").append(terminal.html);

    // observable stack vs. array stack - comment out whichever
    //var stack = [];
    var ostack = new ObservableStack(); // instance of ObservableStack
    ostack.subscribe(renderStack); // registering/subscribing to renderStack


    print(terminal, "Welcome to HaverForth! v0.1");
    print(terminal, "As you type, the stack (on the right) will be kept in sync");

    //runRepl(terminal, stack); 
    runRepl(terminal, ostack);

    // Emptying the stack
    $("#reset").click(function() { 
        emptyStack(ostack);
        //renderStack(stack);       // remove when implementing ostack
        // adding the word "empty" when reset button is clicked
        $("#thestack").append("<tr><td>" + "empty" + "</td></tr>");
    });

});











