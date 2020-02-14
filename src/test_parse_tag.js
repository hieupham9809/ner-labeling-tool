function parseTags(listToken,listLabel){
    let corpusPointer=0;
    let prev=null
    let tags={}
    if (listLabel[0]!='O')
        {
            // console.log(`begin_pointer ${corpusPointer} of label ${listLabel[0].slice(2,listLabel[0].length)}`)
            // console.log(`previous pointer ${prev} of label ${listLabel[0].slice(2,listLabel[0].length)}`)
            tags[corpusPointer.toString()]={}
            tags[corpusPointer.toString()]['prev']=prev
            tags[corpusPointer.toString()]['type']=listLabel[0].slice(2,listLabel[0].length)
            prev=corpusPointer
        }
    else
        {
            // console.log(`begin_pointer ${corpusPointer} of label normal`)
            // console.log(`previous pointer ${prev} of label normal`)
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
                
                // console.log(`end_pointer ${corpusPointer} of label ${listLabel[index].slice(2,listLabel[index].length)}`)
                tags[prev.toString()]['end']=corpusPointer
                tags[prev.toString()]['type']=listLabel[index].slice(2,listLabel[index].length)

                // console.log(`begin_pointer ${corpusPointer} of label normal`)
                // console.log(`end_pointer ${corpusPointer+1} of label normal`)
                // console.log(`previous_pointer ${prev} of label normal`)
                tags[corpusPointer.toString()]={}
                tags[corpusPointer.toString()]['end']=corpusPointer+1
                tags[corpusPointer.toString()]['type']='normal'
                tags[corpusPointer.toString()]['end']=corpusPointer+1
                tags[corpusPointer.toString()]['prev']=prev


                // console.log(`begin_pointer ${corpusPointer+1} of label ${listLabel[index+1].slice(2,listLabel[index+1].length)}`)
                // console.log(`previous_pointer ${corpusPointer} of label ${listLabel[index+1].slice(2,listLabel[index+1].length)}`)
                tags[(corpusPointer+1).toString()]={}
                tags[(corpusPointer+1).toString()]['type']=listLabel[index+1].slice(2,listLabel[index+1].length)
                tags[(corpusPointer+1).toString()]['prev']=corpusPointer

                prev=corpusPointer+1
            }
        if (listLabel[index].includes('O') && listLabel[index+1].includes('B'))
            {
                // console.log(`end_pointer ${corpusPointer+1} of label normal`)
                tags[prev.toString()]['end']=corpusPointer+1



                // console.log(`begin_pointer ${corpusPointer+1} of label ${listLabel[index+1].slice(2,listLabel[index+1].length)}`)
                // console.log(`previous_pointer ${prev} of label ${listLabel[index+1].slice(2,listLabel[index+1].length)}`)
                tags[(corpusPointer+1).toString()]={}
                tags[(corpusPointer+1).toString()]['type']=listLabel[index+1].slice(2,listLabel[index+1].length)
                tags[(corpusPointer+1).toString()]['prev']=prev
                prev=corpusPointer+1
            }
        if (listLabel[index].includes('I') && listLabel[index+1].includes('O')||listLabel[index].includes('B') && listLabel[index+1].includes('O'))
            {
                // console.log(`end_pointer ${corpusPointer} of label ${listLabel[index].slice(2,listLabel[index].length)}`) 
                tags[prev.toString()]['end']=corpusPointer
                tags[prev.toString()]['type']=listLabel[index].slice(2,listLabel[index].length)


                // console.log(`begin_pointer ${corpusPointer} of label normal`)
                // console.log(`previous_pointer ${prev} of label normal`)
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
            console.log(`end_pointer ${corpusPointer+1} of label ${listLabel[listToken.length-1].slice(2,listLabel[listToken.length-1].length)}`)
            tags[prev.toString()]['end']=corpusPointer+1
            tags[prev.toString()]['type']=listLabel[listToken.length-1].slice(2,listLabel[listToken.length-1].length)
            // console.log(`previous_pointer ${prev} of label ${listLabel[index].slice(2,listLabel[index].length)}`)
        }
    return tags    
  }
var listToken=["o0o", "thông", "báo", "o0o", "↵", "v/v", ":", "tập", "huấn", "chiến", "sĩ", "tiếp", "sức", "mùa", "thi", "2013", ".", "↵", "thời", "gian", ":", "chủ", "nhật", ",", "ngày", "9", "tháng", "6", "năm", "2013", ".", "↵", "sáng", ":", "7h30", "đến", "10h30", "↵", "chiều", ":", "13h30", "đến", "16h30", ".", "↵", "địa", "điểm", ":", "hội", "trường", "e4", ".", "↵", "thành", "phần", "tham", "dự", ":", "tất", "cả", "những", "bạn", "đã", "nộp", "đơn", "đăng", "ký", "tsmt", "2013", "."]
var listLabel=["O", "O", "O", "O", "O", "O", "O", "B-type_activity", "I-type_activity", "B-type_activity", "I-type_activity", "B-name_activity", "I-name_activity", "I-name_activity", "I-name_activity", "I-name_activity", "O", "O", "O", "O", "B-time", "I-time", "I-time", "I-time", "I-time", "I-time", "I-time", "I-time", "I-time", "I-time", "I-time", "I-time", "I-time", "I-time", "I-time", "I-time", "I-time", "I-time", "I-time", "I-time", "I-time", "I-time", "I-time", "I-time", "I-time", "O", "O", "O", "B-name_place", "I-name_place", "I-name_place", "I-name_place", "I-name_place", "I-name_place", "O", "O", "O", "O", "O", "O", "B-joiner", "I-joiner", "I-joiner", "I-joiner", "I-joiner", "I-joiner", "I-joiner", "I-joiner", "I-joiner", "O"]
console.log(listToken.length)
console.log(listLabel.length)
console.log(parseTags(listToken,listLabel))