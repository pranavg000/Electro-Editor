function keuplistner(e) {
    console.log(rowcnt.childNodes.length);
}

function keydownlistner(e) {
    if (curObj && e.key.match(/Arrow/)) {
        if (curObj.piecestring.length != 0)
            addpiece();
    }
    if (curObj && (e.keyCode == 8 || e.keyCode == 46) && !e.altKey && mainContent.value.length >= mainContent.selectionStart) {
        // if (curObj.lenofpiece != 0 && curObj.inptype != "delete") {
        //     addpiece();
        // }
        var numnewline = document.getSelection().toString();

        if (numnewline.length == 0) {
            if ((mainContent.value[mainContent.selectionStart - 1] == '\n' && e.keyCode == 8) || (mainContent.value[mainContent.selectionStart] == '\n' && e.keyCode == 46)) {
                decrementrow(1);
            }
            if (e.keyCode == 8 || e.keyCode == 46) {
                let incr = 0;
                if (e.keyCode == 46)
                    incr++;
                textchanged("delete", mainContent.selectionStart - 1 + incr, 1);

                // if (curObj.inptype != "delete") {
                //     curObj.inptype = "delete";
                //     curObj.addpiecestart = mainContent.selectionStart - 1;
                //     curObj.lenofpiece = 1;
                //     if (e.keyCode == 46)
                //         curObj.addpiecestart++;
                // }
                // else {
                //     curObj.addpiecestart = Math.min(curObj.addpiecestart, mainContent.selectionStart - 1);
                //     curObj.lenofpiece++;
                // }
                // console.log(curObj.addpiecestart + "*" + curObj.lenofpiece + "*" + mainContent.selectionEnd + '*');
                // addpiece();
            }

        }
        else {
            // if (curObj.lenofpiece > 0)
            //     addpiece();
            textchanged("delete", Math.min(mainContent.selectionStart, mainContent.selectionEnd), Math.abs(mainContent.selectionStart - mainContent.selectionEnd));
            // curObj.inptype = "delete";
            decrementrow(numnewline.split('\n').length - 1);
            // curObj.lenofpiece += Math.abs(mainContent.selectionStart - mainContent.selectionEnd)
            // curObj.addpiecestart = Math.min(mainContent.selectionStart, mainContent.selectionEnd);
            // addpiece();

        }

        // console.log("ads" + mainContent.selectionStart + " " + mainContent.selectionEnd + document.getSelection());
    }
    else if (curObj && e.keyCode == 13 && !e.ctrlKey && !e.altKey) {
        textchanged("insert", mainContent.selectionStart, 1, "\n");
        incrementrow(1);

    }
}


function insertlistner(e) {
    if (curObj) {
        // console.log("IIII");
        if (e.inputType.match(/insert/) && e.data != null) {
            // console.log("hhh");
            textchanged("insert", mainContent.selectionStart - 1, e.data.length, e.data);
            // if (curObj.inptype != 'insert')
            //     addpiece();
            // if (curObj.addpiecestart == -10)
            //     curObj.addpiecestart = mainContent.selectionStart - 1;
            // curObj.piecestring.push(e.data);
            // curObj.inptype = "insert";
            // curObj.lenofpiece++;
        }
        makeunsaved();


    }

}

function scrolllistner(e) {
    rowcnt.scrollTo(0, mainContent.scrollTop);

}

function clicklistener(e) {
    if (Math.min(mainContent.selectionStart, mainContent.selectionEnd) != curObj.addpiecestart + curObj.lenofpiece) {
        if (curObj.piecestring.length != 0)
            addpiece();
    }
}

function pastelistner(e) {
    console.log(e.clipboardData.getData('text'));
    let numnewline1 = document.getSelection().toString();
    if (numnewline1.length > 0) {
        addpiece();
        textchanged("delete", Math.min(mainContent.selectionStart, mainContent.selectionEnd), Math.abs(mainContent.selectionStart - mainContent.selectionEnd));
        decrementrow(numnewline1.split('\n').length - 1);
    }
    let txt = e.clipboardData.getData('text');
    if (txt.length > 0) {
        addpiece();
        textchanged("insert", mainContent.selectionStart, txt.length, txt);
        // curObj.addpiecestart = mainContent.selectionStart;
        // curObj.piecestring.push(txt);
        // curObj.inptype = "insert";
        // curObj.lenofpiece = txt.length;
        incrementrow(txt.split('\n').length - 1);
        // addpiece();
    }
    console.log(mainContent.selectionStart);
}

function cutlistner(e) {
    // console.log("JI");
    console.log(document.getSelection().toString());
    let numnewline1 = document.getSelection().toString();
    if (numnewline1.length > 0) {
        addpiece();
        textchanged("delete", Math.min(mainContent.selectionStart, mainContent.selectionEnd), Math.abs(mainContent.selectionStart - mainContent.selectionEnd));
        // curObj.inptype = "delete";
        decrementrow(numnewline1.split('\n').length - 1);
        // curObj.lenofpiece = Math.abs(mainContent.selectionStart - mainContent.selectionEnd)
        // curObj.addpiecestart = Math.min(mainContent.selectionStart, mainContent.selectionEnd);
        // addpiece();
    }

}

module.exports = {
    keyup: keuplistner,
    keydown: keydownlistner,
    cut: cutlistner,
    paste: pastelistner,
    scroll: scrolllistner,
    input: insertlistner,
    click: clicklistener,
}