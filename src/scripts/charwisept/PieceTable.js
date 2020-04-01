const fs = require('fs')

class PieceTable {
    constructor(original){
        this.buffers = [ original ];
        this.pieceHead = Piece(0, 0, original.length-1);
        this.pieceTail = this.pieceHead;
    }

    findPiece(charNo){
        if(charNo === 1){
            return [this.pieceHead, 0, -1];
        }
        let curChar = 1;
        let piece = this.pieceHead;
        while(piece!=null){
            let length = piece.end - piece.start + 1;
            if(length + curChar < charNo) {curChar+=length; piece = piece.next; continue;}
            if(length + curChar == charNo){
                return [piece, 2, -1];
            }
            return [piece, 1, piece.start + (charNo - curChar)]; // index just after the cut
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

    insertAfterPiece(newPiece, piece){
        newPiece.next = piece.next;
        piece.next = newPiece;
        // this.pieces.splice(indexOfPiece+1,0,newPiece);
    }

    insertBeforePiece(newPiece, piece){
        newPiece = this.pieceHead;
        this.pieceHead = newPiece;
        // this.pieces.splice(indexOfPiece,0,newPiece);
    }

    insertInBetweenPiece(newPiece, pieceToSplit, index){
        // index ke pehle insert karna hai
        rightPiece = new Piece(pieceToSplit.bufferIndex, index, pieceToSplit.end);
        pieceToSplit.end = index-1;
        this.insertAfterPiece(newPiece, pieceToSplit);
        this.insertAfterPiece(rightPiece, newPiece);
        // this.pieces.splice(indexOfPieceToSplit+1, 0, [newPiece,rightPiece]);
    }

    deleteText(startCharNo, endCharNo){
        if(startCharNo === endCharNo) return;
        let startPieceCoordinate = this.findPiece(startCharNo);
        let endPieceCoordinate = this.findPiece(startCharNo);
        
        if(startPieceCoordinate[1]==0){
            this.pieceHead = endPieceCoordinate[0];
        }
        else{
            startPieceCoordinate[0].next = endPieceCoordinate[0];
        }

        if(startPieceCoordinate[1]==1){
            startPieceCoordinate[0].end = startPieceCoordinate[2];
        } 
        if(endPieceCoordinate[1]==1){
            endPieceCoordinate[0].start = endPieceCoordinate[2];
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