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

function getData(){
  jf.readFile('./disordersdata.json', function(err, obj) {
    content = obj.data;
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


function processDisorder(){
  content.map(x=>{
    parentArr.push(x.CUI1);
  });

  disorderNames.map(x=>{
    conceptIdArr.push(x.ConceptID);
    diseaseNameArr.push(x.DiseaseName);
  })


  var uniqueParentArr = Array.from(new Set(parentArr));
  console.log(uniqueParentArr.indexOf("C0242387"))
  organizeData(uniqueParentArr);
}


function organizeData(uniqueParentArr){
  // console.log(uniqueParentArr.length)
  var organizedArr = [];
  var obj = {};
  content.map(x=>{
    if(obj[x.CUI1]===undefined){
      organizedArr.push({
        id:x.CUI1,
        children: [
          {
            id:x.CUI2,
            name: getName(x.CUI2),
            ConceptMeta: getConceptMeta(x.CUI2),
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
          ConceptMeta: getConceptMeta(x.CUI2),
        }
      )
    }
  });
  console.log(organizedArr[124])
}


function getName(item){
  var i = conceptIdArr.indexOf(item);
  return diseaseNameArr[i];
}

function getConceptMeta(concept){
  var searchUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=medgen"
                  + '&usehistory=y&retmode=json'
                  + '&term='
                  + '(((' + concept +'[ConceptId]) AND "in gtr"[Filter])) AND (("conditions"[Filter] OR "diseases"[Filter]))';

  var parser, xmlDoc;

  axios.get(searchUrl)
    .then(function (response) {
      // console.log(response.data.esearchresult.idlist[0]);
      var id = response.data.esearchresult.idlist[0];
      var url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=medgen&id=${id}`;
      axios.get(url)
        .then(function(res){
          var xml = res.data;
          parseString(xml, function (err, result) {
              // console.log( result.eSummaryResult.DocumentSummarySet[0].DocumentSummary[0].ConceptMeta[0]);
              var conceptMeta =  result.eSummaryResult.DocumentSummarySet[0].DocumentSummary[0].ConceptMeta[0];
              return conceptMeta;
          });

        })
        .catch(function(err){
          console.log(err);
        })
    })
    .catch(function (error) {
      console.log(error);
    });
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
