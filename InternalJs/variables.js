"use strict"; // use JS strict mode

let mouseIsPressed = false;
let tracks = []; // Array to hold all tracks
let Master; // Object holding important variables
let currentTrack = tracks[0]; 
let eqFirstTime = true;
let shiftDragged = false;
let firstKeyPress = false;
let firstTimeClicked = true;
let fileInputFirstTime = true;
let prevMode = 'mix';
let prevMousePosY;
let firstDrag = false;
let eqMode;
let trackSolod = false;

let prevMouseDirection;
let dragDirection;
let eqCounter = 0;

let shiftHit = false;
let hitTrack;

let loaded = false;

let stillClicked = false;
let mPressed = false;



function Global( gridNoW, gridNoH)
{
    this.w;
    this.h;
    this.gridNoW;
    this.gridNoH;
    this.gridW; // This sets the points for the grid
    this.gridH; //
    this.sclW; // This sets the point for the snap to grid 
    this.sclH; // (Half way inbetween each the grid points from above)
    this.centerPointsX = []; // Center point of each grid space
    this.centerPointsY = []; // Center point of each grid space
    this.rectPointsY = []; // Top left corner of each grid

    this.mode = 'mix';

    this.reSizeCanv = function() {
        this.w = window.innerWidth * .8;
        this.h = window.innerHeight * .8;

        this.gridNoW = gridNoW;
        this.gridNoH = gridNoH;

        this.gridW = this.w / this.gridNoW; // This sets the points for the grid
        this.gridH = this.h / this.gridNoH; //

        this.sclW = this.w / (gridNoW * 2); // This sets the point for the snap to grid 
        this.sclH = this.h / (gridNoH * 2); // (Half way inbetween each the grid points from above)
    };

    this.reSizeCanv();
    this.setCenterPoints();
}

Global.prototype.isReady = function()
{
    for (let i = 0; i < tracks.length; i++) {
        if (!tracks[i].readyToPlay) {
            return false;
        }
    }
    return true;
}

Global.prototype.setCenterPoints = function()
{
    this.centerPointsX[0] = this.sclW;
    for (let i = 1; i < this.gridNoW; i++) {
        this.centerPointsX[i] = this.centerPointsX[i-1] + (this.sclW * 2);
    }
    this.centerPointsY[0] = this.sclH;
    this.rectPointsY[0] = this.centerPointsY[0] - this.sclH;
    for (let i = 1; i < this.gridNoH; i++) {
        this.centerPointsY[i] = this.centerPointsY[i-1] + (this.sclH * 2);
        this.rectPointsY[i] = this.centerPointsY[i] - this.sclH;
    }
}

function nodeColour( colour, opac)
{
    let colTemp;
    switch (colour)
    {
        case 'red':
            colTemp = 'rgba(146, 43, 33,'+opac+')';
            break;
        case 'green':
            colTemp = 'rgba(35, 155, 86,'+opac+')';
            break;
        case 'blue':
            colTemp = 'rgba(40, 116, 166,'+opac+')';
            break;
        case 'yellow':
            colTemp = 'rgba(183, 149, 11,'+opac+')';
            break;
        case 'orange':
            colTemp = 'rgba(160, 64, 0,'+opac+')';
            break;
        case 'purple' : 
            colTemp = 'rgba(108, 52, 131,'+opac+')';
            break;
        case 'grey' :
            colTemp = 'rgba(236, 240, 241,'+opac+')';
            break;
        default:
            colTemp = 'rgba(0, 21, 45,'+opac+')';
    }
    return colTemp;
}

// function createTracks()
// {
//     let kick = new Track( 7, 7, Master.sclW*.75, 'kick', 'red', 'Audio/DaisyDaisySamples/kick.wav');
//     let snare = new Track( 7, 9, Master.sclW*.75, 'snare', 'orange', 'Audio/DaisyDaisySamples/Snare.wav');
//     let ohl = new Track( 6, 9, Master.sclW*.75, 'ohl', 'green', 'Audio/DaisyDaisySamples/OverheadLeft.wav');
//     let ohr = new Track( 8, 9, Master.sclW*.75, 'ohr', 'green', 'Audio/DaisyDaisySamples/OverheadLeft.wav');
//     let bass = new Track( 7, 10, Master.sclW*.75, 'bass', 'blue', 'Audio/DaisyDaisySamples/BassAmp.wav');
//     let guitar1 = new Track( 6, 8, Master.sclW*.75, 'gtr1', 'yellow', 'Audio/DaisyDaisySamples/Guitar1.wav');
//     let guitar2 = new Track( 8, 8, Master.sclW*.75, 'gtr2', 'yellow', 'Audio/DaisyDaisySamples/Guitar1.wav');
//     let vox = new Track( 7, 8, Master.sclW*.75, 'vox', 'purple', 'Audio/DaisyDaisySamples/LeadVoxDoubletrack.wav');
//     tracks.push(kick, snare, ohl, ohr, bass, guitar1, guitar2, vox);
//     console.log(tracks);
// }

function createTracks()
{
    let kick = new Track( 7, 7, Master.sclW*.75, 'kick', 'red', 'Audio/DaisyDaisySamples/kick.wav'),
        snare = new Track( 7, 9, Master.sclW*.75, 'snare', 'orange', 'Audio/DaisyDaisySamples/Snare.wav'),
        ohl = new Track( 6, 9, Master.sclW*.75, 'ohl', 'green', 'Audio/DaisyDaisySamples/OverheadLeft.wav'),
        ohr = new Track( 8, 9, Master.sclW*.75, 'ohr', 'green', 'Audio/DaisyDaisySamples/OverheadLeft.wav'),
        bass = new Track( 7, 10, Master.sclW*.75, 'bass', 'blue', 'Audio/DaisyDaisySamples/BassAmp.wav'),
        guitar1 = new Track( 6, 8, Master.sclW*.75, 'gtr1', 'yellow', 'Audio/DaisyDaisySamples/Guitar1.wav'),
        guitar2 = new Track( 8, 8, Master.sclW*.75, 'gtr2', 'yellow', 'Audio/DaisyDaisySamples/Guitar1.wav'),
        vox = new Track( 7, 8, Master.sclW*.75, 'vox', 'purple', 'Audio/DaisyDaisySamples/LeadVoxDoubletrack.wav');
    tracks.push(kick, snare, ohl, ohr, bass, guitar1, guitar2, vox);
}