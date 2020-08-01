var path = require('path');
const Piece = require((path.resolve(__dirname,'scripts/charwisept/Piece.js'))).Piece;
const PieceRange = require((path.resolve(__dirname,'scripts/charwisept/Piece.js'))).PieceRange;

class PieceTable {
    constructor(original){  
        this.buffers = [ original ];
        this.pieceHead = new Piece(0, 0, original.length-1);
        this.pieceTail = this.pieceHead;
        this.undoStack = new Array();
        this.redoStack = new Array(); 
    }

    reloadContent(fileData){
        this.buffers.push(fileData);
        let newPiece = new Piece(this.buffers.length-1, 0, fileData.length-1);
        let newPieceRange = new PieceRange(this.pieceHead, this.pieceTail);
        this.pieceHead = newPiece;
        this.pieceTail = newPiece;
        this.pushUndo(newPieceRange);
    }

    findPiece(charNo){
        if(charNo === 1){
            return [this.pieceHead, 0, -1];
        }
        let curChar = 1;
        let piece = this.pieceHead;
        while(piece!=null){
            let length = piece.end - piece.start + 1;
            if(length + curChar < charNo) {
                curChar+=length; 
                piece = piece.next; 
                continue;
            }
            if(length + curChar == charNo){
                return [piece, 2, -1];
            }
            return [piece, 1, piece.start + (charNo - curChar)]; // index just after the cut
        }
    }

    addText(text, charNo){
        let newPiece = new Piece(this.buffers.length, 0, text.length - 1);
        this.buffers.push(text);
        let pieceCoordinate = this.findPiece(charNo);
        switch (pieceCoordinate[1]) {
            case 0:
                this.insertBeforePiece(newPiece, pieceCoordinate[0]);
                break;
            case 1:
                this.insertInBetweenPiece(newPiece, pieceCoordinate[0], pieceCoordinate[2]);
                break;
            case 2:
                this.insertAfterPiece(newPiece, pieceCoordinate[0]);
                break;
            default:
                break;
        }
        
    }

    insertAfterPiece(newPiece, piece, insertInUndo=true){
        
        newPiece.next = piece.next;
        if(newPiece.next) newPiece.next.prev = newPiece;
        else this.pieceTail = newPiece;
        piece.next = newPiece;
        newPiece.prev = piece;
        if(insertInUndo){
            let pieceClone = this.clone(piece);
            if(newPiece.next){
                let nextPieceClone = this.clone(newPiece.next);
                pieceClone.next = nextPieceClone;
                nextPieceClone.prev = pieceClone;
                this.pushUndo(new PieceRange(pieceClone, nextPieceClone));
            }
            else{
                pieceClone.next = null;
                this.pushUndo(new PieceRange(pieceClone, pieceClone));
            }
        }
    }

    insertBeforePiece(newPiece, piece){
        // Only called when Inserted before head node
        newPiece.next = this.pieceHead;
        this.pieceHead = newPiece;
        let pieceClone = this.clone(piece);
        piece.prev = newPiece;
        this.pushUndo(new PieceRange(pieceClone, pieceClone));
    }

    insertInBetweenPiece(newPiece, pieceToSplit, index){
        // index ke pehle insert karna hai
        let rightPiece = new Piece(pieceToSplit.bufferIndex, index, pieceToSplit.end);
        let pieceCopy = this.clone(pieceToSplit);
        this.pushUndo(new PieceRange(pieceCopy, pieceCopy));
        pieceToSplit.end = index-1;
        this.insertAfterPiece(newPiece, pieceToSplit, false);
        this.insertAfterPiece(rightPiece, newPiece, false);
    }

    deleteText(startCharNo, endCharNo){ // [startCharNo, endCharNo)  delete 
        if(startCharNo > endCharNo) return;
        let startPieceCoordinate = this.findPiece(startCharNo);
        let endPieceCoordinate = this.findPiece(endCharNo);  
        let piece = startPieceCoordinate[0];
        let startPiece = startPieceCoordinate[0], endPiece = endPieceCoordinate[0];
        // piece is the first node to be deleted
        // startPiece is the node to the left of piece
        // endPiece is the node to the right of rightmost deleted piece
        if(startPieceCoordinate[1]===0){
            startPiece = startPiece.prev;
        }
        else if(startPieceCoordinate[1]===1){
            startPiece = new Piece(piece.bufferIndex, piece.start, startPieceCoordinate[2]-1, piece.prev, null);
            if(startPiece.prev) startPiece.prev.next = startPiece;
            else this.pieceHead = startPiece;

        }
        else if(startPieceCoordinate[1]===2) {
            piece=piece.next;
            // startPiece = startPiece.next;
        }
        
        while(piece != endPieceCoordinate[0] && piece!=null){
            piece = piece.next;
        } 
        if(endPieceCoordinate[1]===1){
            
            endPiece = new Piece(endPieceCoordinate[0].bufferIndex, endPieceCoordinate[2], endPieceCoordinate[0].end, null, endPieceCoordinate[0].next);
            if(endPiece.next) endPiece.next.prev = endPiece;
            else this.pieceTail = endPiece;
        }
        else if(endPieceCoordinate[1]===2){
            endPiece = endPiece.next;
        }
        let pieceRange = new PieceRange(piece, endPieceCoordinate[0]);
        if(startPiece) startPiece.next = endPiece;
        else{
            this.pieceHead = endPiece;
        }
        if(endPiece) endPiece.prev = startPiece;  
        else{
            this.pieceTail = startPiece;
        }    
        this.pushUndo(pieceRange);
    }

    
    applyUndoRedo(lastEdit){
        let newRange = new PieceRange();
        let prevPiece = lastEdit.first.prev;
        let nextPiece = lastEdit.last.next;
        if(prevPiece){
            newRange.first = prevPiece.next;
            prevPiece.next = lastEdit.first;
        }
        else{
            newRange.first = this.pieceHead;
            this.pieceHead = lastEdit.first;
        }

        if(nextPiece){
            newRange.last = nextPiece.prev;
            nextPiece.prev = lastEdit.last;
        }
        else{
            newRange.last = this.pieceTail;
            this.pieceTail = lastEdit.last;
        }  
        return newRange;
        
    }
    applyUndo(){
        if(!this.undoStack.length) {
            console.log("Empty Undo Stack");
            return false;
        }
        let lastEdit = this.undoStack[this.undoStack.length-1];
        let newRange = this.applyUndoRedo(lastEdit);
        this.popUndo();
        this.pushRedo(newRange);
    }

    applyRedo(){
        if(!this.redoStack.length) {
            console.log("Empty Redo Stack");
            return false;
        }
        let lastEdit = this.redoStack[this.redoStack.length-1];
        let newRange = this.applyUndoRedo(lastEdit);
        this.popRedo();
        this.pushUndo(newRange);
    }

    popUndo(){
        if(this.undoStack.length) this.undoStack.pop();
    }

    popRedo(){
        if(this.redoStack.length) this.redoStack.pop();
    }

    pushUndo(pieceRange){
        if(this.undoStack.length==10) this.undoStack.shift();
        this.undoStack.push(pieceRange);
    }
    pushRedo(pieceRange){
        if(this.redoStack.length==10) this.redoStack.shift();
        this.redoStack.push(pieceRange);
    }

    clone(piece){
        return new Piece(piece.bufferIndex, piece.start, piece.end, piece.prev, piece.next);
    }



}