const fs = require('fs')

class PieceTable {
    constructor(original){
        this.buffers = [ original ];
        this.pieces = [ Piece(0, 0, original.length-1) ];
    }

    findPiece(charNo){
        if(charNo === 1){
            return [0, 0, -1];
        }
        let curChar = 1;
        for(let i=0;i<this.pieces.length;i++){
            let length = this.pieces[i].end - this.piece[i].start + 1;
            if(length + curChar < charNo) {curChar+=length; continue;}
            if(length + curChar == charNo){
                return [i, 2, -1];
            }
            return [i, 1, this.pieces[i].start + (charNo - curChar)]; // index just after the cut
        }
    }

    addText(text, charNo){
        let newPiece = new Piece(buffer.length, 0, text.length-1);
        this.buffers.push(text);
        let pieceCoordinate = this.findPiece(charNo);
        switch (pieceCoordinate[1]) {
            case 0:
                insertBeforePiece(newPiece, pieceCoordinate[0]);
                break;
            case 1:
                insertInBetweenPiece(newPiece, pieceCoordinate[0], pieceCoordinate[2]);
                break;
            case 2:
                insertAfterPiece(newPiece, pieceCoordinate[0]);
                break;
            default:
                break;
        }
        
    }

    insertAfterPiece(newPiece, indexOfPiece){
        this.pieces.splice(indexOfPiece+1,0,newPiece);
    }

    insertBeforePiece(newPiece, indexOfPiece){
        console.log("NAHI AANA CHAHIYE");
        this.pieces.splice(indexOfPiece,0,newPiece);
    }

    insertInBetweenPiece(newPiece, indexOfPieceToSplit, index){
        // index ke pehle insert karna hai
        pieceToSplit = this.pieces[indexOfPieceToSplit];
        rightPiece = new Piece(pieceToSplit.bufferIndex, index, pieceToSplit.end);
        this.pieces[indexOfPieceToSplit].end = index-1;
        this.pieces.splice(indexOfPieceToSplit+1, 0, [newPiece,rightPiece]);
    }

    deleteText(startCharNo, endCharNo){
        if(startCharNo === endCharNo) return;
        let startPieceCoordinate = this.findPiece(startCharNo);
        let endPieceCoordinate = this.findPiece(startCharNo);
        let pieceIndexToDeleteFrom = -1, pieceIndexToDeleteTo = -1;
        let leftFullFlag = false, rightFullFlag = false;

        if(startPieceCoordinate[1]==2) {
            pieceIndexToDeleteFrom = startPieceCoordinate[0]+1;
            leftFullFlag = true;
        }
        else if(startPieceCoordinate[1]==0) {
            pieceIndexToDeleteFrom = startPieceCoordinate[0];
            leftFullFlag = true;
        }
        else{
            pieceIndexToDeleteFrom = startPieceCoordinate[0]+1;
        }

        if(endPieceCoordinate[1]==0) {
            pieceIndexToDeleteTo = endPieceCoordinate[0]-1;
            rightFullFlag = true;
        }
        else if(endPieceCoordinate[1]==2) {
            pieceIndexToDeleteTo = endPieceCoordinate[0];
            rightFullFlag = true;
        }
        else{
            pieceIndexToDeleteTo = endPieceCoordinate[0]-1;
        }

        if(pieceIndexToDeleteTo - pieceIndexToDeleteFrom + 1 > 0){
            this.pieces.splice(pieceIndexToDeleteFrom, pieceIndexToDeleteTo - pieceIndexToDeleteFrom + 1);
        }   
        if(startPieceCoordinate[1]==1){
            this.pieces[startPieceCoordinate[0]].end = startPieceCoordinate[2];
        } 
        
        if(endPieceCoordinate[1]==1){
            this.pieces[endPieceCoordinate[0]].start = endPieceCoordinate[2];
        } 
    }

    constructFinalDocument(){
        let fileDescriptor = fd;
        fs.open("mynewfile1.txt", "w", function(err, fd){
            if(err) console.log(err);
            console.log("File opened")
        });
        let posInFile=0;
        for(let piece in this.pieces){
            let length = piece.end - piece.start + 1;
            fs.write(Buffer(this.buffers[piece.bufferIndex]), piece.start, length, posInFile);
            posInFile+=length;
        }
        fs.close(fd);
    }


}