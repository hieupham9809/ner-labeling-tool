import React, { Component } from 'react';
import './App.css';
import TextArea from './TextArea';
import { download } from './utils';
import categories from './categories.json';
import { PREDICT_API } from './constants';
import LabelMap from './LabelMap';
import axios from 'axios';

const fs = require('fs');
class App extends Component {
  constructor() {
    super();
    categories.normal = {
      color: '#FFFFFF',
      shortcut: ' ',
    };
    this.state = {
      idx: -1,
      jumpValue:-1,
      predictState:[]
    };
    // var data = require('./test.json');
    // this.state = {

    //   data,
    //   name: "test",
    //   idx: 0,
    //   runs: data.map(x => x.tags),
    // };
  }

  onChangeJumpValue(event) {
    console.log("----------------------------------jump value")
    console.log(typeof event.target.value)
    this.setState({
        jumpValue:parseInt(event.target.value)-1
    });

}

  handleFileSelect = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    const newLocal = this;
    reader.onload = (ev) => {
      const data = JSON.parse(ev.target.result);
      var predict = [];
      for (var i = 0; i < data.length; i++){
        predict.push({
          isPredicting : false,
          isFail : false
        });
      };


      newLocal.setState({
        data,
        name: file.name,
        idx: 0,
        runs: data.map(x => x.tags),
        recheck:false,
        predictState : predict
      });
    };
    if (file) {
      reader.readAsText(file);
    }
  }
  replaceAll(str, find, replace){
    return str.replace(new RegExp(find, 'g'), replace);
  }

  removeA(list,value) {
      // var what, a = arguments, L = a.length, ax;
      // while (L > 1 && arr.length) {
      //     what = a[--L];
      //     while ((ax= arr.indexOf(what)) !== -1) {
      //         arr.splice(ax, 1);
      //     }
      // }
      // return arr;
      var result=[]
      for (let index=0;index<list.length;index++)
      {
        if (list[index]!=value && list[index]!="️️️")
        {
          // console.log("------------------------length special")
          // console.log("️️️".length)
          result.push(list[index])
        }
      }
      return result
  }

  parseTags(listToken,listLabel){
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
  
  predict = () => {
    // console.log("abc")
    const {
      idx, data, runs,
    } = this.state;
    const newLocal = this;

    // //LOAD AND CHANGE 
    // var corpusesConvert=require('/home/lap11305/LVTN/ner-labeling-tool/src/test_predicted_convert.json')
    // var resultJsonStringConvert=''
    let listLabel;
    let listToken;
    let newTags;
    let contentAfter;
    // for (let index=0;index<corpusesConvert.length;index++)
    // {
      
    //     if(index==idx){
          
    //       listLabel=corpusesConvert[index].label
    //       listToken=corpusesConvert[index].token
    //       newTags=this.parseTags(listToken,listLabel)
    //       corpusesConvert[index]['tags']=newTags
    //       corpusesConvert[index]['message']=listToken.join(' ')
    //     }
    
    // }




    contentAfter = this.replaceAll(data[idx].message,"\n", " \n ")
    listToken = this.removeA(contentAfter.split(' '),'')
    let newMessage=listToken.join(' ')
    var predictStateList = newLocal.state['predictState'];
    
    predictStateList[idx].isPredicting = true;
    predictStateList[idx].isFail = false;

    newLocal.setState({
      predictState: predictStateList
      
    });

    
    axios.post(PREDICT_API[[Math.floor(Math.random() * PREDICT_API.length)]],{
      items:[{content:newMessage,
      id:"1"}]
    }).then((res) => {
      // console.log(res)
      listLabel=res.data.results[0].tags
      // contentAfter = this.replaceAll(data[idx].message,"\n", " \n ")
      // listToken = this.removeA(contentAfter.split(' '),'')
      // listToken=data[idx].message.split(" ")
      newTags=this.parseTags(listToken,listLabel)
      // console.log(data[idx].content)
      data[idx].message = newMessage
      runs[idx] = newTags
      newLocal.setState({ data, runs });
      predictStateList[idx].isPredicting = false;
      predictStateList[idx].isFail = false;

      newLocal.setState({
        predictState: predictStateList
        
      });
      
      // console.log(data[idx].content);
      // console.log(runs[idx]);
    }, (error)=> {
      predictStateList[idx].isPredicting = false;
      predictStateList[idx].isFail = true;

      newLocal.setState({
        predictState: predictStateList
        
      });
      
    });


      
      // console.log(data[idx].content)
      // let runs=[];
      // for (let index=0;index<corpusesConvert.length;index++)
      // { 
      //   runs.push(newTags)
      // }

      // runs[idx]=newTags
      // data[idx].message = corpusesConvert[idx].message;
      // newLocal.setState({ data, runs });

      // console.log(data[idx].content);
      // console.log(runs[idx]);
    }

  combineChunk = (chunks) => {
    const content = chunks.map(i => i[0]).join(' ');
    // console.log(chunks)
    const runs = {};
    let s = 0;
    let p = null;
    chunks.forEach((chunk, idx) => {
      runs[s] = {
        type: chunk[1],
        end: s + chunk[0].length,
        prev: p,
      };
      p = s;
      s += chunk[0].length;
      if (idx < chunks.length - 1) {
        runs[s] = {
          type: 'normal',
          end: s + 1,
          prev: p,
        };
        p = s;
        s += 1;
      }
    });
    s = 0;
    while (runs[s]) {
      const next = runs[runs[s].end];
      if (next && next.type === runs[s].type) {
        const nextNext = runs[next.end];
        const temp = runs[s].end;
        runs[s].end = next.end;
        if (nextNext) {
          nextNext.prev = s;
        }
        delete runs[temp];
      } else {
        s = runs[s].end;
      }
    }
    return { content, runs };
  }

  saveRuns(idx) {
    const { runs } = this.state;
    const newLocal = this;
    return (r) => {
      runs[idx] = r;
      newLocal.setState({ runs });
    };
  }
  saveAll = ()  => {
    var resultJsonString=''
    const { data, runs, name } = this.state;
    // console.log(data)
    const list = data.map((x, i) => ({ ...data[i], tags: runs[i] }));
    // console.log(list)
    list.forEach(corpus=>{
        if (corpus.tags){
        let label=''
        let contentList=[]
    
        // console.log(corpus.tags);
        Object.keys(corpus.tags).forEach(key=>{
            // console.log(`${key} : ${corpus.tags[key].end}`);
            if (corpus.message.substring(parseInt(key),corpus.tags[key].end).split(' ')!=['',''])
            {
                let label_type=corpus.tags[key].type
                let list_splited_1 = this.replaceAll(corpus.message.substring(parseInt(key),corpus.tags[key].end),"\n", " \n ")
                console.log("---------------------------before")
                console.log(list_splited_1.split(' '))
                let list_splited = this.removeA(list_splited_1.split(' '),'')
                console.log("---------------------------after")
                console.log(list_splited)
                // let list_splited=corpus.message.substring(parseInt(key),corpus.tags[key].end).split(' ')
                // for( let i = 0; i < list_splited.length; i++){ 
                //     if ( list_splited[i] === '') {
                //         list_splited.splice(i, 1); 
                //         i--;
                //     }
                // }
    
                let label_length=list_splited.length            
                    // let index=0;
                    var isBegin = true;
                    for (let index=0;index<label_length;index++)
                    {
                        if (label_type!='normal' && list_splited[index]!='\n'){
                            if (index==0){
                                label+='B-'+label_type+' ';
                                isBegin = false;
                            }
                            else{
                                if (isBegin){
                                  label+='B-'+label_type+' ';
                                  isBegin = false;

                                } else {
                                  label+='I-'+label_type+' ';

                                }
                            }
                        }
                        else{
                            label+='O ';
                            isBegin = true;
                        }
                    }
    
                contentList=contentList.concat(list_splited)
            }
            });
        
        label=label.substring(0,label.length-1)
        // console.log('-------------------------------message length')
        // console.log(corpus.message.split(' ').length)
        // console.log('-------------------------------label length')
        // console.log(label.split(' ').length)
        corpus['label']=label.split(' ')
        corpus['token']=contentList
        // console.log(contentList)
        // console.log(corpus)
        
        }
        resultJsonString+=JSON.stringify(corpus)+','
        // console.log(resultJsonString)

    })
    // console.log(resultJsonString)

    resultJsonString='['+resultJsonString.substring(0,resultJsonString.length-1)+']'
    
    // console.log('This is after the read call');
    // console.log(resultJsonString)
  
    download(resultJsonString, name, 'application/json');
  };

  loadTable = (numColumn, listToken, listLabel) => {
    if (!listToken || !listLabel || listToken.length != listLabel.length){
      this.setState({recheck:false});
      alert("listToken length different with listLabel length or one of them is null");

      return;
    }
    // var index = 0;
    var listTable = [];
    for (var i = 0 ; i < Math.ceil(listToken.length / numColumn); i++){
      var splitListToken = []
      var splitListLabel = []
      var splitTemp = []
      for (var j = numColumn * i; j < numColumn * (i + 1) && j < listToken.length; j++){
        splitListToken.push(listToken[j]);
        splitTemp.push(listLabel[j]);
      }

      splitListLabel.push(splitTemp);
      listTable.push(<LabelMap headings={splitListToken} rows={splitListLabel}/>)
    }
    return (
      listTable
    )
  };

  render() {
    const {
      idx, data, runs, name,recheck,
    } = this.state;
    var predictStateList = this.state['predictState'];

    const rows =
      [
        'Red and black plaid scarf with thin red stripes and thick black stripes',
        124689325,
        28,
        '$35.00',
        '$60.00',
        12,
        '$720.00',
        '$300.00',
        'bla bla bla',
        'Nope'
      ];
    return (
      
      <div className="App container">
       
        {/* <input type="file" id="file" onChange={this.handleFileSelect} /> */}
        <div>
          <label className="btn btn-default btn-file" htmlFor="file">
            Browse
            <input
              id="file"
              type="file"
              style={{ display: 'none' }}
              onChange={this.handleFileSelect}
            />
          </label>
          
          <span>{name && name !== '' ? name : 'Choose file'}</span>
        </div>
        {data && [
          <span key="current-file">{`Current file: ${idx + 1}/${data.length}`}</span>,
          <button
            type="button"
            className="btn btn-default"
            key="previous"
            disabled={idx === 0}
            onClick={() => this.setState({ idx: idx - 1 })}
          >
            Previous
          </button>,
          <button
            type="button"
            className="btn btn-default"
            key="next"
            disabled={idx + 1 === data.length}
            onClick={() => this.setState({ idx: idx + 1 })}
          >
            Next
          </button>,
          <button
            type="button"
            className="btn btn-default"
            key="jump"
            onClick={() => this.setState({ idx: this.state.jumpValue })}
          >
            Jump
          </button>,
          <input type="text" name="jumpindex" onChange={this.onChangeJumpValue.bind(this)}/>,
          <button
            type="button"
            className="btn btn-default"
            key="save"
            onClick={this.saveAll}
          >
            Save
          </button>,
          <button
            type="button"
            className="btn btn-default"
            key="predict"
            disabled={predictStateList[idx].isPredicting}
            onClick={this.predict}
          >
            Predict
          </button>,
          
        ]}
        {predictStateList != undefined && predictStateList.length > 0 
        && predictStateList[idx].isFail && 
        <span
            >
              Request Timeout, please try again!
            </span>
        }
        {idx >= 0 && data && data[idx] ? (
          <TextArea
            key="text-area"
            id={`article-${idx}`}
            text={data[idx].message}
            categories={categories}
            runs={runs[idx]}
            onSaved={this.saveRuns(idx)}
          />
        ) : null}
        {data && [
          <button
            type="button"
            className="btn btn-default"
            key="save"
            onClick={() => {
              if (recheck){
                this.setState({recheck:false});
              } else {
                this.setState({recheck:true});
              }
            }
            }
          >
            For Developer Only
          </button>
        ]}
        {/* {(
          <TextArea
            key="text-area"
            id={`article-${idx}`}
            text={data[idx].message}
            categories={categories}
            runs={runs[idx]}
            onSaved={this.saveRuns(idx)}
          />
        )} */}
        {recheck && [this.loadTable(10,data[idx].token, data[idx].label)]}
        {/* <LabelMap headings={headings} rows={rows} */}
      </div>
    );
  }
  
}

export default App;
