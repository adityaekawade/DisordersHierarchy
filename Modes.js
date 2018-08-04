var jQuery = require('jquery');
global.jQuery = jQuery;
global.$ = jQuery;
var request = require('ajax-request');
var fs = require('fs');
const csvFilePath = './disorders.csv'
const csv = require('csvtojson')
var jf = require('jsonfile');


const axios = require('axios');
const x2js = require('x2js');
var x2js1 = new x2js();
var parseString = require('xml2js').parseString;

var conceptMetaData = [];

function getConceptMeta(concept){
  // var concept = "C0242387";
  var searchUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=medgen"
                  + '&usehistory=y&retmode=json'
                  + '&term='
                  + '(((' + concept +'[ConceptId]) AND "in gtr"[Filter])) AND (("conditions"[Filter] OR "diseases"[Filter]))';

  // request('searchUrl', function(err, res, body) {});
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
            // console.log(result.eSummaryResult.DocumentSummarySet[0].DocumentSummary[0].ConceptMeta[0].ModesOfInheritance[0].ModeOfInheritance)
              // console.log( result.eSummaryResult.DocumentSummarySet[0].DocumentSummary[0].ConceptMeta[0]);
              var modesArr = result.eSummaryResult.DocumentSummarySet[0].DocumentSummary[0].ConceptMeta[0].ModesOfInheritance[0].ModeOfInheritance;
              var modeNames = [];
              if(modesArr !== undefined){
                modesArr.map(x=>{
                  modeNames.push({
                    Name: x.Name[0]
                  })
                })
              }
              else if(modesArr===undefined){
                console.log("undefined", concept)
                modeNames.push({
                  Name: "",
                })
              }


              // modesArr.map(x=>{
              //   modeNames.push(x.Name[0])
              // })
              // console.log(modeNames)
              // console.log(modesArr)
              // return result.eSummaryResult.DocumentSummarySet[0].DocumentSummary[0].ConceptMeta[0];

              conceptMetaData.push({
                id: concept,
                MetaData: modeNames
                // MetaData: result.eSummaryResult.DocumentSummarySet[0].DocumentSummary[0].ConceptMeta[0].ModesOfInheritance[0].ModeOfInheritance
                // MetaData: result.eSummaryResult.DocumentSummarySet[0].DocumentSummary[0].ConceptMeta[0].ModesOfInheritance
              })
              callAfterAsync();
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
var x;
var counter = 0;
function callAfterAsync(){
  // console.log(conceptMetaData);
  counter ++
  x = conceptMetaData;
  printX(x);
}

function printX(xdata){
  if(counter===2){
    console.log(xdata);
    fs.writeFile('./ModeOfInheritanceData8.json', JSON.stringify(xdata) , 'utf-8');
  }

}

var conceptIdArr = [];
var diseaseNameArr = [];
var childrenConceptIds = [];
var uniqueChildrenConceptIds = [];

function getData(){
  jf.readFile('./disordersdata.json', function(err, obj) {
    content = obj.data;
    processFile();
  });
}

function processFile(){
  content.map(x=>{
    childrenConceptIds.push(x.CUI2);
  })
  uniqueChildrenConceptIds = Array.from(new Set(childrenConceptIds));
  console.log(uniqueChildrenConceptIds[uniqueChildrenConceptIds.length-1])
  var SlicedArr = uniqueChildrenConceptIds.slice(1847, 1850)
  console.log(SlicedArr.length)
  // console.log(SlicedArr)
  var counter = 0;
  var interval = setInterval(function(){
    if(counter<SlicedArr.length){
      console.log("counter: ", counter , " -- " , SlicedArr[counter]);
      // getConceptMeta(SlicedArr[counter]);
      counter++
    }
    else {
      clearInterval(interval);
    }
  }, 1500)

    // SlicedArr.map(x=>{
    //   getConceptMeta(x);
    // })

}



// var ids = ["C183030433" , "C31300983", "C0242387"];
// ids.map(x=>{
//   getConceptMeta(x);
// })

getData();

// var ids = ["C183030433" , "C31300983", "C0242387"];
// ids.map(x=>{
//   var y = getConceptMeta(x);
//   conceptMetaData.push({
//     id: x,
//     MetaData: y
//   })
// })
// console.log(conceptMetaData);
