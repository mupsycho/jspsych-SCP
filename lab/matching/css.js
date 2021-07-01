let a = document.createElement("style");
a.innerHTML = `
.content_box{
    width: 600px;
    overflow-y:auto;
    height: 600px;
    border: solid 2px #fff;
    overflow: hidden;
    padding: 10px;
    overflow-y: auto;
  
  }
  
.header {
    text-align: center; 
    font-weight:700; 
    font-size:25px; 
    color : white;
}

.box {
    overflow-y: scroll;
    border: 1px solid white;
}

.footer {
    color : lightgreen; 
    font-size:25px;
    margin: 0 auto;
}

.key {}

.content { 
    font-size: 35px;
    margin: 0px;
    padding: 0px;
    height: 80px;
    text-align: left;
}

.content img {
    transform: scale(0.6, 0.6) translateZ(0);
    width: 128px;
    height: 128px;
    vertical-align: middle;
}

.content .word { 

}

.feedback {
    font-size: 20px;
}

`;
document.head.appendChild(a);