var buttonColors = ["red", "yellow", "green", "blue"];
var gamePattern = [];
var userPattern = [];
var level = 0;

$("document").keypress(function (event) { 
    $("h1").text("Level" + level);
});


$(".btn").on("click", function() {
    
    var userChosenColor = $(this).attr("id");
    userPattern.push(userChosenColor);

    playSound(userChosenColor);
    animatePress(userChosenColor);
})


function nextSequence() {
    var rand = Math.floor(Math.random() * 4);
    var randChooseColor = buttonColors[rand];

    gamePattern.push(randChooseColor);
    $("#" + randChooseColor).fadeIn(100).fadeOut(100).fadeIn(100);
    playSound(randChooseColor);

    level++;

    $("document").keypress(function (event) { 
        $("h1").text("Level" + level);
    });
}

function playSound(name)
{
    var playAudio = new Audio("sounds/"+name+".mp3");
    playAudio.play();
}

function animatePress(currentColor){

    $("#"+currentColor).addClass("pressed");

    setTimeout(function(){
        $("#"+currentColor).removeClass("pressed")
    }, 100);
}



