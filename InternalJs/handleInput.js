"use strict"; // use JS strict mode

function mouseDragged()
{
    for (let i = 0; i < tracks.length; i++) {
        if (event.shiftKey) { // Join
            shiftDragged = true;
            if (firstTimeClicked) {
                if (hitTest( tracks[i].x, tracks[i].y, tracks[i].r)) {
                    console.log('hit');
                    tracks[i].shiftDragged = true;
                    firstTimeClicked = false;
                }
            }
        }
    }
    if (Master.mode === 'eq') {
        if (currentTrack != undefined) {
            currentTrack.draggedEq();
        }
    }
}
function mousePressed()
{
    for (let i = 0; i < tracks.length; i++) {
        if (mouseButton === LEFT && !event.shiftKey) {
            if (Master.mode === 'mix') {
                tracks[i].isClickedMix();
            } else if (Master.mode === 'eq') {
                tracks[i].clickedEq( false);
            }
        }
        else if (mouseButton === RIGHT && !event.shiftKey) {
            if (Master.mode === 'mix') {
                tracks[i].isRightClickedMix();
            } else if (Master.mode === 'eq') {
                tracks[i].isRightClickedEq();
            }
        }
    }
}
function doubleClicked()
{
    for (let i = 0; i < tracks.length; i++) {
        if (Master.mode === 'mix') {
            tracks[i].isDblClickedMix();
        } 
        // else if (Master.mode === 'eq') {
        //     tracks[i].isDblClickedEq();
        // }
    }
}
function mouseReleased()
{   
    for (let i = 0; i < tracks.length; i++) {
        tracks[i].clicked = false;
        tracks[i].dblClicked = false;
        tracks[i].shiftClicked = false;
        tracks[i].rightClickFlag = true;
        tracks[i].eqFlag = false;
        tracks[i].dragFlag = false;
        tracks[i].rightClicked = false;
        tracks[i].collidedWith = [];
        tracks[i].dynamicMode = false;
        // if (tracks[i].shiftDragged === true) {
        //     let partnerTemp = tracks[i].partner;
        //     partnerTemp.partner = tracks[i];
        // }
        tracks[i].shiftDragged = false;
    }
    if (mPressed) {
        eqFirstTime = true;
        mPressed = false;
    }
    //setTimeout(() => {if (dblClickEq) dblClickEq=false}, 100)
    eqCounter = 0;
    //firstTime = true;
    //eqClicked = false;
    shiftHit = false;
    //firstEqClick = true;
    shiftDragged = false;
    firstDrag = true;
    firstTimeClicked = true;
    console.log('mPressed:',mPressed);
}

function isShiftClicked( i)
{
    if (shiftDragged === false) {
        tracks[i].isShiftClickedMix();
    }
}

// function keyPressed()
// {
//     for (let i = 0; i < tracks.length; i++) {
//         if (tracks[i].selected === true) {
//             firstKeyPress = true;
//         }
//     }
//     if (firstKeyPress) {
//         let selectedTrack = getTrack();
//         selectedTrack.setDirection();
//         let currentPosY = Master.centerPointsY.indexOf( Master.y) // Gets index of current pos for y axis
//         let currentPosX = Master.centerPointsX.indexOf( selectedTrack.x) // Gets index of current pos for x axis
//         if (keyCode === UP_ARROW) {
//             if (Master.centerPointsY[currentPosY-1] != undefined) { // Checks to see if the next pos in still on the canvas
//                 selectedTrack.y = Master.centerPointsY[(currentPosY-1)];
//             } 
//         }
//         else if (keyCode === DOWN_ARROW) {
//             if (Master.centerPointsY[currentPosY+1] != undefined) {
//                 selectedTrack.y = Master.centerPointsY[(currentPosY+1)];
//             }
//         }
//         else if (keyCode === LEFT_ARROW) {
//             if (Master.centerPointsX[currentPosX-1] != undefined) {
//                 selectedTrack.x = Master.centerPointsX[currentPosX-1];
//             }
//         }
//         else if (keyCode === RIGHT_ARROW) {
//             if (Master.centerPointsX[currentPosX+1] != undefined) {
//                 selectedTrack.x = Master.centerPointsX[currentPosX+1];
//             }
//         }
//         selectedTrack.collide();
//         selectedTrack.setVolume();
//         selectedTrack.setPan();
//     }
// }