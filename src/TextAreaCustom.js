import React, { Component } from 'react';
import PropTypes from 'prop-types';

import TinyColor from './tinycolor';
import { trimNewLine, getSelectionText, checkParentRelation } from './utils';
import './TextArea.css';
import { PREDICT_API } from './constants';
// import LabelMap from './LabelMap';
import axios from 'axios';
export default class TextAreaCustom extends Component {
  static propTypes = {
    categories: PropTypes.objectOf(PropTypes.shape({
      color: PropTypes.string.isRequired,
      shortcut: PropTypes.string.isRequired,
    })).isRequired,
    runs: PropTypes.objectOf(PropTypes.shape({
      end: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      prev: PropTypes.number,
    })),
    text: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    onSaved: PropTypes.func.isRequired,
  };
  static defaultProps = {
    runs: null,
  };
  constructor(props) {
    super(props);
    const text = props.text
      .split('\n')
      .map(trimNewLine)
      .join('\n');
    this.state = {
      isPredicting: false,
      text:'',
      runs: props.runs
        ? props.runs
        : {
          0: {
            end: text.length,
            type: 'normal',
            prev: null,
          },
        },
    };
  }

  onChangeInputValue(event) {
    console.log("----------------------------------input value")
    console.log(typeof event.target.value)
    
    this.setState({
        text:event.target.value,
        runs:{
          0: {
            end: this.state.text.length,
            type: 'normal',
            prev: null,
          },
        }
    });
    console.log(this.state.text)
}
  // componentWillMount() {
  //   Object.keys(this.props.categories).forEach((x) => {
  //     const listener = this.handleKeyDown(x);
  //     document.addEventListener('keydown', listener);
  //     this.shortcutListener.push(listener);
  //   });
  // }

  componentWillReceiveProps(nextProps) {
    const text = nextProps.text
      .split('\n')
      .map(trimNewLine)
      .join('\n');
    this.setState({
      text,
      runs: nextProps.runs
        ? nextProps.runs
        : {
          0: {
            end: text.length,
            type: 'normal',
            prev: null,
          },
        },
    });
  }

  componentWillUnmount() {
    this.shortcutListener.forEach(listener =>
      document.removeEventListener('keydown', listener));
    this.shortcutListener = [];
  }

  container = null;
  shortcutListener = [];

  // handleKeyDown = name => (e) => {
  //   if (e.key.toLowerCase() === this.props.categories[name].shortcut.toLowerCase()) {
  //     this.handleTextSelected(name);
  //   }
  // };

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
  // createButton = (name, idx) => (
  //   <button
  //     type="button"
  //     className="btn btn-default"
  //     onClick={() => this.handleTextSelected(name)}
  //     key={`${name}-${idx}`}
  //     style={{
  //       backgroundColor: this.props.categories[name].color,
  //       color: TinyColor(this.props.categories[name].color).getBrightness() < 196 ? 'white' : 'black',
  //     }}
  //   >
  //     {`${this.props.categories[name].display_name} (${this.props.categories[name].shortcut})`}
  //   </button>
  // );
  // handleTextSelected = (name) => {
  //   // console.log("--------------------------------------HANDLE TEXTTTTTTTTTTTT")
  //   // console.log(this.container.contains)
  //   const range = getSelectionText();
  //   if (!range) return;
  //   if (!checkParentRelation(this.container, range.commonAncestorContainer)) {
  //     return;
  //   }
  //   const {
  //     startContainer, endContainer, startOffset, endOffset,
  //   } = range;
  //   if (startOffset === endOffset) return;
  //   const startContainerId = startContainer.parentNode.id.split('-');
  //   const endContainerId = endContainer.parentNode.id.split('-');
  //   const startRunIdx = parseInt(startContainerId[0], 10);
  //   const startRunLineOffset = parseInt(startContainerId[1], 10);
  //   const endRunIdx = parseInt(endContainerId[0], 10);
  //   const endRunLineOffset = parseInt(endContainerId[1], 10);
  //   const startIdx = startRunIdx + startRunLineOffset + startOffset;
  //   const endIdx = endRunIdx + endRunLineOffset + endOffset;
  //   // console.log(startIdx, endIdx)
  //   if (!startIdx && !endIdx) return;
  //   const { runs } = this.state;
  //   const old_runs = JSON.parse(JSON.stringify(runs));
  //   // console.log("--------------------------------old runs OUT IF ")
  //   // console.log(old_runs)
  //   // const old_runs=runs
  //   const startRun = runs[startRunIdx];
  //   // console.log('Start Run', startRunIdx)
  //   const endRun = runs[endRunIdx];
  //   const newEndRun = { ...endRun, prev: startIdx };
  //   let i = startRun.end;
  //   while (i && i <= endRunIdx && runs[i]) {
  //     const l = runs[i].end;
  //     delete runs[i];
  //     i = l;
  //   }
  //   startRun.end = startIdx;
  //   if (!runs[endIdx]) {
  //     runs[endIdx] = newEndRun;
  //     if (runs[newEndRun.end]) {
  //       runs[newEndRun.end].prev = endIdx;
  //     }
  //   } else {
  //     runs[endIdx].prev = startIdx;
  //   }
  //   if (!runs[startIdx]) {
  //     runs[startIdx] = {
  //       type: name,
  //       end: endIdx,
  //       prev: startRunIdx,
  //     };
  //   } else {
  //     runs[startIdx].type = name;
  //     runs[startIdx].end = endIdx;
  //   }
  //   i = startIdx;
  //   // console.log('Merge start at', i)
  //   // Merge run before
  //   while (i && runs[i] && runs[i].prev != null) {
  //     const { prev } = runs[i];
  //     // console.log(prev)
  //     if (runs[prev].type === runs[i].type) {
  //       runs[prev].end = runs[i].end;
  //       delete runs[i];
  //       i = prev;
  //     } else break;
  //   }
  //   // Merge run after
  //   // console.log(i)
  //   while (runs[i]) {
  //     const next = runs[i].end;
  //     if (runs[next] && runs[next].type === runs[i].type) {
  //       runs[i].end = runs[next].end;
  //       delete runs[next];
  //     } else if (runs[next]) {
  //       runs[next].prev = i;
  //       break;
  //     } else {
  //       break;
  //     }
  //   }
  //   // console.log("-----------------------------------LIST KEY runs")
  //   // // console.log(runs)
  //   // console.log(Object.keys(runs))
  //   if (!(Object.keys(runs).includes("NaN"))){
      
  //     this.setState({ runs });
  //     this.props.onSaved(runs);
  //   }
  //   else{
  //     // console.log("------------------------runs in IF ")
  //     // console.log(old_runs)
  //     // console.log("<3 in if")
  //     this.setState({ runs: old_runs });
  //     this.props.onSaved(old_runs);
  //     console.log(this.state.runs)
  //   }
    

  // };

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

  predict = () => {
    // console.log("abc")
    let {
      text, runs
    } = this.state;
    // let modify_runs={... runs}
    // const newLocal = this;

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




    contentAfter = this.replaceAll(text,"\n", " \n ")
    listToken = this.removeA(contentAfter.split(' '),'')
    let newMessage=listToken.join(' ')
    // var predictStateList = newLocal.state['predictState'];
    
    // predictStateList[idx].isPredicting = true;
    // predictStateList[idx].isFail = false;

    // newLocal.setState({
    //   predictState: predictStateList
      
    // });

    
    axios.post(PREDICT_API[[Math.floor(Math.random() * PREDICT_API.length)]],{
      items:[{content:newMessage,
      id:"1"}]
    }).then((res) => {
      // console.log(res)
      listLabel=res.data.results[0].tags
      console.log("---------------------------------Before fix label")
      // console.log(listLabel)
      for (let i=0;i<listLabel.length;i++)
      {
        console.log(`Token: ${listToken[i]} Label: ${listLabel[i]}`)
      }
      for (let i=0;i<listLabel.length-1;i++)
      {
        if (i==0&&listLabel[i].includes('I'))
        {
          listLabel[i]='B-'.concat(listLabel[i].slice(2,listLabel[i].length))
        }

        if (listLabel[i].includes('I') && listLabel[i+1].includes('I')&&listLabel[i].slice(2,listLabel[i].length)!=listLabel[i+1].slice(2,listLabel[i+1].length))
        {
          listLabel[i+1]='B-'.concat(listLabel[i+1].slice(2,listLabel[i+1].length))
        }

        if (listLabel[i].includes("O") && listLabel[i+1].includes("I"))
        {
          listLabel[i+1]='B-'.concat(listLabel[i+1].slice(2,listLabel[i+1].length))

        }

        if (listLabel[i].includes("B") && listLabel[i+1].includes("I")&&listLabel[i].slice(2,listLabel[i].length)!=listLabel[i+1].slice(2,listLabel[i+1].length))
        {
          listLabel[i+1]='B-'.concat(listLabel[i+1].slice(2,listLabel[i+1].length))

        }

      }
      console.log("------------------------after fix label")
      for (let i=0;i<listLabel.length;i++)
      {
        console.log(`Token: ${listToken[i]} Label: ${listLabel[i]}`)
      }
      // console.log("-----------------------------list label after")
      // console.log(listLabel)
      // contentAfter = this.replaceAll(data[idx].message,"\n", " \n ")
      // listToken = this.removeA(contentAfter.split(' '),'')
      // listToken=data[idx].message.split(" ")
      // console.log("--------------------------------list token")
      // console.log(listToken)
      newTags=this.parseTags(listToken,listLabel)
      console.log(newTags)
      // console.log(data[idx].content)
      // data[idx].message = newMessage
      runs = newTags
      this.setState({ text:newMessage, runs:runs });
      // predictStateList[idx].isPredicting = false;
      // predictStateList[idx].isFail = false;

      // newLocal.setState({
      //   predictState: predictStateList
        
      // });
      
      // console.log(data[idx].content);
      // console.log(runs[idx]);
    }, (error)=> {
      
      this.setState({
        isPredicting: false
        
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
  render() {
    // console.log("-------------------------------------RENDERRRRRRRRRRR")
    // console.log(this.state.runs)
    const { text, runs } = this.state;
    const newLocal = this;
    let currentRuns = 0;
    return (
      <div className="text-area row">
        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
           {/*Object.keys(this.props.categories).map(this.createButton)*/}
           <button
            type="button"
            className="btn btn-default"
            key="predict"
            disabled={this.state.isPredicting}
            onClick={this.predict}
          >
            Predict
          </button>
          <textarea type="text" name="custom-input" style={{verticalAlign:"text-top",width:"100%",height:"200px"}} onChange={this.onChangeInputValue.bind(this)}/>,


          {/* <button
            type="button"
            className="btn btn-default"
            key="Reset-btn"
            onClick={() => {
              newLocal.setState({
                runs: {
                  0: {
                    end: text.length,
                    type: 'normal',
                    prev: null,
                  },
                },
              });
            }}
          >
            Reset
          </button> */}
        </div>
        <div
          key="text-container"
          id={this.props.id}
          ref={function setContainer(container) {
            newLocal.container = container;
          }}
          className="text-container col-xs-12 col-sm-12 col-md-12 col-lg-12"
        >

          {Object.keys(runs).map((start) => {
            // console.log("--------------------------------runs")
            // console.log(runs)
            // console.log("---------------------------------start")
            // console.log(start)
            const { end, type } = runs[start];
            // console.log("-----------------------------run")
            // console.log(this.state.runs)
            // console.log(this.props)
            const { color } = this.props.categories[type];
            let len = 0;
            const temp = currentRuns;
            currentRuns = end;
            const parts = text.substring(start, end).split('\n');
            return parts.map((x, i) => {
              const id = len;
              len += x.length + 1;
              if (i < parts.length - 1) {
                return [
                  <span
                    key={`${temp}-${id}`}
                    id={`${temp}-${id}`}
                    title={type}
                    style={{
                      backgroundColor: color,
                      color: TinyColor(color).getBrightness() < 196 ? 'white' : 'black',
                    }}
                  >
                    {x}
                  </span>,
                  <br key={`${temp}br${id}`} />,
                ];
              }
              return (
                <span
                  title={type}
                  key={`${temp}-${id}`}
                  id={`${temp}-${id}`}
                  style={{
                    backgroundColor: color,
                    color: TinyColor(color).getBrightness() < 196 ? 'white' : 'black',
                  }}
                >
                  {x}
                </span>
              );
            });
          })}
        </div>
      </div>
    );
  }
}
