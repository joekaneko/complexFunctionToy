'use strict';

const cnum = mathtoys.complex;

var bn = BigNumber(5);
console.log(bn.exponentiatedBy(5).toString());

let ctx;


function tokenize(funcString) {
    let valueList = [];
    let tokenList = [];
    funcString += "$";
    
    let currentNum = "";
    let prevChar = "";
    
    let digitTest = RegExp(/[0123456789.]/);
    
    for (let i = 0; i < funcString.length; i++) {
        let character = funcString[i];
        if (digitTest.test(character)) {
            currentNum += character;
            prevChar = ""; //is this right?
        }
        else if (currentNum) {
            if (character == "z") {
                
                valueList.push(cnum.rmul(parseFloat(currentNum), cnum.one));
                tokenList.push("P");
                valueList.push("*");
                tokenList.push("*");
                valueList.push(character);
                tokenList.push("P");
                currentNum = "";
                
            }
            else if (character == "i") {
                valueList.push(cnum.rmul(parseFloat(currentNum), cnum.ii));
                tokenList.push("P");
                currentNum = "";
                
            }
            else if (character == "-") {
                valueList.push(cnum.rmul(parseFloat(currentNum), cnum.one));
                tokenList.push("P");
                valueList.push("+");
                tokenList.push("+");
                valueList.push({re: -1, im: 0});
                tokenList.push("P")
                valueList.push("*");
                tokenList.push("*");
                currentNum = ""
            }
            else {
                //console.log(currentNum);
                valueList.push(cnum.rmul(parseFloat(currentNum), cnum.one));
                tokenList.push("P");
                valueList.push(character);
                tokenList.push(character);
                currentNum = "";
            }
            prevChar = character;
        
        }
        else {
            
            if (character == "z") {
                valueList.push(character);
                tokenList.push("P");
                prevChar = character;
            }
            else if (character == "i") {
                valueList.push(cnum.ii);
                tokenList.push("P");
                prevChar = character;
            }
            else if (character == "-") {
                if (!prevChar || prevChar == "(" || prevChar == "^") {
                    console.log("this");
                    valueList.push({re: -1, im: 0});
                    tokenList.push("P")
                    valueList.push("*");
                    tokenList.push("*");
                    prevChar = "*";
                    
                }
                
                else {
                    console.log("this2")
                    valueList.push("+");
                    tokenList.push("+");
                    valueList.push({re: -1, im:0});
                    tokenList.push("P");
                    valueList.push("*");
                    tokenList.push("*");
                    prevChar = "*";
                }
                
            }
            
            else {
                valueList.push(character);
                tokenList.push(character);
                prevChar = character;
            }
            }
        
        
        }
    
    return [valueList, tokenList];
    }
    
function EvalMachine(funcString) {
    let t = tokenize(funcString);
    this.expression = t[0];
    this.tokenizedExpression = t[1];
    this.stateLog = [new T_0()];
    this.evaluation = [];    
    //for (let i= 0; i <this.expression.length; i++) {
      //  console.log(this.expression[i])
    //}
    //console.log(this.tokenizedExpression);
    }
/*
* Places the nextState onto the stateLog;
* If head of expression is a number, z, or a function (i.e. it's a promoted value) it gets moved to the evaluation list;
* Otherwise (i.e. it's an arithmetic operator), it's discarded.
 */
EvalMachine.prototype.go_to = function(nextState) {
        this.stateLog.push(new nextState());
        this.tokenizedExpression.shift();
        if (typeof(this.expression[0].re) == typeof(0)){
            
            let c = this.expression.shift();
            this.evaluation.push( function(z) {
                return c;
                });
        }
        else if (this.expression[0] == "z") {
            this.expression.shift();
            this.evaluation.push( function(z) {
                return z;
            });
        }
        else if (typeof(this.expression[0]) == "function") {
            this.evaluation.push(this.expression.shift());
        }
        else this.expression.shift();
}

EvalMachine.prototype.t_to_E = function() {
    this.expression.unshift(this.evaluation.pop());
    this.tokenizedExpression.unshift("E");
    this.stateLog.pop();
}
EvalMachine.prototype.f_to_T = function() {
    this.expression.unshift(this.evaluation.pop());
    this.tokenizedExpression.unshift("T");
    this.stateLog.pop();
}
EvalMachine.prototype.p_to_F = function() {
    
    //console.log("eval " + this.evaluation);
    this.expression.unshift(this.evaluation.pop());
    this.tokenizedExpression.unshift("F");
    this.stateLog.pop();
}
EvalMachine.prototype.e_plus_T_to_E = function() {
    let t_term = this.evaluation.pop();
    let e_term = this.evaluation.pop();
    this.expression.unshift(function(z) {
        return cnum.add(t_term(z), e_term(z));
    });
    this.tokenizedExpression.unshift("E");
    for (var i = 0; i < 3; i++) { 
        this.stateLog.pop();
        }
}
EvalMachine.prototype.t_times_F_to_T = function() {
    let f_term = this.evaluation.pop();
    let t_term = this.evaluation.pop();
    this.expression.unshift(function(z) {
        return cnum.mul(f_term(z), t_term(z));
    });
    this.tokenizedExpression.unshift("T");
    for (var i = 0; i < 3; i++) { 
        this.stateLog.pop();
        }
}
EvalMachine.prototype.f_to_the_P_to_F = function() {
    let p_term = this.evaluation.pop();
    let f_term = this.evaluation.pop();
    this.expression.unshift(function(z) {
        return cnum.power(f_term(z), p_term(1).re);
    });
    this.tokenizedExpression.unshift("F");
    for (var i = 0; i < 3; i++) { 
        this.stateLog.pop();
        }
}

EvalMachine.prototype.parens_E_to_P = function() {
    //console.log("parens " + this.expression);
    //console.log("tokenized " + this.tokenizedExpression);
    let p_term = this.evaluation.pop();
    this.expression.unshift(p_term);
    this.tokenizedExpression.unshift("P");
    for (var i = 0; i < 3; i++) { 
        this.stateLog.pop();
        }
    
}
EvalMachine.prototype.finalEval = function() {
    this.tokenizedExpression.shift();
   // console.log("eval " + this.evaluation);
    return this.evaluation.pop();
}
function T_0() {
    this.action = function(nextToken){
        if (nextToken == "(")
            return ["go_to", T_5]
        else if (nextToken == "P")
            return ["go_to", T_4]
        else if (nextToken == "F") 
            return ["go_to", T_3];
        else if (nextToken == "T")
            return ["go_to", T_2];
        else if (nextToken == "E")
            return ["go_to", T_1];
        else
            console.log("error");
    }}

function T_1() {
    //just saw "E"
    this.action = function(nextToken) {
        
        if (nextToken == "+")
            return ["go_to", T_6]
        else if (nextToken == "*")
            return ["go_to", T_7]
        else if (nextToken == ")")
            return ["go_to", T_13]
        else if (nextToken == "$")
            return ["finalEval", null]
        else console.log("T_1 error: " + nextToken)
}}

function T_2() {
    // Just saw "T"
    this.action = function(nextToken) {
        if (nextToken == "*")
            return ["go_to", T_7]
        else if (nextToken == "+" || nextToken == ")" || nextToken == "$")
            return ["t_to_E", null]
        else console.log("T_2 error") 
    }
}

function T_3() {
    // Just saw "F"
    this.action = function(nextToken) {
        if (nextToken == "^")
            return ["go_to", T_8]
        else if (nextToken == "*" || nextToken == "+"|| nextToken == ")" || nextToken == "$")
            return ["f_to_T", null]
        else console.log("T_3 error")
    }
}

function T_4() {
    // Just saw "P"
    this.action = function(nextToken) {
        if (nextToken == "^" || nextToken == "*" || nextToken == "+" || nextToken == ")" || 
            nextToken == "$")
            return ["p_to_F", null]
        else console.log("T_4 error")
    }
}

function T_5() {
    // Just saw "("
    this.action = function(nextToken) {
        if (nextToken == "(")
            return ["go_to", T_5]
        else if (nextToken == "P")
            return ["go_to", T_4]
        else if (nextToken == "F")
            return ["go_to", T_3]
        else if (nextToken == "T")
            return ["go_to", T_2]
        else if (nextToken == "E")
            return ["go_to", T_1]
    }
}

function T_6() {
    // Just saw "E+"
    this.action = function(nextToken) {
        if (nextToken == "T")
            return ["go_to", T_10]
        else if (nextToken == "F")
            return ["go_to", T_3]
        else if (nextToken == "P")
            return ["go_to", T_4]
        else if (nextToken == "(")
            return ["go_to", T_5]
        else console.log("T_6 error: "+nextToken)
    }
}

function T_7() {
    //Just saw "T*"
    this.action = function(nextToken) {
        if (nextToken == "F"){
            return ["go_to", T_11];
        }
        
        else if (nextToken == "P") {
            return ["go_to", T_4];
        }
        else if (nextToken == "(") {
            return ["go_to", T_5];
        }
    }
}

function T_8() {
    this.action = function(nextToken) {
        // Just saw "F^"
        if (nextToken == "P")
            return ["go_to", T_12]
        else if (nextToken == "(")
            return ["go_to", T_5]
        else console.log("T_8 error")
    }
}

function T_9() {
    // Just saw "(E"
    this.action = function(nextToken) {
        if (nextToken == ")")
            return ["go_to", T_13]
        else if (nextToken == "+")
            return ["go_to", T_6]
    }
}

function T_10() {
    // Just saw "E+T"
    this.action = function(nextToken) {
        if (nextToken == "+" || nextToken == "$" || nextToken == ")")
            return ["e_plus_T_to_E", null]
        else if (nextToken == "*")
            return ["go_to", T_7]
        else if (nextToken == "^") 
            return ["go_to", T_8]
    }
}

function T_11() {
    // Just saw "T*F"
    this.action = function(nextToken) {
        if (nextToken == "+" || nextToken == "*" || nextToken == ")" || nextToken == "$")
            return ["t_times_F_to_T", null]
        else if (nextToken == "^")
            return ["go_to", T_8]
    }
}

function T_12() {
    // Just saw "F^P"
    this.action = function(nextToken) {
        if (nextToken == "+" || nextToken == "*" || nextToken == ")" || nextToken == "$")
            return ["f_to_the_P_to_F", null]
    }
}

function T_13() {
    // Just saw "(E)"
    this.action = function(nextToken) {
        if (nextToken == "+" || nextToken == "*" || nextToken == "^" || nextToken == ")" || nextToken =="$")
            return ["parens_E_to_P", null]
    }
}

function fact(n) {
    var facts = {1:1}
    if (n in facts) {
        return facts[n]
    }
    else {
        return n * fact(n-1)
    }
    
}
//let f = "(3*z-4)*(z^9+.5z^5+i)*(z+3)^-1";
//let f = "(z^10+z^9+z^8-3*z^7+13*z^6+z^5+z^4+z^3+z^2+z+1)";
//let f = "(z-3)*(z-2.5)^3*(z-2)^-2*(z-1.75)*(z-1.5)*(z-1.25)*(z-1)*z^3*(z+1+.5i)*(z+1.2+.8i)^-2"
//let f = "z^20*(z+1i)^(-20)";
//let f = "z*(z-1)*(z-3)*(z-3-.25i)*(z+4)*(z-3i)*(z-2i)^2*(z-2.5i)^-4*(z-1.5i)^2*(z-1i)^-4";let f = "z*(z-1)*(z-3)*(z-3-.1i)^-1*(z+4)*(z-3i)*(z-2i)^2*(z-2.5i)^-3*(z-1.5i)^2*(z-1i)^-4";
//let f = "(z-.1)^-1*(z-.3)^2*(z+.4)^2*(z-.3i)^-1*(z-.2i)^3*(z-.25i)^-3*(z-.15i)^2*(z-.1i)^-4*(z-2-1i)^4*(z-1.9-.9i)^-3*(z+2+1i)^-1*(z+2.1+1.2i)^-2*(z+.15+2.1i)";
//let f = "("+exponential(100,"z")+"-1)*z^(-1)";
//let f = "(z+i)^10*z^20"
//let f = "("+exponential(50,"z")+"-1)^3"
let f = exponential(100, "(z)");
//let f = sine(50, "(z^4-2)");
//let f = sine(50,"((z+3.1)*(-z+1)^(-1))"); //great with .01x, .01y
//let f = sine(80,"(z^(-1))");
//let f = "1"
//for (let i = 1; i <100;i++){
  // f += "+(z^"+(i).toFixed(20) +")"
//}

//let f = "0.005*z^2+z-4";

function exponential(n, z) {
    let f = "1"
    for (let i = 1; i < n+1; i ++) {
        f += "+(" + (1/fact(i)).toFixed(100) + "*"+ z +"^" + i + ")" 
    }
    return f;
}

function cosine(n, z) {
    let f = "1"
    let sign = -1
    for (let i = 1; i < n+1; i++) {
        console.log(f)
        if (i % 2 == 0){
            f += "+(" + sign + "*" + (1/fact(i)).toFixed(100)+ "*" +z + "^" + i + ")";
            sign *= -1;
        }
    }
    return f;
}

function sine(n, z) {
    let f = "0"
    
    for (let i = 0; i < n; i++) {
        f += "+(" + (-1)**(i) + "*" + (1/fact(2*i+1)).toFixed(100)+ "*" +z + "^" + (2*i+1) + ")";
        }
    
    return f;
}

let stateMach = new EvalMachine(f);
//console.log(stateMach.expression);
//console.log(stateMach.tokenizedExpression);
//console.log(stateMach.stateLog);
let g = function(z) {};
while (stateMach.tokenizedExpression.length > 0) {
    
    let func_and_arg = stateMach.stateLog[stateMach.stateLog.length-1].action(stateMach.tokenizedExpression[0]);
   //console.log(func_and_arg);
    
    
    g = stateMach[func_and_arg[0]](func_and_arg[1]);
   
    }
console.log("Compiled g.")

function onLoad() {
    // leaving ctx as a global var for now...
    ctx = canvas.getContext('2d');
    ctx.translate(360,360);
    ctx.scale(1, -1);
    let width = canvas.width;
    let height = canvas.height;
   
    let pixelcoeff = .1
/* make a function that takes "polynomial" string and turns it into an array of terms (each a function).   
 Then evalutation  */  
    
    for (let x = -width/2; x < width/2; ++x){
        for (let y = -height/2; y < height/2; ++y){
            
            let z = {re: pixelcoeff*x, im: pixelcoeff*y};
            let theta = cnum.phase(g(z));
            ctx.fillStyle = phaseToColor(theta);
            ctx.fillRect(x, y, 1, 1);
           // let value = g(z);
            //if (!isNaN(value.re)) {
              //  let theta = cnum.phase2(g(z));
                //ctx.fillStyle = phaseToRGB(theta);
                //ctx.fillRect(x, y, 1, 1);
            //}
        }
    }
    
    // try supersampling
    /*for (let x = -width/2; x < width/2; x++) {
        
        for (let y = -height/2; y < height/2; y++) {
            if (x%50==0 && y%50 ==0){
                console.log(x+", "+y);
            }
            let imPoint = cnum.zero;
            for (let xSamp = 0; xSamp < 7; xSamp++) {
                for (let ySamp = 0; ySamp < 7; ySamp++) {
                    imPoint = cnum.add(imPoint, g({re: pixelcoeff * (x + xSamp*.5), im: pixelcoeff * (y + ySamp*.5)}));
                }
            }
            let avgPoint = cnum.rmul((1/(7.0**2)), imPoint);
            //ctx.fillStyle = phaseToColor(cnum.phase(avgPoint));
            ctx.fillStyle = phaseToRGB(cnum.phase2(avgPoint));
            ctx.fillRect(x, y, 1, 1);
        }
    }*/
    
}
    
function phaseToColor(phase) {
    
    let degrees = phase*(360.0/(2*Math.PI));
    //if (Math.round(degrees) == -47) {
        //console.log(degrees);
    //}
    return 'hsl('+degrees+', 100%, 50%)';
}

function phaseToRGB(phase) {
    
    let i = Math.round(255*phase/(2*Math.PI))
    return 'rgb('+ Math.round(255*cycle[i][0]) +','+Math.round(255*cycle[i][1]) +','+Math.round(255*cycle[i][2]) +')'
   
}

let cycle =[
[0.93769, 0.33352, 0.94809],
[0.94383, 0.34283, 0.94239],
[0.94939, 0.35275, 0.93613],
[0.95439, 0.36323, 0.92931],
[0.95886, 0.37422, 0.92198],
[0.96283, 0.38558, 0.91416],
[0.96634, 0.39727, 0.90588],
[0.96944, 0.40921, 0.89721],
[0.97216, 0.4213, 0.88817],
[0.97454, 0.4335, 0.87883],
[0.97663, 0.44573, 0.86923],
[0.97845, 0.45797, 0.8594],
[0.98004, 0.47017, 0.84939],
[0.98142, 0.48228, 0.83922],
[0.98262, 0.4943, 0.82894],
[0.98364, 0.5062, 0.81854],
[0.98453, 0.51799, 0.80808],
[0.98527, 0.52964, 0.79753],
[0.98588, 0.54116, 0.78694],
[0.98637, 0.55255, 0.77629],
[0.98676, 0.56382, 0.76559],
[0.98704, 0.57494, 0.75486],
[0.98722, 0.58595, 0.74407],
[0.98733, 0.59683, 0.73326],
[0.98736, 0.60758, 0.72241],
[0.98732, 0.61821, 0.71153],
[0.98723, 0.62871, 0.7006],
[0.9871, 0.63909, 0.68965],
[0.98694, 0.64936, 0.67864],
[0.98677, 0.65949, 0.66762],
[0.9866, 0.6695, 0.65654],
[0.98644, 0.67938, 0.64543],
[0.9863, 0.68916, 0.63428],
[0.98621, 0.69879, 0.62309],
[0.98616, 0.70831, 0.61184],
[0.98617, 0.71772, 0.60055],
[0.98624, 0.727, 0.5892],
[0.98636, 0.73618, 0.57779],
[0.98653, 0.74526, 0.56632],
[0.98675, 0.75426, 0.55476],
[0.98702, 0.76315, 0.54311],
[0.98731, 0.77198, 0.53134],
[0.98761, 0.78074, 0.51946],
[0.98792, 0.78944, 0.50744],
[0.9882, 0.79807, 0.49526],
[0.98845, 0.80666, 0.48291],
[0.98864, 0.81518, 0.47039],
[0.98875, 0.82365, 0.45765],
[0.98875, 0.83206, 0.4447],
[0.98863, 0.84039, 0.43151],
[0.98834, 0.84863, 0.41804],
[0.98786, 0.85677, 0.40433],
[0.98715, 0.86476, 0.39033],
[0.98616, 0.87259, 0.37607],
[0.98485, 0.8802, 0.36152],
[0.98316, 0.88754, 0.3467],
[0.98105, 0.89458, 0.33163],
[0.97845, 0.90123, 0.31637],
[0.97534, 0.90744, 0.30092],
[0.97166, 0.91315, 0.28537],
[0.96737, 0.91831, 0.26983],
[0.96244, 0.92285, 0.25432],
[0.95686, 0.92672, 0.23895],
[0.95064, 0.9299, 0.22388],
[0.94377, 0.93236, 0.2092],
[0.93628, 0.9341, 0.19506],
[0.9282, 0.93512, 0.18153],
[0.91959, 0.93544, 0.16884],
[0.91047, 0.9351, 0.15697],
[0.90091, 0.93414, 0.1461],
[0.89097, 0.93263, 0.13623],
[0.8807, 0.93061, 0.12747],
[0.87014, 0.92815, 0.11977],
[0.85937, 0.92531, 0.11315],
[0.8484, 0.92216, 0.10742],
[0.83729, 0.91874, 0.10257],
[0.82605, 0.91511, 0.098502],
[0.81472, 0.91132, 0.095091],
[0.80332, 0.90739, 0.092162],
[0.79187, 0.90336, 0.089659],
[0.78036, 0.89925, 0.087518],
[0.76881, 0.89508, 0.08551],
[0.75723, 0.89086, 0.083837],
[0.74562, 0.88662, 0.082243],
[0.73398, 0.88235, 0.080673],
[0.7223, 0.87807, 0.079194],
[0.7106, 0.87376, 0.077792],
[0.69886, 0.86946, 0.076415],
[0.6871, 0.86514, 0.075063],
[0.67529, 0.86082, 0.073757],
[0.66346, 0.85649, 0.072319],
[0.65156, 0.85215, 0.071005],
[0.63963, 0.8478, 0.069678],
[0.62764, 0.84345, 0.068313],
[0.6156, 0.83909, 0.066946],
[0.60351, 0.83473, 0.065602],
[0.59134, 0.83035, 0.064284],
[0.57911, 0.82597, 0.063016],
[0.56681, 0.82158, 0.061599],
[0.55443, 0.81718, 0.060374],
[0.54195, 0.81278, 0.059088],
[0.5294, 0.80837, 0.057695],
[0.51672, 0.80395, 0.056522],
[0.50395, 0.79952, 0.055189],
[0.49106, 0.79508, 0.053903],
[0.47801, 0.79064, 0.052644],
[0.46484, 0.78619, 0.051424],
[0.45151, 0.78173, 0.050257],
[0.43803, 0.77726, 0.04922],
[0.42437, 0.77277, 0.04812],
[0.41056, 0.76827, 0.047322],
[0.39656, 0.76375, 0.04674],
[0.38239, 0.75922, 0.046427],
[0.36808, 0.75466, 0.046596],
[0.35361, 0.75006, 0.047299],
[0.33906, 0.74543, 0.04874],
[0.32443, 0.74075, 0.050897],
[0.30984, 0.73602, 0.054069],
[0.29532, 0.73122, 0.058336],
[0.28105, 0.72634, 0.063783],
[0.26717, 0.72137, 0.070322],
[0.25387, 0.71631, 0.077992],
[0.24134, 0.71112, 0.08687],
[0.22981, 0.7058, 0.096608],
[0.21961, 0.70035, 0.10741],
[0.21092, 0.69475, 0.11899],
[0.204, 0.68901, 0.13129],
[0.19894, 0.6831, 0.14422],
[0.19593, 0.67703, 0.15768],
[0.19486, 0.67081, 0.17161],
[0.1956, 0.66443, 0.18594],
[0.19795, 0.65791, 0.2005],
[0.20163, 0.65125, 0.21533],
[0.20639, 0.64446, 0.2303],
[0.21183, 0.63756, 0.24538],
[0.21771, 0.63057, 0.26052],
[0.22381, 0.62348, 0.27565],
[0.22992, 0.61632, 0.29071],
[0.23593, 0.6091, 0.30574],
[0.24162, 0.60182, 0.32064],
[0.24693, 0.5945, 0.33543],
[0.25184, 0.58716, 0.35008],
[0.25622, 0.5798, 0.36459],
[0.26011, 0.57242, 0.37897],
[0.26346, 0.56501, 0.3932],
[0.26624, 0.55762, 0.4073],
[0.26846, 0.55021, 0.42127],
[0.27013, 0.5428, 0.43513],
[0.27122, 0.53539, 0.44886],
[0.27173, 0.52798, 0.46247],
[0.2717, 0.52057, 0.476],
[0.27112, 0.51317, 0.48942],
[0.26997, 0.50576, 0.50275],
[0.26823, 0.49837, 0.516],
[0.26598, 0.49096, 0.52919],
[0.26316, 0.48352, 0.54228],
[0.25982, 0.4761, 0.55529],
[0.25594, 0.46864, 0.56822],
[0.25162, 0.46117, 0.58105],
[0.2468, 0.45365, 0.5938],
[0.24161, 0.44609, 0.60643],
[0.23605, 0.43849, 0.61894],
[0.23017, 0.43081, 0.63131],
[0.2241, 0.42303, 0.64353],
[0.21793, 0.41517, 0.6556],
[0.2117, 0.40718, 0.66749],
[0.2055, 0.39906, 0.67919],
[0.19945, 0.39079, 0.6907],
[0.19367, 0.38234, 0.70201],
[0.18818, 0.37372, 0.71312],
[0.183, 0.36488, 0.72404],
[0.17829, 0.35585, 0.73477],
[0.17392, 0.34657, 0.7453],
[0.16999, 0.33707, 0.75566],
[0.16639, 0.32732, 0.76586],
[0.16312, 0.31735, 0.7759],
[0.16005, 0.30712, 0.78581],
[0.15724, 0.29667, 0.79557],
[0.15457, 0.28595, 0.80522],
[0.15202, 0.27505, 0.81474],
[0.14966, 0.26395, 0.82414],
[0.14744, 0.25264, 0.8334],
[0.14554, 0.24118, 0.84252],
[0.14402, 0.2296, 0.85145],
[0.14312, 0.218, 0.86019],
[0.14305, 0.20639, 0.86869],
[0.14404, 0.19481, 0.87691],
[0.1463, 0.18336, 0.88484],
[0.15007, 0.17219, 0.89241],
[0.15537, 0.1614, 0.8996],
[0.1623, 0.15103, 0.90637],
[0.17075, 0.14136, 0.9127],
[0.18062, 0.13244, 0.91856],
[0.19173, 0.12446, 0.92396],
[0.20389, 0.11765, 0.92889],
[0.21681, 0.11214, 0.93335],
[0.23028, 0.10794, 0.93739],
[0.24417, 0.10525, 0.94101],
[0.25828, 0.10403, 0.94425],
[0.27246, 0.10417, 0.94716],
[0.28659, 0.1056, 0.94977],
[0.30059, 0.10807, 0.95212],
[0.3144, 0.11153, 0.95426],
[0.32796, 0.11565, 0.95622],
[0.34126, 0.12031, 0.95803],
[0.35426, 0.12544, 0.95973],
[0.36698, 0.13084, 0.96134],
[0.37942, 0.13637, 0.96288],
[0.3916, 0.1421, 0.96436],
[0.40352, 0.14786, 0.96581],
[0.4152, 0.15363, 0.96722],
[0.42669, 0.15941, 0.9686],
[0.43799, 0.16515, 0.96996],
[0.44913, 0.17088, 0.97129],
[0.46013, 0.1765, 0.97261],
[0.47106, 0.18204, 0.97389],
[0.48191, 0.18751, 0.97514],
[0.49273, 0.1928, 0.97635],
[0.50357, 0.19798, 0.97752],
[0.51446, 0.20302, 0.97863],
[0.52541, 0.2079, 0.97969],
[0.53647, 0.21259, 0.98067],
[0.54767, 0.21709, 0.98157],
[0.55903, 0.22137, 0.98238],
[0.57057, 0.22542, 0.9831],
[0.5823, 0.22925, 0.98372],
[0.59423, 0.23284, 0.98424],
[0.60636, 0.23623, 0.98465],
[0.61868, 0.23935, 0.98497],
[0.63116, 0.24227, 0.98518],
[0.64379, 0.24496, 0.9853],
[0.65656, 0.2475, 0.98533],
[0.66943, 0.24982, 0.98527],
[0.68237, 0.25203, 0.98515],
[0.69537, 0.25408, 0.98496],
[0.70839, 0.25601, 0.98471],
[0.72139, 0.25786, 0.98441],
[0.73437, 0.25968, 0.98405],
[0.74728, 0.26143, 0.98365],
[0.76012, 0.26319, 0.98321],
[0.77286, 0.26494, 0.98271],
[0.78548, 0.26676, 0.98216],
[0.79794, 0.26867, 0.98153],
[0.81023, 0.27069, 0.98082],
[0.82233, 0.27285, 0.98001],
[0.83418, 0.27525, 0.97905],
[0.84576, 0.27791, 0.97793],
[0.85702, 0.28089, 0.97661],
[0.86794, 0.2843, 0.97504],
[0.87845, 0.28819, 0.97317],
[0.88852, 0.29263, 0.97097],
[0.8981, 0.29768, 0.96837],
[0.90717, 0.3034, 0.96533],
[0.91567, 0.30984, 0.96182],
[0.92361, 0.317, 0.9578],
[0.93095, 0.32489, 0.95323],
]

