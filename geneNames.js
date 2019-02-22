var fs = require('fs');
var jf = require('jsonfile');

function getData(){
  jf.readFile('./genes.json', function(err, obj) {
    // console.log(obj);
    var arr = [];
    obj.map(x=>{
      arr.push(x.gene_name);
    })
    console.log(arr);
    fs.writeFile('./knowGenes.txt', JSON.stringify(arr) , 'utf-8');
  });
}


getData();
