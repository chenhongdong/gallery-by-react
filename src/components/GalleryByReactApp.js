'use strict';

var React = require('react/addons');

// CSS
require('normalize.css');
require('../styles/main.css');

//获取图片相关的数据
var imageDatas = require('../data/imagesData.json');

//利用自执行函数，将图片名信息转成图片URL路径信息
imageDatas = (function getImageURL(arr){
    for(var i = 0, len = arr.length; i < len; i++){
        var singleImgData = arr[i];

        singleImgData.imageURL = require('../images/' + singleImgData.filename);

        arr[i] = singleImgData;
    }
    return arr;
})(imageDatas);
/*
* 获取区间内的随机值
* */
function getRangeRandom(low, high){
    return Math.ceil( Math.random() * ( high - low )+low );
}

var ImgFigure = React.createClass({
    render : function () {

        var styleObj = {};

        //如果props属性中指定了这张图片的位置，则使用
        if(this.props.arrange.pos) {
            styleObj = this.props.arrange.pos;
        }

        return (
            <figure className="img-figure" style={styleObj}>
                <img src={this.props.data.imageURL}
                     alt={this.props.data.title}
                />
                <figcaption>
                    <h2 className="img-title">{this.props.data.title}</h2>
                </figcaption>
            </figure>
        );
    }
});


var GalleryByReactApp = React.createClass({
    Constant : {
      centerPos:{
         left :0,
         right :0
      },
      hPosRange:{   //水平方向的取值范围
          leftSecX:[0,0],
          rightSecX:[0,0],
          y: [0,0]
      },
      vPosRange:{   //垂直方向的取值范围
          x: [0,0],
          topY:[0,0]
      }
    },
    /*
    * 重新布局所有图片
    * @param centerIndex 指定居中排布哪个图片
    * */
    rearrange:function(centerIndex){
        var imgsArr = this.state.imgsArr,
            Constant = this.Constant,
            centerPos = Constant.centerPos,
            hPosRange = Constant.hPosRange,
            vPosRange = Constant.vPosRange,
            hPosRangeLeftSecX = hPosRange.leftSecX,
            hPosRangeRightSecX = hPosRange.rightSecX,
            hPosRangeY = hPosRange.y,
            vPosRangeX = vPosRange.x,
            vPosRangeTopY = vPosRange.topY,

            imgsArrTopArr = [],
            topImgNum = Math.ceil(Math.random() * 2),   //取一个或者不取
            topImgSpliceIndex = 0,

            imgsArrCenterArr = imgsArr.splice(centerIndex,1);

        //首先居中 centerIndex 的图片
        imgsArrCenterArr[0].pos = centerPos;

        //取出要布局上侧图片的状态信息
        topImgSpliceIndex = Math.ceil(Math.random() * (imgsArr.length - topImgNum));
        imgsArrTopArr = imgsArr.splice(topImgSpliceIndex,topImgNum);

        //布局位于上侧的图片
        imgsArrTopArr.forEach(function (value,index) {
            imgsArrTopArr[index].pos = {
                top:getRangeRandom(vPosRangeTopY[0],vPosRangeTopY[1]),
                left:getRangeRandom(vPosRangeX[0] ,vPosRangeX[1])
            };
        });

        //布局左右两侧的图片
        for(var i = 0, j = imgsArr.length, k = j / 2; i < j; i++){
            var hPosRangeLORX = null;
            //前半部分布局左边，右半部分布局右边
            if(i < k){
                hPosRangeLORX = hPosRangeLeftSecX;
            }else{
                hPosRangeLORX = hPosRangeRightSecX;
            }

            imgsArr[i].pos = {
                top: getRangeRandom(hPosRangeY[0], hPosRangeY[1]),
                left: getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1])
            };
        }

        if(imgsArrTopArr && imgsArrTopArr[0]) {
            imgsArr.splice(topImgSpliceIndex, 0, imgsArrTopArr[0]);
        }

        imgsArr.splice(centerIndex, 0, imgsArrCenterArr[0]);

        this.setState({
            imgsArr: imgsArr
        });
    },
    getInitialState: function () {
        return {
            imgsArr: []
        };
    },
    //组件加载以后，为每张图片计算其位置的范围
    componentDidMount: function(){
        //首先拿到舞台的大小
        var stageDOM = React.findDOMNode(this.refs.stage),
            stageW = stageDOM.scrollWidth,
            stageH = stageDOM.scrollHeight,
            halfStageW = Math.ceil(stageW / 2),
            halfStageH = Math.ceil(stageH / 2);

        //拿到一个imgFigure的大小
        var imgFigureDOM = React.findDOMNode(this.refs.imgFigure0),
            imgW = imgFigureDOM.scrollWidth,
            imgH = imgFigureDOM.scrollHeight,
            halfImgW = Math.ceil(imgW / 2),
            halfImgH = Math.ceil(imgH / 2);
        //计算中心图片的位置点
        this.Constant.centerPos = {
            left: halfStageW - halfImgW,
            top: halfStageH - halfImgH
        };

        //计算左侧，右侧区域图片排布位置的取值范围
        this.Constant.hPosRange.leftSecX[0] = -halfImgW;
        this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
        this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
        this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;
        this.Constant.hPosRange.y[0] = -halfImgH;
        this.Constant.hPosRange.y[1] = stageH - halfImgH;

        //计算上侧区域图片排布位置的取值范围
        this.Constant.vPosRange.topY[0] = -halfImgH;
        this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
        this.Constant.vPosRange.x[0] = halfStageW - imgW;
        this.Constant.vPosRange.x[1] = halfStageW;

        this.rearrange(0);
    },
    render: function() {

        var controllerUnits = [],
            imgFigures = [];

        imageDatas.forEach(function (value, index) {

            if(!this.state.imgsArr[index]) {
                this.state.imgsArr[index] = {
                    pos: {
                        left: 0,
                        top: 0
                    }
                };
            }

            imgFigures.push(<ImgFigure data={value} ref={'imgFigure' + index} arrange={this.state.imgsArr[index]}/>);
        }.bind(this));

        return (
            <section className="stage" ref="stage">
                <section className="img-sec">
                    {imgFigures}
                </section>
                <nav className="controller-nav">

                </nav>
            </section>
        );
    }
});

React.render(<GalleryByReactApp />, document.getElementById('content')); // jshint ignore:line

module.exports = GalleryByReactApp;

