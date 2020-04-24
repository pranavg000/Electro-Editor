const fs = require('fs')

class FileObject {

    constructor(fullFilePath, fileName, clone = null) {
        if (!clone) {
            this.isOpen = true;
            this.isSaved = true;
            this.isChangedRecently = false;            
            this.fileName = Object(fileName);
            this.fullFilePath = Object(fullFilePath);
            this.pieceTable = new PieceTable(this.safeRead());
            this.piecestring = [];
            this.inptype = ""
            this.addpiecestart = -10;
            this.lenofpiece = 0;
        }
        else {
            this.isOpen = clone.isOpen;
            this.isSaved = clone.isSaved;
            this.fileName = Object(clone.fileName);
            this.fullFilePath = Object(clone.fullFilePath);
            this.pieceTable = new PieceTable(clone.pieceTable.buffers[0]);
            this.piecestring = [];
            this.inptype = ""
            this.addpiecestart = -10;
            this.lenofpiece = 0;
        }



    }

    safeRead(){
        let fileDatatemp = fs.readFileSync(this.fullFilePath.toString(), 'utf8').toString();
        let fileData = []
        for (let i = 0; i < fileDatatemp.length; i++) {
            if (fileDatatemp.charCodeAt(i) != 13)
                fileData.push(fileDatatemp.charAt(i));
        }
        return fileData.join('');
    }


    saveTheFile() {
        // console.log(this.pieceTable);
        // return;
        if (!this.isSaved) {
            this.isChangedRecently = true;
            this.isSaved = true;
            let fileDescriptor;
            var this_ = this;
            fs.open(this.fullFilePath.toString(), "w", function (err, fd) {
                if (err) console.log(err);
                fileDescriptor = fd
                // console.log("File opened")
                let posInFile = 0;
                // let fullText = [];
                // console.log(this_, this_.pieceTable);
                let piece = this_.pieceTable.pieceHead;
                while (piece) {
                    // console.log(piece);
                    // for(let i=piece.start;i<=piece.end;i++){
                    //     fullText.push(this_.pieceTable.buffers[piece.bufferIndex][i]);
                    // }
                    let length = piece.end - piece.start + 1;
                    fs.writeSync(fileDescriptor, Buffer(this_.pieceTable.buffers[piece.bufferIndex]), piece.start, length, posInFile);
                    posInFile += length;
                    piece = piece.next;
                }
                fs.close(fileDescriptor, function (err) {
                    if (err) console.log(err);
                    console.log("Saved");
                });
            });
        }
    }

    reset() {
        let ms = [];
        let piece = this.pieceTable.pieceHead;
        while (piece) {
            let length = piece.end - piece.start + 1;
            for (let i = piece.start; i <= piece.end; i++) {
                ms.push(this.pieceTable.buffers[piece.bufferIndex][i]);
            }
            piece = piece.next;
        }
        this.pieceTable = new PieceTable(ms.join(''));
        console.log(ms.join(''));
    }





}
