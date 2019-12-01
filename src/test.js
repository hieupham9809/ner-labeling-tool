'use strict';

const fs = require('fs');
var corpuses;
fs.readFile('test_labeled.json', (err, data) => {
    if (err) throw err;
    corpuses = JSON.parse(data);

    corpuses.forEach(corpus=>{
        if (corpus.tags){
        let label=''

        // console.log(corpus.tags);
        Object.keys(corpus.tags).forEach(key=>{
            // console.log(`${key} : ${corpus.tags[key].end}`);
            if (corpus.message.substring(parseInt(key),corpus.tags[key].end).split(' ')!=['',''])
            {
                let label_type=corpus.tags[key].type
                let list_splited=corpus.message.substring(parseInt(key),corpus.tags[key].end).split(' ')
                for( let i = 0; i < list_splited.length; i++){ 
                    if ( list_splited[i] === '') {
                        list_splited.splice(i, 1); 
                      i--;
                    }
                 }

                let label_length=list_splited.length            
                    // let index=0;
                    for (let index=0;index<label_length;index++)
                    {
                        if (label_type!='normal'){
                            if (index==0){
                                label+='B-'+label_type+' '
                            }
                            else{
                                label+='I-'+label_type+' '
                            }
                        }
                        else{
                            label+='O '
                        }
                    }
                
            }
         });
        label=label.substring(0,label.length-1)
        console.log('-------------------------------message length')
        console.log(corpus.message.split(' ').length)
        console.log('-------------------------------label length')
        console.log(label.split(' ').length)
        corpus['label']=label
        }
    })
    // console.log(corpuses)

     
    // console.log(corpus.message.substring(115,130))
});

console.log('This is after the read call');

console.log(JSON.stringify(corpuses))
var resultJsonString=''
for (var index=0;index<corpuses.length;index++)
{
    resultJsonString+=JSON.stringify(corpuses[index])
}

fs.writeFile("./test_labeled_convert.json", JSON.stringify(resultJsonString), (err) => {
    if (err) {
        console.error(err);
        return;
    };
    console.log("File has been created");
});

// function pairStartEnd(string,substring){
//     let startIndex = string.indexOf(substring);
//     // console.log(startIndex)
//     let endIndex=startIndex + substring.length + 1
//     return [startIndex,endIndex]
// }
// let [start,end]=pairStartEnd("đi mùa hè xanh là làm đường phải không","đi")

// // return index of tag
// function listIndex(listLabel){
//     var listIndexLabel=[]
//     listIndexLabel.push(0)
//     for (let index=0;index<listLabel.length-1;index++){
//         // console.log(typeof(listLabel[index]))
//         if (listLabel[index].includes('B') && listLabel[index+1].includes('B')&&listLabel[index]!=listLabel[index+1]||listLabel[index].includes('I') && listLabel[index+1].includes('O')||listLabel[index].includes('B') && listLabel[index+1].includes('O')||listLabel[index].includes('O') && listLabel[index+1].includes('B') ||listLabel[index].includes('I') && listLabel[index+1].includes('B'))
//             {
//                 console.log(index)
//                 listIndexLabel.push(index)
//                 if (index!=0 || index!=listLabel.length-1)
//                     listIndexLabel.push(index+1)
//             }
//     }
//     listIndexLabel.push(listLabel.length-1)
//     // remove duplicate
//     // listIndexLabel=Array.from(new Set(listIndexLabel))
//     return listIndexLabel
// }

// console.log(listIndex('O B-name_activity I-name_activity I-name_activity O B-works I-works O O'.split(' ')))


function parseTags(listToken,listLabel){
    let corpusPointer=0;
    let prev=null
    let tags={}
    if (listLabel[0]!='O')
        {
            console.log(`begin_pointer ${corpusPointer} of label ${listLabel[0].slice(2,listLabel[0].length)}`)
            console.log(`previous pointer ${prev} of label ${listLabel[0].slice(2,listLabel[0].length)}`)
            tags[corpusPointer.toString()]={}
            tags[corpusPointer.toString()]['prev']=prev
            tags[corpusPointer.toString()]['type']=listLabel[0].slice(2,listLabel[0].length)
            prev=corpusPointer
        }
    else
        {
            console.log(`begin_pointer ${corpusPointer} of label normal`)
            console.log(`previous pointer ${prev} of label normal`)
            tags[corpusPointer.toString()]={}
            tags[corpusPointer.toString()]['prev']=prev
            tags[corpusPointer.toString()]['type']='normal'
            prev=corpusPointer
        }

    
    for (let index=0;index<listToken.length-1;index++)
    {

        if (index==0)
            corpusPointer+=listToken[index].length //begin of corpus 
        else
            corpusPointer+=listToken[index].length+1 //middle/end of corpus
        if (listLabel[index].includes('B') && listLabel[index+1].includes('B')&&listLabel[index]!=listLabel[index+1]||listLabel[index].includes('I') && listLabel[index+1].includes('B'))
            {
                
                console.log(`end_pointer ${corpusPointer} of label ${listLabel[index].slice(2,listLabel[index].length)}`)
                tags[prev.toString()]['end']=corpusPointer
                tags[prev.toString()]['type']=listLabel[index].slice(2,listLabel[index].length)

                console.log(`begin_pointer ${corpusPointer} of label normal`)
                console.log(`end_pointer ${corpusPointer+1} of label normal`)
                console.log(`previous_pointer ${prev} of label normal`)
                tags[corpusPointer.toString()]={}
                tags[corpusPointer.toString()]['end']=corpusPointer+1
                tags[corpusPointer.toString()]['type']='normal'
                tags[corpusPointer.toString()]['end']=corpusPointer+1
                tags[corpusPointer.toString()]['prev']=prev


                console.log(`begin_pointer ${corpusPointer+1} of label ${listLabel[index+1].slice(2,listLabel[index+1].length)}`)
                console.log(`previous_pointer ${corpusPointer} of label ${listLabel[index+1].slice(2,listLabel[index+1].length)}`)
                tags[(corpusPointer+1).toString()]={}
                tags[(corpusPointer+1).toString()]['type']=listLabel[index+1].slice(2,listLabel[index+1].length)
                tags[(corpusPointer+1).toString()]['prev']=corpusPointer

                prev=corpusPointer+1
            }
        if (listLabel[index].includes('O') && listLabel[index+1].includes('B'))
            {
                console.log(`end_pointer ${corpusPointer+1} of label normal`)
                tags[prev.toString()]['end']=corpusPointer+1


                console.log(`begin_pointer ${corpusPointer+1} of label ${listLabel[index+1].slice(2,listLabel[index+1].length)}`)
                console.log(`previous_pointer ${prev} of label ${listLabel[index+1].slice(2,listLabel[index+1].length)}`)
                tags[(corpusPointer+1).toString()]={}
                tags[(corpusPointer+1).toString()]['type']=listLabel[index+1].slice(2,listLabel[index+1].length)
                tags[(corpusPointer+1).toString()]['prev']=prev
                prev=corpusPointer+1
            }
        if (listLabel[index].includes('I') && listLabel[index+1].includes('O')||listLabel[index].includes('B') && listLabel[index+1].includes('O'))
            {
                console.log(`end_pointer ${corpusPointer} of label ${listLabel[index].slice(2,listLabel[index].length)}`) 
                tags[prev.toString()]['end']=corpusPointer
                tags[prev.toString()]['type']=listLabel[index].slice(2,listLabel[index].length)


                console.log(`begin_pointer ${corpusPointer} of label normal`)
                console.log(`previous_pointer ${prev} of label normal`)
                tags[corpusPointer.toString()]={}
                tags[corpusPointer.toString()]['prev']=prev
                tags[corpusPointer.toString()]['type']='normal'
                prev=corpusPointer
            }
    }
    // console.log(listToken[listToken.length-1])
    corpusPointer+=listToken[listToken.length-1].length
    if (listLabel[listToken.length-1].includes('O'))
        {
            console.log(`end_pointer ${corpusPointer+1} of label normal`)
            tags[prev.toString()]['end']=corpusPointer+1
            tags[prev.toString()]['type']='normal'
            // console.log(`previous_pointer ${prev} of label normal`)
        }
    else
        {
            console.log(`end_pointer ${corpusPointer+1} of label ${listLabel[index].slice(2,listLabel[index].length)}`)
            tags[prev.toString()]['end']=corpusPointer+1
            tags[prev.toString()]['type']=listLabel[index].slice(2,listLabel[index].length)
            // console.log(`previous_pointer ${prev} of label ${listLabel[index].slice(2,listLabel[index].length)}`)
        }
    return tags    
}




var tagsResult=parseTags(['đi', 'mùa', 'hè', 'xanh', 'làm', 'đường', '\n', 'không'],['O', 'B-name_activity', 'I-name_activity', 'I-name_activity', 'B-works', 'I-works', 'O', 'O'])

// var corpus="\nKí túc xá nay vắng quá, đang muốn tìm ai đó cùng đi ăn chè A2 , ăn bữa cơm G4, tô bún riêu A11, bánh tráng trộn A1, kem xôi A9 rồi qua AH2 ngồi net để mai chia tay Dĩ An\n️️️ Sắp lên Sài Gòn rồi, chuẩn bị hoà vào cuộc sống vội vã tập nập của thành phố và ngập đầu trong deadline đồ án"
// console.log(corpus.substring(1,3))
console.log(tagsResult)