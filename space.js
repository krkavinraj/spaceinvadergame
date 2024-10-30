//board variable declaration
let tilesize=32;
let rows=16;
let columns=16;

let board;
let boardwidth= tilesize*columns;
let boardheight= tilesize*rows;
let context;
//ship
let shipwidth=tilesize*2;
let shipheight=tilesize;
let shipX=tilesize*columns/2 -tilesize;
let shipY=tilesize*rows -tilesize*2;

let ship={
    x: shipX,
    y: shipY,
    width:shipwidth,
    height:shipheight
}
let shipimg;
let shipvelocityx=tilesize;

//alins for kr's invaders
let alienArray=[];
let alienWidth = tilesize*2;
let alienHeight=tilesize;
let alienX=tilesize;
let alienY=tilesize;
let alienimg;

let alienRows=2;
let alienColumns=3;
let alienCount=0;//no.of aliens in total.
let alienvelocityX=1;//alien speed.

//bullets
let bulletArray=[];
let bulletVelocityY=-10;//bullet spped 

let score=0;
let gameover=false;
let gameoverText = "GAME OVER - Press R to Restart";

let gameOverSound = new Audio("./gameove.mp3"); //soun effect for game over
let shootSound = new Audio("./shoot.mp3"); // Sound effect for shooting

window.onload= function(){
    board =document.getElementById("board");
    board.width=boardwidth;
    board.height=boardheight;
    context=board.getContext("2d");//used for drawing on the board.

    // context.fillStyle="green";
    // context.fillRect(ship.x, ship.y, ship.width, ship.height);
    shipimg= new Image();
    shipimg.src="./ship.png";
    shipimg.onload = function() {
        context.drawImage(shipimg, ship.x, ship.y, ship.width, ship.height);
    }

    alienimg=new Image();
    alienimg.src="./alien.png";
    createaliens();
     
    requestAnimationFrame(update);
    document.addEventListener("keydown", function(e) {
        moveship(e);
        if (e.code == "KeyR" && gameover) {
            resetGame();
        }
    });
    document.addEventListener("keyup", shoot);

}

function update(){
    requestAnimationFrame(update);

    if(gameover){
        context.fillStyle = "white";
        context.font = "32px courier";
        context.fillText(gameoverText, boardwidth/2 - context.measureText(gameoverText).width/2, boardheight/2);
        return;
    }
    context.clearRect(0,0,board.width,board.height);
    //ship
    context.drawImage(shipimg, ship.x, ship.y, ship.width, ship.height);
    //alien 
    for(let i=0;i<alienArray.length;i++){
        let alien=alienArray[i];
        if(alien.alive){
            alien.x+=alienvelocityX;
            //if border are cross 
            if(alien.x+alienWidth>=board.width|| alien.x<=0){
                alienvelocityX*=-1;
                alien.x+=alienvelocityX*2;
                //move all aliens up by 1 row
                for(let j=0;j<alienArray.length;j++){
                    alienArray[j].y+=alienHeight;
                }
            }
            context.drawImage(alienimg,alien.x,alien.y,alien.width,alienHeight);
            if(alien.y>=ship.y){
                gameover=true;
                gameOverSound.play();
            }
        }
    }

    //bullets
    for(let i=0;i<bulletArray.length;i++){
        let bullet =bulletArray[i];
        bullet.y+=bulletVelocityY;
        context.fillStyle="white";
        context.fillRect(bullet.x,bullet.y,bullet.width,bullet.height)

        //bullet attacked aliens 
        for(let j=0;j<alienArray.length;j++){
            let alien = alienArray[j];
            if(!bullet.used && alien.alive && detectCollision(bullet,alien)){
                bullet.used =true;
                alien.alive=false;
                alienCount--;
                score+=100;
            }
        }
    }

    //clear 
    while(bulletArray.length>0 && (bulletArray[0].used || bulletArray[0].y<0)){
        bulletArray.shift();//removes first element
    }
    //score

    //next creaation of aliens
    if(alienCount==0){
        alienColumns=Math.min(alienColumns+1,columns/2-2); //16/2-2=6
        alienRows =Math.min(alienRows +1,rows-4); //16-4=12
        alienvelocityX+=0.2;
        alienArray=[];
        bulletArray=[]; 
        createaliens();
    }
    //score
    context.fillStyle="white";
    context.font="16px courier";
    context.fillText(score,5,20);
    


}
function moveship(e){
    if(gameover){
        return;
    }
    if(e.code=="ArrowLeft" && ship.x -shipvelocityx>=0){
        ship.x-=shipvelocityx;//move the left
    }
    else if(e.code=="ArrowRight" && ship.x + shipvelocityx+shipwidth<=board.width){
        ship.x+=shipvelocityx;//move to right
    }
}

function createaliens(){
    for(let c=0;c<alienColumns;c++){
        for(let r=0;r<alienRows;r++){
            let alien={
                img:alienimg,
                x:alienX+c*alienWidth,
                y:alienY+r*alienHeight,
                width:alienWidth,
                height:alienHeight,
                alive : true
            }
            alienArray.push(alien);
        }
    }
    alienCount=alienArray.length;
}

function shoot(e){
    if(gameover){
        return;
    }
    if(e.code=="Space"){
        try {
            // Play the shooting sound
            shootSound.currentTime = 0; // Reset sound to start
            let playPromise = shootSound.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log("Sound played successfully!");
                }).catch(error => {
                    console.log("Error playing sound:", error);
                });
            }
        } catch(error) {
            console.log("Error with sound:", error);
        }

        let bullet={
            x:ship.x+shipwidth*15/32,
            y:ship.y,
            width : tilesize/8,
            height: tilesize/2,
            used:false
        }
        bulletArray.push(bullet);
    }
}

function detectCollision(a,b){
    return a.x<b.x+b.width&&
     a.x+a.width>b.x&&
      a.y<b.y+b.height && 
      a.y+a.height>b.y;
}

function resetGame() {
    gameOverSound.currentTime = 0; // Reset the sound
    ship.x = shipX;
    ship.y = shipY;
    alienArray = [];
    bulletArray = [];
    alienColumns = 3; // Reset to initial values
    alienRows = 2;
    alienvelocityX = 1;
    score = 0;
    gameover = false;
    createaliens();
}