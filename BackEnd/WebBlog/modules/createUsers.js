import fs from "fs";

function UserAdd(req, res){

    //read the data from json file
    let dataExp = fs.readFileSync('./data.json', 'utf8');

    if(!dataExp)
    {
        console.log('no data availiable');
        let data = {};
        data.users = [];

        let newUserName = req.body.name;
        let newUserEmail = req.body.email;
        let newUserId = 100 ;

        let newUser = {
            name: newUserName,
            email: newUserEmail,
            id: newUserId
          };

        data.users.push(newUser);

        dataToFile = JSON.stringify(data);

        fs.writeFile('./data.json', dataToFile, function(err) {
        if (err) throw err;
        console.log('Intial User created');
        });

    } else {
      // As we have seen we store a JSON string in the data file. So when we read the file and store the data into the variable dataExp we have JSON string data in that variable.
      //  To process these data in our JavaScript code we must parse this JSON so that a JavaScript object is created from the JSON string.
      //  This is what we do with the JSON.parse() function.
      
      let data = JSON.parse(dataExp);

      if(!data.users) {
        console.log('no users are available')
        data.users = []

        let newUserName = req.body.name;
        let newUserEmail = req.body.email;
        let newUserId = 100;

        let newUser = {
          name: newUserName,
          email: newUserEmail,
          id: newUserId
        }

      data.users.push(newUser);

      // With JSON.stringify() we take the JavaScript data object, create a JSON string out of it and store this string into the dataToFile variable.
      //  With fs.writeFile we write the json string into the so far empty data.json file.
      // note: If you use JavaScript to develop applications, JavaScript objects have to be converted into strings if the data is to be stored in a database or a data file.
      //  The same applies if you want to send data to an API or to a webserver. 
      // The JSON.stringify() function does this for us.

      dataToFile = JSON.stringify(data);

        fs.writeFile('./data.json', dataToFile, function(err) {
          if (err) throw err;
          console.log('Intial User created');
          });

      } else {
        console.log('users are available');
        var newID;
        var minID = data.users[0].id;

        for (i = 0; i < data.users.length; i++) {
          if (data.users[i].id >= minID) {
              newID = data.users[i].id + 100;
          }
        }

        let newUserName = req.body.name;
        let newUserEmail = req.body.email;
        let newUserId = newID;

        let newUser = {
          name: newUserName,
          email: newUserEmail,
          id: newUserId
        }

      data.users.push(newUser);

      dataToFile = JSON.stringify(data);

      fs.writeFile('./data.json', dataToFile, function(err) {
        if (err) throw err;
        console.log('User added');
        });
      };
  };
};

module.exports = usersAdd();