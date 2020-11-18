var toke_min = 4.00;
var toke_max = 11.00;

var toke_bonus_chance = 0.66;
var toke_slow_friction = 0.9925;


var toke_diff = toke_max - toke_min;
var toke_number = 4.20;
var toke_speed = 0;
var toke_bonus = 0;
var toke_friction = 1;


var stateEnum = {
    waitSpin: 0, 
    spin: 1,
    waitToke: 2,
    toke: 3
};

var state = stateEnum.waitToke;

function fix2(x){
    return x.toFixed(2);
}

function frame(){

    var center = Math.round(toke_number);
    var font_size = Math.round(Math.sqrt(window.innerWidth * window.innerWidth + window.innerHeight * window.innerHeight) * 0.0889733361);
    

    var toke_box = document.getElementById("toke-box");
    toke_box.setAttribute("x",Math.round(window.innerWidth-font_size*3.673469388));
    toke_box.setAttribute("y",Math.round(window.innerHeight/2-font_size*0.5));
    toke_box.setAttribute("height",Math.round(font_size*1.306122449));

    var beeg_number = document.getElementById("beeg-number");
    beeg_number.setAttribute("x",Math.round(window.innerWidth-font_size*3.469387755));
    beeg_number.setAttribute("y",Math.round(window.innerHeight/2+font_size*0.6530612245));
    beeg_number.setAttribute("font-size",Math.round(font_size*1.306122449));

    var cx = Math.round(window.innerWidth-font_size*3.673469388+window.innerHeight+font_size*0.6530612245);
    var cy = Math.round(window.innerHeight/2);

    var circle = document.getElementById("circle");
    circle.setAttribute("cx",cx);
    circle.setAttribute("cy",cy);
    circle.setAttribute("r",window.innerHeight);

    for(var i = -2; i <= 2; i++){
        var smol = document.getElementById("smol-number-"+(i+2));
        var angle = (center+i-toke_number)*30;
        var transformString = "rotate(" + angle + " " +cx+","+cy+")";
        smol.setAttribute('transform', transformString);
        
        smol.setAttribute('x',Math.round(window.innerWidth - font_size * 2.142857143));
        smol.setAttribute('y',Math.round(window.innerHeight/2 + font_size/2));
        smol.setAttribute("font-size",font_size);

        if(state == stateEnum.spin || state == stateEnum.waitToke){
            if(center + i >= toke_max){
                smol.innerHTML = center+i-toke_diff;
            } else if (center + i < toke_min) {
                smol.innerHTML = center+i+toke_diff;
            } else {
                smol.innerHTML = center+i;
            }
        } else if (state == stateEnum.toke){
            if(center+i<=0){
                if(center+i > -toke_bonus){
                    smol.innerHTML = 1;
                } else {
                    smol.innerHTML = 0;
                }
            } else {
                smol.innerHTML = center+i;
            }
        } else if (center+i < 0){
            smol.innerHTML = 0;
        } else {
            smol.innerHTML = center+i;
        }
        
    }

    var beeg = document.getElementById("beeg-number");

    var beeg_number = fix2(toke_number);

    if(state == stateEnum.toke && toke_number < 1){
        if(toke_number + toke_bonus < 1){
            beeg.innerHTML = fix2(Math.abs(beeg_number % 1));
        } else {
            beeg.innerHTML = fix2(Math.abs(beeg_number % 1) + 1);
        }
    } else {
        beeg.innerHTML = beeg_number;
    }
    

}

function rollBonus(){
    toke_bonus = 0;
    for(var i = 0; i < 69; i++){
        if(Math.random() >= toke_bonus_chance){
            return;
        }
        toke_bonus++;
    }
    return;
}

function spin(){
    if(state == stateEnum.spin){
        toke_number += toke_speed;
        if(toke_number > toke_max){
            toke_number -= toke_diff;
        }
        if(toke_speed < 0.0001 && aim_assist){
            var n = fix2(toke_number);
            for(var i = 0; i < good_numbers.length; i++){
                if(n == good_numbers[i]){
                    toke_speed = 0;
                    state = stateEnum.waitToke;
                    rollBonus();
                    return;
                }
            }
        } else if(toke_speed < 0.0001){
            toke_speed = 0;
            state = stateEnum.waitToke;
            rollBonus();
        } else {
            toke_speed *= toke_friction;
        }
    } else if (state == stateEnum.toke){
        toke_number -= 0.005;
        if(toke_number <= -toke_bonus){
            toke_number = 0;
            toke_int = 0;
            state = stateEnum.waitSpin;
        }
    }
}

var good_numbers = [
    0.69,
    1.23,
    3.14,
    4.20,
    6.66,
    7.77,
    9.11,
    10.00,
    10.69,
    10.99
];

function aimAssist(){
    var stash = toke_number;
    var stash2 = toke_speed;
    var n = toke_number - toke_min;
    n += toke_speed/(1-toke_slow_friction);
    n %= toke_diff;
    n += toke_min;
    var lowest_d = 9999999;
    var target = 0;
    for(var i = 0; i < good_numbers.length; i++){
        var d = Math.abs(good_numbers[i] - n);
        if( d < lowest_d){
            lowest_d = d;
            target = good_numbers[i];
        }
    }
    var f = 1 - (toke_speed / (toke_speed / (1-toke_slow_friction) + target - n));
    toke_friction = f;
    toke_number = stash;
    toke_speed = stash2;
}

var clicks = 0;

var next_aim_assist = false;
var aim_assist = false;

function doThing(){
    switch(state){
        case stateEnum.waitSpin:
        toke_speed = 0.5 + Math.random() / 2;
        toke_number = toke_min + Math.random() * (toke_diff - 1);
        toke_friction = 1;
        state = stateEnum.spin;
        clicks = 0;
        break;
        case stateEnum.spin:
        if(!clicks){
            if(next_aim_assist){
                next_aim_assist = false;
                aim_assist = true;
                aimAssist();
            } else {
                toke_friction = toke_slow_friction;
            }
        }
        clicks++;
        if(clicks == 10){
            next_aim_assist = true;
        }
        break;
        case stateEnum.waitToke:
        state = stateEnum.toke;
        aim_assist = false;
        break;
        case stateEnum.toke:
        toke_number = -toke_bonus;
        break;
        default:
        state = stateEnum.waitSpin;
    }
}


var frame_int = setInterval(frame,5);
var spin_int = setInterval(spin,5);