var buttonColors = ["red", "yellow", "green", "blue"];
var gamePattern = [];
var userPattern = [];
var level = 0;
var start = false;

$(document).keypress(function () { 
    if(!start)
    {
        $("#level-title").text("Level " + level);
        nextSequence();
        start = true;
    } 
});


$(".btn").click(function() {
    
    var userChosenColor = $(this).attr("id");
    userPattern.push(userChosenColor);

    playSound(userChosenColor);
    animatePress(userChosenColor);

    checkAnswer(userPattern.length);
})

function checkAnswer(currLevel)
{
    if(gamePattern[currLevel -1] === userPattern[currLevel -1])
        {
            if(gamePattern.length === userPattern.length)
            {
                setTimeout(function()
                { 
                    nextSequence();
                }, 1000);
            }
        }

    else{

        playSound("wrong");

        $("body").addClass("game-over");

        setTimeout(function()
        {
            $("body").removeClass("game-over");
        }, 200);  

        $("#level-title").text("Game Over, Press Any Key to Restart ");

        checked = true;
        
        startOver();
    }
}


function nextSequence() {

    userPattern = [];
    level++;
    $("#level-title").text("Level " + level);

    var rand = Math.floor(Math.random() * 4);
    var randChooseColor = buttonColors[rand];

    gamePattern.push(randChooseColor);
    $("#" + randChooseColor).fadeIn(100).fadeOut(100).fadeIn(100);
    playSound(randChooseColor);

    $(document).keypress(function () { 
        level++;
        $("#level-title").text("Level " + level);
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

function startOver(){

    if(checked === true)
    {
        level = 0;
        gamePattern = [];
        start = false;


        setTimeout(function()
        {
            $("#level-title").text("Press A Key to Start");

        }, 800);  
    }
}


