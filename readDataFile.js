var fs = require('fs');

fs.readFile('./disorders.csv', 'utf8', function(err, data){
  console.log(data)
})
