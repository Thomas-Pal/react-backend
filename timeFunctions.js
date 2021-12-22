
//Fucntion to covert times into format Hasura accepts

export const convert_time = (time) => {
    let hours = time.substring(0,2);
    let minutes = time.substring(3,5);
    return(hours + minutes);
};
    
export const convert_compare = (time) => {

let hours = time.substring(0,2)
let minutes = time.substring(2,4);

var d = new Date()

d.setHours(parseInt(hours));
d.setMinutes(parseInt(minutes));

return d;

};

export const time_compare = (pred, act) => {
    
    var seconds = (act.getTime() - pred.getTime()) / 1000;
    return seconds / 60
    
};
    
export const convert_time_add = (time) => {

    let hours = parseInt(time);
    let minutes = time.substring(3,5);

    var d = new Date()

    d.setHours(parseInt(hours));
    d.setMinutes(parseInt(minutes));

    d.setMinutes(d.getMinutes() + 1);

    var temp = d.getHours();

    if(JSON.stringify(d.getHours()).length == 1){
        temp = "0" + d.getHours() 
    }

    var times =  temp + JSON.stringify(d.getMinutes());

    if(times.length == 3){
            times = times + "0"
    }
    return times;
};
  
  
