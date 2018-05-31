"use strict"; // use JS strict mode

function scaler( originalVal, originalMaxVal, originalMinVal, range, min)
{
    let scaledVal = ((originalVal - originalMinVal)  / (originalMaxVal - originalMinVal )) * range + min;
    return scaledVal;
}

function freqValue()
{
    let octaveFilterFrequencies = []; 
    let frequencyArray = []; 
    let x = 0;

    octaveFilterFrequencies[0] = 25;
    for (let i = 1; i < 11; i++) {
        octaveFilterFrequencies[i] = octaveFilterFrequencies[i -1] * 2;
    }
    return octaveFilterFrequencies;
}

function playPause()
{
    if (Master.isReady()) {
        playPauseIcon();
        for (let i = 0; i < tracks.length; i++) {
            if (tracks[i].audio.state === 'stopped') {
                tracks[i].audio.start();
            } else if (tracks[i].audio.state === 'started') {
                tracks[i].audio.stop();
            }
        }
    }
}

function hitTest( xPos, yPos, objDis)
{
    let d = dist(mouseX, mouseY, xPos,  yPos);
    return d < objDis; 
}

function splitTest()
{
    for (let i = 0; i < tracks.length; i++) {
        if (tracks[i].collided.length != 0 && !tracks[i].eqMovedFlag) {
            for (let j = 0; j < tracks[i].collided.length; j++) {
                tracks[i].collided[j].splitter( j+1, tracks[i].collided.length+1);
            }
        }
    }
}

function isAnySolod()
{
    let soloTemp;
    tracks.forEach((item) => {
        if (!soloTemp) {
            soloTemp = item.isSolod;
        }
    });
    return soloTemp;
}


function closestValue( array, targetNo)
{
    return array.reduce(function(prev, curr){
        return (Math.abs(curr - targetNo) < Math.abs(prev - targetNo) ? curr : prev);
    });
}