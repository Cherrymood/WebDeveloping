var numberDrums = document.querySelectorAll(".drum").length;

var w = new Audio('./sounds/crash.mp3');
var a = new Audio('./sounds/kick-bass.mp3');
var s = new Audio('./sounds/snare.mp3');
var d = new Audio('./sounds/tom-1.mp3');
var j = new Audio('./sounds/tom-2.mp3');
var k = new Audio('./sounds/tom-3.mp3');
var l = new Audio('./sounds/tom-4.mp3');

var arr = [w, a, s, d, j, k, l];


for( let i = 0; i < numberDrums; i++)
{
    document.querySelectorAll(".drum")[i].addEventListener("click", function() {
       
        var key = this.innerHTML;
        var index;
        makeSound(key);
    });
}
var drumButtons = document.querySelectorAll(".drum");

document.addEventListener("keypress", function(event) {
       
    var btn = event.key.toLowerCase();
    var index;
    
    makeSound(btn);
});

function makeSound(key)
{
    switch(key){
        case 'w': index = 0; break;
        case 'a': index = 1; break;
        case 's': index = 2; break;
        case 'd': index = 3; break;
        case 'j': index = 4; break;
        case 'k': index = 5; break;
        case 'l': index = 6; break;
        default: return;
    }
    
    drumButtons[index].style.color = "white";
    arr[index].play();
}