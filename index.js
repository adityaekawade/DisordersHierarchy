var fs = require('fs');
const csvFilePath = './disorders.csv'
const csv = require('csvtojson')
var jf = require('jsonfile');
const axios = require('axios');
const x2js = require('x2js');
var x2js1 = new x2js();
var parseString = require('xml2js').parseString;

var disorderNames = [];
var disordersArr = [];

var content = [];
var modesData = [];

function getData(){
  jf.readFile('./disordersdata.json', function(err, obj) {
    content = obj.data;
    loadModesData();
  });
}

function loadModesData(){
  jf.readFile('./a.json', function(err, obj) {
    modesData = obj;
    processFile();
  });
}

function processFile(){
  jf.readFile('./DiseaseNames.json', function(err, obj) {
    disorderNames = obj.data;
    processDisorder();
  });

}

var parentArr = [];

var conceptIdArr = [];
var diseaseNameArr = [];

var conceptMetaIds = [];

function processDisorder(){
  modesData.map(x=>{
    conceptMetaIds.push(x.id)
  })

  // console.log("conceptMetaIds ", conceptMetaIds.length)

  content.map(x=>{
    parentArr.push(x.CUI1);
  });

  disorderNames.map(x=>{
    conceptIdArr.push(x.ConceptID);
    diseaseNameArr.push(x.DiseaseName);
  })


  var uniqueParentArr = Array.from(new Set(parentArr));
  console.log("uniqueParentArr", uniqueParentArr)
  fs.writeFile('./uniqueParentIds.txt', JSON.stringify(uniqueParentArr) , 'utf-8');
  // console.log(uniqueParentArr.indexOf("C0242387"))
  organizeData(uniqueParentArr);
}


function organizeData(uniqueParentArr){
  // console.log(uniqueParentArr.length)
  var organizedArr = [];
  var obj = {};
  content.map(x=>{
    if(obj[x.CUI1]===undefined){
      organizedArr.push({
        parentId:x.CUI1,
        children: [
          {
            id:x.CUI2,
            name: getName(x.CUI2),
            ConceptMeta: {
              ModesOfInheritance: {
                ModeOfInheritance: getConceptMeta(x.CUI2)
              }
            }
            // ConceptMeta: getConceptMeta(x.CUI2),
          }
        ]
      });
      obj[x.CUI1] = 1;
    }
    else {
      var i = uniqueParentArr.indexOf(x.CUI1);
      organizedArr[i].children.push(
        {
          id:x.CUI2,
          name: getName(x.CUI2),
          ConceptMeta: {
            ModesOfInheritance: {
              ModeOfInheritance: getConceptMeta(x.CUI2)
            }
          }
          // ConceptMeta: getConceptMeta(x.CUI2),
        }
      )
    }
  });
  // fs.writeFile('./b.json', JSON.stringify(organizedArr) , 'utf-8');
}


function getName(item){
  var i = conceptIdArr.indexOf(item);
  return diseaseNameArr[i];
}

function getConceptMeta(item){
  var i = conceptMetaIds.indexOf(item);
  return modesData[i].MetaData;
}

getData();
// var arr = [];
// csv()
// .fromFile(csvFilePath)
// .then((jsonObj)=>{
//     arr = jsonObj
// })
//
// console.log(arr[0])

// var content = [];
//
// function readJsonFile(){
//   fs.readFile('./disordersdata.json', 'utf8', function(err, dataobj){
//   })
// }
//
// readJsonFile();
