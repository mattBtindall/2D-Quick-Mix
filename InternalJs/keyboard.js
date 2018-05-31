"use strict"; // use JS strict mode

function checkKeyPress(key)
{
    if (key.keyCode == "32"){
        playPause();
    }
    if (key.keyCode == 69) {
        changeMode();
    }
}

function eventListener()
{
    window.addEventListener("keydown", checkKeyPress, false);
}

function changeMode()
{
    if (Master.mode === 'mix' || Master.mode === 'input') {
        Master.mode = 'eq';
    } else if (Master.mode === 'eq') {
        Master.mode = 'mix'
    }
}