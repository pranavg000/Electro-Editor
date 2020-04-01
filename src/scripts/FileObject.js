const fs = require('fs')

class FileObject {

    constructor(fullFilePath, fileName){
        this.isOpen = true;
        this.isSaved = true;
        this.fileName = Object(fileName);
        this.fileData = fs.readFileSync(fullFilePath, 'utf8');
        this.pieceTable = new PieceTable(this.fileData);
        this.fullFilePath = Object(fullFilePath);
    }

    readTheFile(fullFilePath){
        
        fs.readFile(fullFilePath, (err, data) => {
            if (err) throw err;
            // console.log(data);
            console.log("File read!!")
            this.fileData = data;
        }); 
    }

    saveTheFile(){
        console.log(this.pieceTable);
        // return;
        if(!this.isSaved){
            let fileDescriptor;
            var this_ = this;
            fs.open(this.fullFilePath.toString(), "w", function(err, fd){
                if(err) console.log(err);
                fileDescriptor = fd
                console.log("File opened")
                let posInFile=0;
                let fullText = [];
                console.log(this_, this_.pieceTable);
                let piece = this_.pieceTable.pieceHead;
                while(piece){
                    for(let i=piece.start;i<=piece.end;i++){
                        fullText.push(this_.pieceTable.buffers[piece.bufferIndex][i]);
                    }
                    let length = piece.end - piece.start + 1;
                    fs.writeSync(fileDescriptor, Buffer(this_.pieceTable.buffers[piece.bufferIndex]), piece.start, length, posInFile);
                    posInFile+=length;
                    piece = piece.next;
                }
                fs.close(fileDescriptor, function(err){
                    if(err) console.log(err);
                    console.log("Written in File")
                    console.log(fullText.join(''))
                    this_.pieceTable = new PieceTable(fullText.join(''));
                });
            });
            
            // fs.writeFile(this.fullFilePath, this.fileData, function(err){
            //     if(err) throw err;
            //     console.log("Saved");
            // })
        }
    }





}
