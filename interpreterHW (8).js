//returns an inner scope which points to outer scope
function getNewState(oldState){
  let state = {};
  lib220.setProperty(state,"scope pointer", oldState);
  return state;
}
//returns a variable's value based on scope
function getVariable(state, name){
  let prop = lib220.getProperty(state,name);
  if(prop.found){
    return prop.value;
  }
  let outer = lib220.getProperty(state,"scope pointer");
  if(!outer.found){
    console.log("error: variable "+name +" doesn't exist");
    assert(false);
  }
  return getVariable(outer.value,name);
}
//sets a variable's value
function setVariable(state, name, value){
  let prop = lib220.getProperty(state,name);
  if(prop.found){
    return lib220.setProperty(state,name,value);
  }
  let outer = lib220.getProperty(state,"scope pointer");
  if(!outer.found){
    console.log("error: variable "+name +" doesn't exist");
    assert(false);
  }
  setVariable(outer.value,name,value);
}
//returns number or boolean after evaluating expression
function interpExpression(state, e){
  switch(e.kind){
    case "boolean":
    {
      return e.value;
    }
    case "number":
    {
      return e.value;
    }
    case "variable":
    {
      return getVariable(state,e.name);      
      //search between states for variable
      //either a num or bool
      //check if state has a variable
      //if not, use the pointer contained in the state to access the parent state all the way until program state
    }
    case "operator":
    {
      switch(e.op){
        case "+":
        {
          let v1 = interpExpression(state, e.e1);
          let v2 = interpExpression(state, e.e2);
          if(typeof(v1)!==typeof(v2)){
            console.log("type mismatch");
            assert(false);
          }
          return v1 + v2;
        }
        case"-":
        {
          let v1 = interpExpression(state, e.e1);
          let v2 = interpExpression(state, e.e2);
          if(typeof(v1)!==typeof(v2)){
            console.log("type mismatch");
            assert(false);
          }
          return v1 - v2;
        }
        case "*":
        {
          let v1 = interpExpression(state, e.e1);
          let v2 = interpExpression(state, e.e2);
          if(typeof(v1)!==typeof(v2)){
            console.log("type mismatch");
            assert(false);
          }
          return v1 * v2;
        }
        case "/":
        {
         let v1 = interpExpression(state, e.e1);
          let v2 = interpExpression(state, e.e2);
          if(typeof(v1)!==typeof(v2)){
            console.log("type mismatch");
            assert(false);
          }
          return v1 / v2;
        }
        case "&&":
        {
          let v1 = interpExpression(state, e.e1);
          if(v1===false){
            return false;
          }
          let v2 = interpExpression(state, e.e2);
          if(typeof(v1)!==typeof(v2)){
            console.log("type mismatch");
            assert(false);
          }
          return v1 && v2;
        }
        case "||":
        {
          let v1 = interpExpression(state, e.e1);
          if(v1===true){
            return true;
          }
          let v2 = interpExpression(state, e.e2);
          if(typeof(v1)!==typeof(v2)){
            console.log("type mismatch");
            assert(false);
          }
          return v1 || v2;
        }
        case "<":
        {
          let v1 = interpExpression(state, e.e1);
          let v2 = interpExpression(state, e.e2);
          if(typeof(v1)!==typeof(v2)){
            console.log("type mismatch");
            assert(false);
          }
          return v1 < v2;
        }
        case ">":
        {
          let v1 = interpExpression(state, e.e1);
          let v2 = interpExpression(state, e.e2);
          if(typeof(v1)!==typeof(v2)){
            console.log("type mismatch");
            assert(false);
          }
          return v1 > v2;
        }
        case "===":
        {
          let v1 = interpExpression(state, e.e1);
          let v2 = interpExpression(state, e.e2);        
          return v1 === v2;
        }
      }
    }
  }
}

//updates state obj returns nothing
function interpStatement(state, p){
  switch(p.kind){
    case "let":
    {
      if(lib220.getProperty(state,p.name).found){
        console.log("error: variable is declared in same scope");
        assert(false);
      }
      //console.log("got here");
      lib220.setProperty(state,p.name,interpExpression(state,p.expression));
      break;
    }
    case "assignment":
    {
      setVariable(state,p.name,interpExpression(state,p.expression));
      break;
    }
    case "if":
    {
      let newState = getNewState(state);     
      if(interpExpression(state,p.test)){
        p.truePart.forEach((stmt)=>(interpStatement(newState,stmt)));
      }else{
        p.falsePart.forEach((stmt)=>(interpStatement(newState,stmt)));
      }
      break;
    }
    case "while":
    {
      while(interpExpression(state,p.test)){
        let newState = getNewState(state);
        p.body.forEach((stmt)=>(interpStatement(newState,stmt)));
      }
      break;
    }
    case "print":
    {
      console.log(interpExpression(state,p.expression));
    }
  }
}

//returns final state of program
function interpProgram(p){
  let globalScope = {};
  p.forEach((stmt)=>interpStatement(globalScope,stmt));
  return globalScope;
}

//tests
test("interExpression simple +", function(){
  let p = parser.parseExpression("1+6").value;  
  let sum = interpExpression({},p);
  assert(sum===7);
});
test("interExpression multiple +", function(){
  let p = parser.parseExpression("1+6+7").value;  
  let sum = interpExpression({},p);
  assert(sum===14);
});
test("interExpression multiple -", function(){
  let p = parser.parseExpression("1-6-7").value;  
  let sum = interpExpression({},p);
  assert(sum===-12);
});
test("interExpression pemdas", function(){
  let p = parser.parseExpression("1+3*2").value;  
  let sum = interpExpression({},p);
  assert(sum === 7);  
});
test("interExpression complex ===, &&", function(){
  let p = parser.parseExpression("1+3===6*1-2 && 9*1-3===6").value;  
  let sum = interpExpression({},p);
  assert(sum);  
});
test("interExpression complex >", function(){
  let p = parser.parseExpression("1+3>4*3-11").value;  
  let sum = interpExpression({},p);
  assert(sum);  
});
test("interExpression varible simple", function(){
  let p = parser.parseExpression("x*3").value;  
  let result = interpExpression({x:6},p);
  assert(result===18);
});
test("interExpression varible outer scope", function(){
  let p = parser.parseExpression("x*3").value;  
  let scope = {};
  let outerScope = {x:6};
  lib220.setProperty(scope,"scope pointer",outerScope);  
  let result = interpExpression(scope,p);
  assert(result===18);
});
test("interExpression varible proper scoping", function(){
  let p = parser.parseExpression("x*3").value;  
  let scope = {};
  let outerScope = {x:6};
  lib220.setProperty(scope,"scope pointer",outerScope);
  lib220.setProperty(scope,"x",9);
  let result = interpExpression(scope,p);
  assert(result===27);
});
test("setVariable simple", function(){
  let p = parser.parseExpression("x*3").value;  
  let scope = {};
  let outerScope = {x:6};
  lib220.setProperty(scope,"scope pointer",outerScope);
  setVariable(outerScope,"x",5);
  let result = interpExpression(scope,p);
  assert(result===15);
});
test("setVariable scoping", function(){
  let p = parser.parseExpression("x*3").value;  
  let scope = {};
  let outerScope = {x:6};
  lib220.setProperty(scope,"scope pointer",outerScope);
  setVariable(scope,"x",4);
  let result = interpExpression(scope,p);
  assert(result===12);
});
test("interpStatement let",function(){
  let p = parser.parseProgram("let x = 3;").value;
  //console.log(p);
  let scope = {};
  interpStatement(scope,p[0]);
  let result = interpExpression(scope,parser.parseExpression("x*3").value); 
  assert(result===9);
});
test("interpStatement assignment",function(){
  let p = parser.parseProgram("let x = 3; x = 7;").value;
  console.log(p); 
  let scope = {x:9}; 
  interpStatement(scope,p[1]);  
 // let result = interpExpression(scope,parser.parseExpression("x*3").value); 
 // assert(result===21);
});
test("interpStatement assignment scoping",function(){
  let p = parser.parseProgram("let x = 3; x = 7;").value;   
  let scope = {};
  let outerScope = {x:7}; 
  lib220.setProperty(scope,"scope pointer",outerScope);
  interpStatement(scope,p[1]); 
  let result = interpExpression(scope,parser.parseExpression("x*3").value); 
  assert(result===21);
});

test("interpStatement if true simple", function(){
  let p = parser.parseProgram("let x = 6; if(true){x = 3;}else{}").value;   
  
  let scope = {x:6};
  interpStatement(scope,p[1]);
  let result = interpExpression(scope,parser.parseExpression("x*5").value);
  assert(result===15);
});
test("interpStatement if false simple", function(){
  let p = parser.parseProgram("let x = 6; if(false){}else{x=3;}").value;   
  
  let scope = {x:6};
  interpStatement(scope,p[1]);
  let result = interpExpression(scope,parser.parseExpression("x*5").value);
  assert(result===15);
});
test("interpStatement if complex", function(){
  let p = parser.parseProgram("let x = 6; if(true){if(false){}else{x=100;}}else{x=3;}").value;
  let scope = {x:6};
  interpStatement(scope,p[1]);
  let result = interpExpression(scope,parser.parseExpression("x*5").value);
  assert(result===500); 
});
test("interpStatement print", function(){
    let p = parser.parseProgram("let x = 14;print(x);").value;
    
});
test("program simple assign",function(){
  let p = parser.parseProgram("let x = 14;").value;
  let result = interpProgram(p);
  console.log(result);
});
test("program simple boolean",function(){
  let p = parser.parseProgram("let x = true; if(x){let y = true; x = false;}else{}").value;
 
  p[1].falsePart.push({
        kind: "let",
        name: "y",
        expression: {
          kind: "boolean",
          value: false
        }
      });
  let result = interpProgram(p);
  assert(lib220.getProperty(result,"x").value===false);
  assert(lib220.getProperty(result,"y").found===false);
});
test("program complex arithmetic",function(){
  let p = parser.parseProgram("let x = 1; let z = 7; while(x<4){let y = 6; z=z+z;x=x+1;}print(z); ").value;
  console.log(p);
  let result = interpProgram(p);
  assert(lib220.getProperty(result,"x").value===4);
  assert(result.z===56);
});
test("interpProgram complex boolean", function(){
  let p = parser.parseProgram("let x=1;let done = false;while(done===false){let y = 3;if(x>8){done=true;}else{x=x+y;}} if(done){done=false;}else{let z = 17;}if(false){x=7;}else{x=10;}").value;
  console.log(p);
  console.log(p[3]);
  //the e2 shouldn't be reached
  p[3].test={
    kind: "operator",
    op: "||",
    e1: {
      kind: "variable",
      name: "done"
    },
    e2:{
      kind:"varible",
      name:"not found"
    }
  };
  let result = interpProgram(p);

});
//given tests
test("multiplication with a variable", function() {
  let r = interpExpression({ x: 10 }, parser.parseExpression("x * 2").value);
  assert(r===20);
});
test("assignment", function() {
let st = interpProgram(parser.parseProgram("let x = 10; x = 20;").value);
assert(st.x === 20);
});
test("factorial", function(){
  let st = interpProgram(parser.parseProgram("let answer = 1; let n = 4; let curr = 1; while(n>1){curr=curr+1; answer = answer*curr;n=n-1;let y = 0;}").value);
  assert(lib220.getProperty(st,"y").found===false);
  assert(st.answer===24);
  assert(st.n===1);
  assert(st.curr===4);
});


