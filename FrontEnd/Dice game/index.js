
var ranNum = Math.floor(Math.random() * 6) +1;

var randomDiceImg = "images/dice" + ranNum + ".png";

var img1 = document.querySelectorAll("img")[0];

img1.setAttribute("src", randomDiceImg);


var ranNum2 = Math.floor(Math.random() * 6) +1;

var randomDiceImg2 = "images/dice" + ranNum2 + ".png";

var img2 = document.querySelectorAll("img")[1];

img2.setAttribute("src", randomDiceImg2);

if(ranNum > ranNum2)
{
    document.querySelector("h1").innerHTML = "Player 1 Wins!";
}

else if(ranNum < ranNum2)
{
    document.querySelector("h1").innerHTML = "Player 2 Wins!";
}

else{

    document.querySelector("h1").innerHTML = "Draw";
}





