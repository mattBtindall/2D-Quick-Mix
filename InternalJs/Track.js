"use strict"; // use JS strict mode

function Track( x, y, r, label, colour, url)
{
    this.label = label;
    this.colourName  = colour;
    this.colour = nodeColour( this.colourName, '0.05');
    this.NO_FILTERS = 11;
    this.partner = null;
    this.eqMode;

    // UI pos
    this.x;
    this.eqX;
    this.y;
    this.r = r;
    this.prevX = this.x;
    this.prevY = this.y;
    this.eqMousePrevY;
    this.direction; 
    this.eqRect = [];
    this.rectW;
    this.collided = [];
    this.collidedWith = [];
    this.eqMovedFlag = false;
    this.dragDirection;
    this.dynamicMode = false;

    // p5 Event listeners
    this.clicked = false;
    this.dblClicked = false;
    this.shiftClicked = false;
    this.shiftDragged = false;
    this.rightClickFlag = true;
    this.rightClicked = false;

    // Tone audio 
    this.soloNode = new Tone.Gain(1); 
    this.audio;
    this.panNode = new Tone.PanVol();
    this.isSolod = false;
    this.selected = false;
    this.filterNodes = [];
    this.filterToggle = [];
    this.readyToPlay = false;
    this.state;

    this.op = [];
    this.eqFlag;
    for (let i = 0; i < 11; i++) {
        this.op[i] = '0.75';
    }

    this.defaultNodePos( x, y);
    this.setFilterBank();
    this.setFilterGainNodes();
    this.setAudio( url);
}

// Track.prototype.canvasSnap = function()
// {
//     if (this.x > Master.w || this.x < 0) {
//         console.log('set x value here');
//         //this.x = this.gridSnapX;
//     } 
//     if (this.y > Master.h || this.y < 0) {
//         console.log('set y value here');
//         //this.y = this.gridSnapY;
//     }
// }

Track.prototype.defaultNodePos = function( x, y)
{
    this.x = Master.centerPointsX[x];
    this.y = Master.centerPointsY[y];
}

Track.prototype.moveMix = function()
{
    if (this.clicked) {
        this.hasHit();
        if (this.partner != null) {
            if (this.x != this.prevX) {
                this.partner.x = Master.centerPointsX[(-(Master.centerPointsX.indexOf(this.x) - Math.abs(Master.centerPointsX.length -1)))];
            } else if (this.y != this.prevY) {
                this.partner.y = this.y;
                this.partner.showMix();
            }
        }
        this.setVolume();
        this.setPan();
        this.prevY = this.y;
        this.prevX = this.x;
    }
    else if (this.shiftDragged) {
        this.joinTrack();
    }
    this.updateAudio();
}
Track.prototype.showMix = function()
{
    if (this.partner != null) {
        this.drawJoinedLabel();
        this.partner.drawJoinedLabel();
    }
    this.nodeStyle();

    if (loaded) {
        if (this.soloNode.gain.value == 0 || this.audio.mute == true) {
            fill(nodeColour( this.colourName, '0.1'));
        } else if (this.soloNode.gain.value == 1 || this.audio.mute == false) {
            fill(nodeColour( this.colourName, '0.75'));
        }
    } else {
        fill(this.colour);
    }
    strokeWeight(2);
    ellipse( this.x, this.y, this.r*2); 
    this.drawSphereLabel( this.x);

    // if (this.collidedWith.length != 0) {
    //     drawCross(this.collidedWith[0], this.collidedWith[1]);
    // }
}

Track.prototype.drawCross = function()
{
    if (this.collidedWith.length != 0) {
        drawCross(this.collidedWith[0], this.collidedWith[1]);
    }
}
Track.prototype.drawSphereLabel = function( xPos)
{
    textSize(Master.sclW/1.5);
    this.textSoloColor();
    textAlign(CENTER);    
    text(this.label, xPos, this.y+(Master.sclH/2));
}
Track.prototype.drawRectLabel = function( xPos)
{
    textSize(Master.sclW/1.5);
    this.textSoloColor();
    if (this.collided.length === 0) {
       textAlign(CENTER);
       xPos = this.x;
    } else if (this.collided.length >= 1){ 
        textAlign(LEFT);
        textSize(24);
    }
    text(this.label, xPos, this.y+(Master.sclH/2));
}

Track.prototype.drawJoinedLabel = function()
{
    stroke(0);
    textSize(Master.sclW/2);
    fill(this.colour);
    text( 'S', this.x-(Master.sclW/1.5), this.y-(Master.sclH/1.5));
}

Track.prototype.hasHit = function()
{
    let closestX = closestValue( Master.centerPointsX, mouseX);
    let closestY = closestValue( Master.centerPointsY, mouseY);
    for (let i = 0; i < tracks.length; i++) {
        if (this != tracks[i] && closestX === tracks[i].x && closestY === tracks[i].y) {
            this.x = this.prevX;
            this.y = this.prevY;
            this.collidedWith[0] = Master.centerPointsX.indexOf(tracks[i].x);
            this.collidedWith[1] = Master.centerPointsY.indexOf(tracks[i].y);
            //drawCross(Master.centerPointsX.indexOf(tracks[i].x), Master.centerPointsY.indexOf(tracks[i].y));
            break; // Break from loop if node collides
        }
        else if (this != tracks[i] && closestX != tracks[i].x && closestY != tracks[i].y) {
            this.x = closestX;
            this.y = closestY;
            this.collidedWith = [];
        }
    }
}

Track.prototype.updateAudio = function()
{
    if (this.dblClicked) {
        console.log('solo')
        this.solo();
    }
    if (this.rightClicked) {
         if (this.rightClickFlag) {
            if (this.audio.mute) {
                this.audio.mute = false
                if (this.partner != null) {
                    this.partner.audio.mute = false;
                }
            }
            else if (!this.audio.mute) {
                this.audio.mute = true;
                if (this.partner != null) {
                    this.partner.audio.mute = true;
                }
            }
            this.rightClickFlag = false;
        }
    }
}

Track.prototype.isClickedMix = function()
{
    if (hitTest( this.x, this.y, this.r)) {
        this.clicked = true;
        for (let i = 0; i < tracks.length; i++) {
            tracks[i].selected = false;
        }
        this.selected = true;
        if (this.partner != null) {
            this.partner.selected = true;
        }
    } 
}
Track.prototype.isShiftClickedMix = function()
{
    if (hitTest( this.x, this.y, this.r)) {
        this.shiftClicked = true;
    } 
}
Track.prototype.isDblClickedMix = function()
{
    if (hitTest( this.x, this.y, this.r)) {
        this.dblClicked = true;
    } 
}
Track.prototype.isRightClickedMix = function()
{
    if (hitTest( this.x, this.y, this.r)) {
        this.rightClicked = true;
    } 
}
// Track.prototype.isDblClickedEq = function()
// {
//     if (hitTest( this.eqX + (this.rectW/2), (this.y+(Master.sclH/2)), (this.rectW/4))) {
//         console.log('DblClickEq', this.label);
//         this.dblClicked = true;
//         this.updateAudio();
//     }
// }
Track.prototype.isRightClickedEq = function()
{
    if (hitTest( this.eqX + (this.rectW/2), this.y, (this.rectW/2))) {
        console.log('DblClickEq', this.label);
        this.rightClicked = true;
        this.updateAudio();
    }
}

Track.prototype.joinTrack = function()
{
    if (this.shiftDragged) {
        drawLine( this.x, this.y, this.colour);
        for (let i = 0; i < tracks.length; i++) {
            if (this != tracks[i] && hitTest( tracks[i].x, tracks[i].y, tracks[i].r) && !shiftHit) {
                console.log('hit');
                hitTrack = tracks[i];
                shiftHit = true;
                if (this.partner === null && this.partner != hitTrack) { // Didn't already have a partner
                    this.partner = hitTrack;
                    hitTrack.partner = this;
                } 
                else if (this.partner === hitTrack) { // Already had a partner and unJoing
                    this.partner.partner = null;
                    this.partner = null;
                } 
                else if (this.partner != null && this.partner != hitTrack) { // Already had a partner and changing
                    this.partner.partner = null;
                    this.partner = hitTrack;
                    hitTrack.partner = this;
                }
            }
        }
        if (shiftHit && !hitTest( hitTrack.x, hitTrack.y, hitTrack.r)) {
            shiftHit = false;
            console.log('not hit');
        }
    }
}
// Track.prototype.collide = function()
// {
//     if (this.clicked) {
//         for (let i = 0; i < tracks.length; i++) {
//             if (this != tracks[i] && hitTest( tracks[i].x, tracks[i].y, tracks[i].r) && !clickedFirst) {
//                 console.log('hit');
//                 hitTrack = tracks[i];
//                 clickedFirst = true;
//                 // if (this.partner === null && this.partner != hitTrack) { // Didn't already have a partner
//                 //     this.partner = hitTrack;
//                 //     hitTrack.partner = this;
//                 // } 
//                 // else if (this.partner === hitTrack) { // Already had a partner and unJoing
//                 //     this.partner.partner = null;
//                 //     this.partner = null;
//                 // } 
//                 // else if (this.partner != null && this.partner != hitTrack) { // Already had a partner and changing
//                 //     this.partner.partner = null;
//                 //     this.partner = hitTrack;
//                 //     hitTrack.partner = this;
//                 // }
//             } 
//             // else if (clickedFirst && !hitTest( tracks[i].x, tracks[i].y, tracks[i].r)) {
//             //     clickedFirst = false;     
//             //     console.log('not hit');
//             // }
//         }
//         if (clickedFirst && !hitTest( hitTrack.x, hitTrack.y, hitTrack.r)) {
//             clickedFirst = false;
//             console.log('not hit');
//         }
//     }
// }

function drawLine( x, y, colour)
{
    //style
    stroke(colour);
    strokeWeight(4);
    line( x, y, mouseX, mouseY);
}

Track.prototype.setAudio = function( url)
{
    this.audio = new Tone.Player( url, () => {
        this.audio.loop = true;
        this.chain();
        this.readyToPlay = true;
        this.audio.volume.value = -55;
    });
}

Track.prototype.setVolume = function( ) 
{
    let scaledVolVal = scaler(this.y, Master.centerPointsY[10], Master.centerPointsY[0], -1, 1);
    let logVal = 20*Math.log10(scaledVolVal);
    if (this.y != this.prevY && this.y != Master.centerPointsY[10]) {
        if (this.audio.mute) {
            this.audio.volume.value = logVal;
            this.audio.mute = true;
        }
        else {
            this.audio.volume.value = logVal;  
        }
    } 
    else if (this.y === Master.centerPointsY[10]) {
        this.audio.volume.value = -60;
    }
}

Track.prototype.setPan = function()
{
    if (this.x != this.prevX) {
        if (this.x >= Master.centerPointsX[0] && this.x <= Master.centerPointsX[6]) {
            this.panNode.pan.value = scaler(this.x, Master.centerPointsX[6], Master.centerPointsX[0], 1, -1);
        }
        else if (this.x >= Master.centerPointsX[8] && this.x <= Master.centerPointsX[14]) {
            this.panNode.pan.value = scaler(this.x, Master.centerPointsX[14], Master.centerPointsX[8], 1, 0);
        }
    }   
}

Track.prototype.solo = function()
{
    let i;
    if (!this.isSolod) { // Toggle ON
        this.isSolod = true;
        this.soloNode.gain.value = 1;
        if (this.partner != null) {
            this.partner.isSolod = true;
            this.partner.soloNode.gain.value = 1;
        }
        console.log('solod');
        trackSolod = true;
        for (i = 0; i < tracks.length; i++) {
            if (!tracks[i].isSolod) {
                tracks[i].soloNode.gain.value = 0; // Mute track if it isnt solod
            }
        }
    } 
    else { // Toggle OFF
        this.isSolod = false;
        if (this.partner != null) {
            this.partner.isSolod = false;
        }
        if (!isAnySolod()) { // if none of the tracks are solod then unmute them all
            trackSolod = false;
            for (i = 0; i < tracks.length; i++) {
                tracks[i].soloNode.gain.value = 1;
            }
        } 
        else { // if others tracks are solod then mute this track
            this.soloNode.gain.value = 0; 
            if (this.partner != null) {
                this.partner.soloNode.gain.value = 0;
            }
            trackSolod = true;
        }
    }
    this.dblClicked = false;
}

Track.prototype.updateUi = function( xIndex, yIndex)
{
    this.r = Master.sclW*.75;
}

Track.prototype.chain = function()
{
    this.audio.chain( this.panNode, this.soloNode);
    for (let i = 0; i < this.NO_FILTERS; i++) {
        this.soloNode.chain( this.filterNodes[i], this.filterToggle[i], Tone.Master);
    }
}

Track.prototype.nodeStyle = function()
{
    if (this.selected && this.clicked) {
        stroke('none');
    }
    else if (!this.selected) {
        stroke(0);
    }
}

// Track.prototype.setDirection = function()
// {
//     if (this.x > this.prevX) {
//         this.direction = 'right';
//     } else if (this.x < this.prevX) {
//         this.direction = 'left';
//     }
//     if (this.y > this.prevY) {
//         this.direction = 'downwards';
//     } else if (this.y < this.prevY) {
//         this.direction = 'upwards';
//     }
// }
// Track.prototype.collide = function()
// {
//     for (let i = 0; i < tracks.length; i++) {
//         if (this != tracks[i] && this.x == tracks[i].x && this.y == tracks[i].y) {
//             console.log('collide');
//             collide = true;
//             switch (this.direction)
//             {
//                 case 'right':
//                     this.x = Master.centerPointsX[Master.centerPointsX.indexOf(this.x)-1];
//                     break;
//                 case 'left':
//                     this.x = Master.centerPointsX[Master.centerPointsX.indexOf(this.x)+1];
//                     break;
//                 case 'downwards' :
//                     this.y = Master.centerPointsY[Master.centerPointsY.indexOf(this.y)-1]; 
//                     break;
//                 case 'upwards' :
//                     this.y = Master.centerPointsY[Master.centerPointsY.indexOf(this.y)+1]; 
//                     break;
//             }
//         }
//     }
// }

function getTrack()
{
    let selectedTrack;
    for (let i = 0; i < tracks.length; i++) {
        if (tracks[i].selected) {
            selectedTrack = tracks[i];
        }
    }
    return selectedTrack;
}

Track.prototype.setFilterBank = function() 
{
    let x = 11;
    let centerFrequencies = freqValue();
    for (let i = 0; i < this.NO_FILTERS; i++) {
        x--;
        this.filterNodes[x] =  new Tone.Filter(centerFrequencies[i], "bandpass");
        this.filterNodes[x].Q.value = 1.33;
    }
}   
Track.prototype.setFilterGainNodes = function( )
{
    for (let i = 0; i < this.NO_FILTERS; i++) {
        this.filterToggle[i] = new Tone.Gain(1);
    }
}

Track.prototype.drawEq = function()
{
    for (let i = 0; i < Master.gridNoH; i++) {
        if (trackSolod && !this.isSolod || this.audio.mute) {
            fill(nodeColour('grey', this.op[i]));
        } else {
            fill(nodeColour(this.colourName, this.op[i]));
        }
        this.eqRect[i] = rect( this.eqX, Master.rectPointsY[i], this.rectW, Master.gridH);
    }
}

Track.prototype.isHitEqRect = function( dev)
{
    if (hitTest( this.eqX + (this.rectW/dev), this.y, (this.rectW/dev))) {
        this.moveEqTest();
    } else {
        for (let i = 0; i < Master.rectPointsY.length; i++) {
            if (hitTest( this.eqX + (this.rectW/dev), Master.centerPointsY[i], (this.rectW/dev))) {
                // currentTrack = this;
                // this.eqFlag = true;
                // getState( i);
                this.hitEqRect( i);
            }
        }
    }
}

Track.prototype.hitEqRect = function( i)
{
    currentTrack = this;
    this.eqFlag = true;
    getState( i);
}

Track.prototype.clickedEq = function()
{
    let mouseTemp = closestValue( Master.centerPointsY, mouseY);
    let segId = Master.centerPointsY.indexOf(mouseTemp);
    //if (segId === Master.centerPointsY.indexOf(this.y)) {
    //     console.log('name hit');
    //     this.hitEqRect( 4);
    // } else {
    this.isHitEqRect( 2);
    //}
    if (this.eqFlag) {
        this.toggleEq( segId);  
    }
}
Track.prototype.toggleEq = function( segId)
{
    this.onOffEq( segId);
    if (this.partner != null) {
        this.partner.onOffEq( segId);
    }
}

Track.prototype.moveEqTest = function()
{
    stillClicked = true;
    let intervalTest = setInterval(() => {
        if (!mPressed) {
            this.clicked = true;
            stillClicked = false;
            clearInterval(intervalTest);
            console.log('toggle that box');
            this.hitEqRect( Master.centerPointsY.indexOf(this.y));
        }
    }, 50);

    setTimeout(() => {
        if (stillClicked) {
            this.dynamicMode = true;
        }
        clearInterval( intervalTest);
    }, 1000);
}

Track.prototype.dynamicModeFunc = function()
{
    if (this.dynamicMode) {
        console.log('move',this.label);
        this.moveMix();
        this.clicked = true;
    }
}

Track.prototype.draggedEq = function()
{
    this.dragFlag = true;
    let mouseYTemp = closestValue( Master.centerPointsY, mouseY);
    let segId = Master.centerPointsY.indexOf(mouseYTemp);

    if (mouseYTemp != closestValue( Master.centerPointsY, prevMousePosY) && this.eqFlag) { // Only change if mouseY leaves current box
        this.toggleEq( segId);
        eqCounter++;
    }
    else if (mouseY < prevMousePosY) { // Set direction of mouse
        dragDirection = 'smaller';     
    } else {
        dragDirection = 'higher';     
    }

    if (dragDirection != prevMouseDirection && this.eqFlag && eqCounter >= 2){
        getState( segId);
        this.toggleEq( segId);
    }

    prevMouseDirection = dragDirection;
    prevMousePosY = mouseY;
}

function getState( segId)
{
    if (currentTrack.op[segId] === '0.1') {
        eqMode = 'on';
    } else if (currentTrack.op[segId] === '0.75') {
        eqMode = 'off';
    }
}

Track.prototype.onOffEq = function(segId)
{
    if (eqMode === 'on') {
        this.op[segId] = '0.75';
        this.filterToggle[segId].gain.value = 1;
    } else if (eqMode === 'off') {
        this.op[segId] = '0.1';
        this.filterToggle[segId].gain.value = 0;
    }
}

Track.prototype.getCollided = function()
{
    this.collided = [];
    for (let i = 0; i < tracks.length; i++) {
        if (this != tracks[i] && this.eqX === tracks[i].eqX) {
            this.collided.push(tracks[i]);
        }
    }
}
Track.prototype.splitter = function( i, noSplit)
{
    this.eqX += (i * this.rectW);
    this.eqMovedFlag = true;
}

Track.prototype.setRectW = function()
{
    if (this.collided.length === 0) {
        this.rectW = Master.gridW;
    } else if (this.collided.length > 0) {
        this.rectW = Master.gridW / (this.collided.length+1);
    }
}

Track.prototype.textSoloColor = function()
{
    if (this.isSolod) {
        fill(255, 255, 102)
    } else {
        fill(50);
    }
}

Track.prototype.loadNewAudio = function( url)
{
    this.audio.dispose();   // Dispose of old player  
    this.setAudio( url);
}