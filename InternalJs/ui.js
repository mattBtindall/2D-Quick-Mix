"use strict"; // use JS strict mode

function setup() 
{
    Master = new Global( 15, 11);
    createCanvas(Master.w,Master.h);
    drawTransport( Master.w);
    // drawFileInputDiv();
    // drawInputs();
    // drawDropZone();
    // let body = document.querySelector('body');
    // body.unselectable = 'on';
    //drawTransport( Master.w);
    document.getElementById('defaultCanvas0').oncontextmenu = (e) => e.preventDefault(); // Disable right click on canvas
}

function draw()
{   
    selectMode();
}

function windowResized() 
{
    let posTemp = getGridPos(); // Get the grid positions of the nodes
    Master.reSizeCanv();
    Master.setCenterPoints();
    resizeCanvas(Master.w, Master.h,false);
    for (let i = 0; i < tracks.length; i++) { // Snap grid positiona when resizing
        tracks[i].updateUi( posTemp[0], posTemp[1]);
        tracks[i].x = Master.centerPointsX[posTemp[0][i]];
        tracks[i].y = Master.centerPointsY[posTemp[1][i]];
    }
}

function getGridPos()
{
    let xTemp = [];
    let yTemp = [];
    let posTemp = [];

    for (let i = 0; i < tracks.length; i++) {
        xTemp[i] = Master.centerPointsX.indexOf(tracks[i].x);
        yTemp[i] = Master.centerPointsY.indexOf(tracks[i].y);
    }
    posTemp.push( xTemp, yTemp);
    return posTemp;
}

function drawGrid()
{
    stroke(175);
    strokeWeight(2);

    let xGrid = Master.gridW;
    while (xGrid < Master.w) {
        line(xGrid,0,xGrid,Master.h);
        xGrid = xGrid + Master.gridW;
    }
    let yGrid = Master.gridH;
    while (yGrid < Master.h) {
        line(0,yGrid,Master.w,yGrid);
        yGrid = yGrid + Master.gridH;
    }

    // let xGridCen = Master.sclW;
    // while (xGridCen < Master.w) {
    //     line(xGridCen,0,xGridCen,Master.h);
    //     xGridCen = xGridCen + Master.sclW;
    // }
    // let yGridCen = Master.sclH;
    // while (yGridCen < Master.h) {
    //     line(0,yGridCen,Master.w,yGridCen);
    //     yGridCen = yGridCen + Master.sclH;
    // }
}

function selectMode()
{
    if (Master.mode != prevMode) {
        console.log('changed mode');
        iconSelect();
    }
    if (Master.mode === 'mix' || Master.mode === 'eq') {
        background(51); stroke(0); strokeWeight(2); fill(100);
        let shape = rect(Master.gridW*6,0,Master.gridW*3,height);
        drawGrid();   
        fileInputFirstTime = true;
    
        if (Master.mode === 'mix') {
            for (let i = 0; i < tracks.length; i++) {
                frameRate(30);
                tracks[i].moveMix();
                tracks[i].showMix();
                eqFirstTime = true;
                prevMode = 'mix';
            }
            for (let i = 0; i < tracks.length; i++) {
                tracks[i].drawCross();
            }
        } else if (Master.mode === 'eq') {
            frameRate(15);
            eq();
        }  
    } 
    else if (Master.mode === 'input') {
        if (fileInputFirstTime === true) {
            fileInputFirstTime = false;
            prevMode = 'input';
        }
    }
}

// function toggleCanvas( on)
// {
//     let canvTemp = document.getElementById('defaultCanvas0');
//     if (on) {
//         console.log('on')
//         hideShowCanvas(1);
//     }
//     else {
//         console.log('off');
//         hideShowCanvas(0);
//     }
// }

// function hideShowCanvas( opacity)
// {
//     let canvTemp = document.getElementById('defaultCanvas0').style.opacity = opacity;
// }

function eq()
{
    let i;
    if (eqFirstTime) {
        initEqUi();
        splitTest();
        eqFirstTime = false;
    }
    for (i = 0; i < tracks.length; i++) {
        tracks[i].drawEq();
    }
    for (i = 0; i < tracks.length; i++) {
        tracks[i].drawRectLabel((tracks[i].eqX));
    }
    prevMode = 'eq';
}

function initEqUi()
{
    let i;
    for (i = 0; i < tracks.length; i++) { // Reset the eqMoved flag
        tracks[i].eqMovedFlag = false;
    }
    for (i = 0; i < tracks.length; i++) { // Sets the start posistion for the 
        tracks[i].eqX = tracks[i].x -Master.sclW;
    }
    for (i = 0; i < tracks.length; i++) { // Gets all the collided objects and stores them in a member variable
        tracks[i].getCollided();
    }
    for (i = 0; i < tracks.length; i++) { // Sets the size of the rect depending on how many objs have collided with eachother
        tracks[i].setRectW();
    }
}

function drawTransport( )
{
    let div = document.createElement('div');
    div.setAttribute('id', 'transport');
    div.style.maxWidth = (Master.gridW * 7)+'px';
    div.style.minWidth = (Master.gridW * 7)+'px';
    div.style.minHeight = (Master.sclH*3)+'px';
    div.style.marginTop = (Master.sclH)+'px';
    div.style.fontSize = (Master.sclW/3.1)+'px';
    let body = document.getElementsByTagName('body')[0].appendChild(div);
    drawButtons();
}

function createButton( id, btnClass, onclickBtn, label, appened, icon)
{
    let name = document.createElement('button');
    name.setAttribute('id', id);
    name.setAttribute('class', btnClass);
    name.setAttribute('onclick', onclickBtn);
    name.innerHTML = label;
    let appenedTemp = document.getElementById(appened).appendChild(name);
    let iTag = document.createElement('i');
    iTag.setAttribute('class', icon);
    let btnTemp = document.getElementById(id).appendChild(iTag)
}

function drawButtons()
{
    createButton( 'playPause', 'transportBtn', 'playPause()', 'Play/Pause ', 'transport', 'fa fa-play');
    createButton( 'mixMode', 'transportBtn', 'Master.mode = "mix"', 'Mix ', 'transport',  'fa fa-music');
    createButton('eq', 'transportBtn', 'Master.mode = "eq"', 'Eq ', 'transport', 'fa fa-signal');
    //createButton( 'fileInput', 'transportBtn', 'Master.mode = "input"', 'File Input ', 'transport', 'fa fa-folder');
}

function playPauseIcon()
{
    let temp = document.getElementsByClassName('fa');
    if (temp[0].className === 'fa fa-play') {
        temp[0].className = 'fa fa-pause';
    } else if (temp[0].className === 'fa fa-pause') {
        temp[0].className = 'fa fa-play';
    }
}

// function iconSelect()
// {
//     let tempIcon = document.getElementsByClassName('fa');
//     for (let i = 3; i < 12; i++) {
//         console.log(tempIcon)
//         tempIcon[i].style.color = '#505739';
//     }
//     switch (Master.mode)
//     {
//         case 'mix' : 
//             tempIcon[1].style.color = '#ABEBC6'; 
//             break;
//         case 'eq' :
//             tempIcon[2].style.color = '#ABEBC6';
//             break;
//         case 'input' :
//             tempIcon[11].style.color = '#ABEBC6';
//             break;
//     }
// }

function iconSelect()
{
    let icons = document.getElementsByClassName('fa');
    for (let i = 1; i < icons.length; i++) {
        icons[i].style.color = '#505739';
    }
    if (Master.mode === 'eq') {
        icons[2].style.color = '#ABEBC6';
    } else {
        icons[1].style.color = '#ABEBC6';
    }
}

function drawInputs()
{
    let i;
    let trackNames = ['kick', 'snare', 'ohl', 'ohr', 'bass', 'gtr1', 'gtr2', 'vox'];
    let trackColours = ['red', 'orange', 'green', 'green', 'yellow', 'yellow', 'purple'];
    for (i = 0; i < 4; i++) {
        fileInput( i);
        createLabel( i);    
    }
    for (i = 0; i < 4; i++) {
        createInputForms( trackNames[i], i, trackColours[i]);
    }
    for (i = 4; i < 8; i++) {
        fileInput( i);
        createLabel( i);    
    }
    for (i = 4; i < 8; i++) {
        createInputForms( trackNames[i], i, trackColours[i]);
    }
}

function drawDropZone()
{
    let outerDiv = document.createElement('div');
    outerDiv.setAttribute('id', 'dropZone');
    let innerDiv = document.createElement('div');
    innerDiv.setAttribute('id', 'dropZoneStyle');
    innerDiv.innerHTML = "Or... <br>Drop Files Here";
    outerDiv.appendChild(innerDiv);
    let fileUploadDiv = document.getElementById('fileInputDiv').appendChild(outerDiv);
}

function drawFileInputDiv()
{
    let div = document.createElement('div');
    div.setAttribute('id', 'fileInputDiv');
    div.style.maxWidth = Master.w+'px';
    div.style.minWidth = Master.w+'px';
    // div.style.minWidth = '500px';
    div.style.maxHeight = Master.h+'px';
    div.style.minHeight = Master.h+'px';
    div.style.fontSize = (Master.gridW/2.9)+'px';
    let body = document.getElementsByTagName('body')[0].appendChild(div);
}

function createInputForms( trackName, i, colour)
{
    let fileInputTemp = document.getElementById('fileInputDiv');
    let formDiv = document.createElement('div');
    formDiv.setAttribute('class', 'formDivs');
    // formDiv.style.fontSize = (Master.gridW/2.9)+'px';
    fileInputTemp.appendChild(formDiv);

    let form = document.createElement('form');
    form.onsubmit = testFunc;
    form.setAttribute('class', 'inputForms');
    form.setAttribute('id', 'form'+i);
    form.style.fontSize = (Master.gridW/1.9)+'px';

    let textInput = document.createElement('input');
    textInput.setAttribute('type', 'text');
    textInput.setAttribute('id', 'trackName'+i);
    textInput.setAttribute('placeholder', trackName);
    form.appendChild(textInput);

    let dropDownMenu = document.createElement('select');
    dropDownMenu.setAttribute('id', 'dropDown'+i);
    
    let option1 = document.createElement('option');
    option1.text = 'red';
    dropDownMenu.add(option1);
    let option2 = document.createElement('option');
    option2.text = 'green';
    dropDownMenu.add(option2);
    let option3 = document.createElement('option');
    option3.text = 'blue';
    dropDownMenu.add(option3);
    let option4 = document.createElement('option');
    option4.text = 'yellow';
    dropDownMenu.add(option4);
    let option5 = document.createElement('option');
    option5.text = 'orange';
    dropDownMenu.add(option5);
    let option6 = document.createElement('option');
    option6.text = 'purple';
    dropDownMenu.add(option6);
    form.appendChild(dropDownMenu);

    formDiv.appendChild(form);
}

function testFunc(e) 
{
    e.preventDefault();
    let trackId = e.target.id.charAt(4);
    let htmlElements = Array.from(e.target.children);
    let truncatedString = htmlElements[0].value.substring(0, 5);
    let colour = htmlElements[1].value;

    tracks[trackId].colourName = colour;
    tracks[trackId].label = truncatedString;
}

function fileInput( i)
{
    let fileLoadInput = document.createElement("input")
    fileLoadInput.setAttribute("id", "fileLoadInput"+i);
    fileLoadInput.setAttribute("class", "inputfile");
    fileLoadInput.setAttribute("type", "file");
    //fileLoadInput.addEventListener('change' , () => handleInput( event), false)
    let fileInputTemp = document.getElementById('fileInputDiv');
    fileInputTemp.appendChild(fileLoadInput);
}

function createLabel( i)
{
    let fileInputLabel = document.createElement('label');
    fileInputLabel.setAttribute('id', 'fileInputLabel'+i);
    fileInputLabel.setAttribute('for', "fileLoadInput"+i);
    fileInputLabel.setAttribute('class', "fileLoadInputLabel");
    fileInputLabel.innerHTML = 'Choose a file ';
    let iTag = document.createElement('i');
    iTag.setAttribute('class', 'fa fa-inbox');
    fileInputLabel.appendChild(iTag);
    let htmlBreak = document.createElement('br');
    fileInputLabel.appendChild(htmlBreak);
    let fileInputTemp = document.getElementById('fileInputDiv');
    fileInputTemp.appendChild(fileInputLabel);
}

function fadeOut()
{
    if (tracks.length === 0) {
        let elem = document.getElementById('landing-page');
        let transDiv = document.getElementById('transport');
        transDiv.style.transition = "opacity 750ms linear 0s";
        transDiv.style.opacity = "1";
        elem.style.transition = "opacity 750ms linear 0s";
        elem.style.opacity = "0";
        setTimeout(() => {elem.remove();}, 750);
        let audioContext = window.AudioContext || window.webkitAudioContext;
        let audioCtx = new AudioContext();
        Tone.setContext(audioCtx);
        createTracks();
        fadeNode();
    }
}
function fadeNode()
{
    let i = 0;
    let intervalId = setInterval(()=> {
        i+=.025;
        let temp = i.toString(); 
        for (let  j = 0; j < tracks.length; j++) {
            tracks[j].colour = nodeColour( tracks[j].colourName, temp);
        }
        stopInterval( i, intervalId);
    }, 50);
}
function stopInterval( i, intervalId)
{
    if (i >= .75) {
        clearInterval(intervalId);
        loaded = true;
    }
}

function drawCross( x, y)
{
    stroke('rgb(100%,0%,10%)');
    strokeWeight(7.5);
    // line((Master.centerPointsX[x]-Master.sclW/2),(Master.centerPointsY[y]-Master.sclH/2),(Master.centerPointsX[x]+Master.sclW/2),(Master.centerPointsY[y]+Master.sclH/2));
    // line((Master.centerPointsX[x]-Master.sclW/2),(Master.centerPointsY[y]+Master.sclH/2),(Master.centerPointsX[x]+Master.sclW/2),(Master.centerPointsY[y]-Master.sclH/2));
    line((Master.centerPointsX[x]-Master.sclW/1.5),(Master.centerPointsY[y]-Master.sclH/1.5),(Master.centerPointsX[x]+Master.sclW/1.5),(Master.centerPointsY[y]+Master.sclH/1.5));
    line((Master.centerPointsX[x]-Master.sclW/1.5),(Master.centerPointsY[y]+Master.sclH/1.5),(Master.centerPointsX[x]+Master.sclW/1.5),(Master.centerPointsY[y]-Master.sclH/1.5));
}

// function verticalText(input, x, y) 
// {
//     if (y > Master.centerPointsY[8]) { // Restrict text so it doesn't fall of bottom of the canvas
//         y = Master.centerPointsY[8];
//     }
//     let output = "";  // create an empty string
//     for (let i = 0; i < input.length; i += 1) {
//         output += input.charAt(i).toUpperCase() + "\n"; // add each character with a line break in between
//     }

//     push(); // use push and pop to restore style (in this case the change in textAlign) after displaing the text 
//     textAlign(CENTER, TOP); // center the characters horizontaly with CENTER and display them under the provided y with TOP
//     //fill(50);
//     fill(0, 0, 0);
//     stroke(0);
//     textLeading(30);
//     text(output, x, y); // display text
//     pop();
// }