function addpiece() {
    // console.log("*****");
    // console.log(curObj.addpiecestart);
    // console.log(curObj.lenofpiece);
    // console.log(curObj.inptype);
    // console.log("*****");
    if (curObj.inptype.match(/insert/) && curObj.lenofpiece > 0) {
        var reqstring = curObj.piecestring.join('');
        console.log(reqstring, curObj.addpiecestart + 1);
        // console.log()
        curObj.pieceTable.addText(reqstring, curObj.addpiecestart + 1);

    }
    else if (curObj.inptype.match(/delete/) && curObj.lenofpiece > 0) {
        console.log(curObj.addpiecestart + 1, curObj.addpiecestart + curObj.lenofpiece + 1);
        curObj.pieceTable.deleteText(curObj.addpiecestart + 1, curObj.addpiecestart + curObj.lenofpiece + 1);
        // console.log(curObj.pieceTable.undoStack);
    }
    curObj.piecestring = [];
    curObj.lenofpiece = 0;
    curObj.addpiecestart = -10;
    curObj.inptype = "";
    // console.log(curObj.pieceTable);


}

function textchanged(ctype, startval, clength, cstring = "") {
    if (curObj.inptype !== ctype) {
        // console.log("running");
        addpiece();
        curObj.addpiecestart = startval;
        curObj.inptype = ctype;
    }
    curObj.addpiecestart = Math.min(curObj.addpiecestart, startval);
    curObj.lenofpiece += clength;
    if (cstring.length > 0)
        curObj.piecestring.push(cstring);
}

function incrementrow(v) {
    while (v--)
        rowcnt.insertAdjacentHTML("beforeend", '<p> ' + (rowcnt.childNodes.length + 1) + '</p>');
}
function decrementrow(v) {
    while (v--)
        rowcnt.removeChild(rowcnt.childNodes[rowcnt.childNodes.length - 1]);
}

function makeunsaved() {
    if (curObj.isSaved) {
        // console.log("Unsaved");
        // console.log("IMP" + curObj.fullFilePath.toString());
        var titleofcurobj = document.getElementById(curObj.fullFilePath.toString());
        var newtitle = curObj.fileName.toString() + "*";
        titleofcurobj.innerHTML = newtitle;
        document.getElementById(curObj.fullFilePath.toString() + "button").innerHTML = newtitle + '<span onclick=deleteTabSafe("' + curObj.fullFilePath.toString() + '") style="float:right;">&#10005;</span>';
        // console.log(newtitle);
        curObj.isSaved = false;
    }
}

function makesaved(obj=curObj){
    if(!obj.isSaved){
        var titleofcurobj = document.getElementById(obj.fullFilePath.toString());
        var newtitle = obj.fileName;
        var newPath = obj.fullFilePath;
        if (obj.isSaved === false) {
            titleofcurobj.innerHTML = newtitle;
            document.getElementById(newPath + "button").innerHTML = newtitle + '<span onclick=deleteTabSafe("' + newPath + '") style="float:right;">&#10005;</span>';
        }
        obj.isSaved = true;
    } 
}

function saveFileObject(obj) {
    addpiece();
    obj.saveTheFile();
    makesaved(obj);
}

function setCurText(obj) {
    let ms = [];
    let piece = obj.pieceTable.pieceHead;
    while (piece) {
        for (let i = piece.start; i <= piece.end; i++) {
            ms.push(obj.pieceTable.buffers[piece.bufferIndex][i]);
        }
        piece = piece.next;
    }
    //settab(curObj.fullFilePath.toString());
    document.getElementById(obj.fullFilePath.toString() + "textarea").value = ms.join('');
    if(obj.fullFilePath === curObj.fullFilePath){
        var lines = mainContent.value.split("\n");
        let incre = lines.length - rowcnt.childNodes.length;
        if (incre > 0)
            incrementrow(incre);
        else if (incre < 0)
            decrementrow(Math.abs(incre));
    }
    
    // makeunsaved();
}

module.exports = {
    addpiece: addpiece,
    incrementrow: incrementrow,
    decrementrow: decrementrow,
    textchanged: textchanged,
    makeunsaved: makeunsaved,
    makesaved: makesaved,
    saveFileObject: saveFileObject,
    setCurText: setCurText
}