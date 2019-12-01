function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

var data = require('/media/minhhieu/DATA/HOC/AILAB/NLP/data/testconvert.json');
// var content = replaceAll(data[0].message, "\n","\n");
var content = data[0].message;

var tags = data[0].tags;
// console.log(tags);
var labelList = [];
var contentList = [];
function removeA(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
}
var count = 0;
// var ary = ['three', 'seven', 'eleven','',''];
// console.log(removeA(ary, ''));
for (var key in tags){
    tag = tags[key];
    var begin = key;
    var end = tag.end;
    var type = tag.type;
    // console.log(begin + " " + end);
    labels = replaceAll(content.substring(begin, end),"\n", " \n ");
    if (labels != ' '){
        // console.log(labels);
        labels = removeA(labels.split(' '),'');
        // console.log(labels[0] + " " + );
        count += labels.length;
        // console.log(labels);
        if (labels.length > 0){
            if (labels[0] == "\n" || type == "normal"){
                labelList.push('O');
                console.log(labels[0] + " " + 'O');

            } else {
                labelList.push('B-'+type);
                console.log(labels[0] + " " + 'B-'+type);
            }
            contentList.push(labels[0]);

        }
        for (var i = 1; i < labels.length; i++){
            if (labels[i] == "\n" || type == "normal"){
                labelList.push('O');
                console.log(labels[i] + " " + 'O');    
            } else {
                labelList.push('I-'+type);
                console.log(labels[i] + " " + 'I-'+type);
            }
            contentList.push(labels[i]);
        }
    } else {
        continue;
    }

    // break;
}
console.log(labelList.length);
var contentSplit = removeA(content.split(' '),'');
// for (var i = 0 ; i < contentSplit.length; i++){
//     console.log(contentSplit[i]);
// }
console.log(contentList.length);
console.log(count);
// var str = "abc \n abc";
// var spl = str.split(" ");
// console.log(spl);