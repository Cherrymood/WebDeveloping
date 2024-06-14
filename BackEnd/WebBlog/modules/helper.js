// install file system 
import { rejects } from "assert";
import fs from "fs"
import { resolve } from "path";

//define function which searching in the arr the last id and increnebt of 1 to return new id
const getNewId = (arr) => {
    if(arr.length > 0)
    {
        return arr[arr.length -1].id + 1;
    }
    else 
    {
        return 1;
    }
}

//return the date of your server in ISO 8601.
const newDate = () => new Date().toString();

//checker if a row exist via the id
function checkById(arr, id)
{
    return Promise((resolve, reject) =>{
        const row = arr.find(r => r.id === id);

        if(!row)
        {
            reject({
                message: 'ID is not good',
                status: 404
            });
        }
        resolve(row);
    });
};

//write new arr in the JSON File data
function writeJSONFile(fileName, content){

    fs.writeFileSync(fileName, JSON.stringify(content), 'utf8', (err) =>{

        if(err)
        {
            console.log(err);
        }
    });
}

module.exports = {
    getNewId,
    newDate,
    checkById,
    writeJSONFile
}