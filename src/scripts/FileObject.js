const fs = require('fs')

class FileObject {

    constructor(fullFilePath, fileName){
        this.isOpen = true;
        this.isSaved = false;
        this.fileName = Object(fileName);
        this.fileData = fs.readFileSync(fullFilePath, 'utf8');
        console.log(this.fileData); 
        this.fullFilePath = Object(fullFilePath);
    }

    readTheFile(fullFilePath){
        
        fs.readFile(fullFilePath, (err, data) => {
            if (err) throw err;
            console.log(data);
            console.log("File read!!")
            this.fileData = data;
        }); 
    }

    saveTheFile(){
        if(!this.isSaved){
            fs.writeFile(this.fullFilePath, this.fileData, function(err){
                if(err) throw err;
                console.log("Saved");
            })
        }
    }





}