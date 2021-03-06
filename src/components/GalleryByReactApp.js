'use strict';

var React = require('react/addons');

// CSS
require('normalize.css');
require('../styles/main.less');

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
    return Math.ceil(Math.random() * (high - low) + low);
}
/*
获取 0~30° 之间的任意正负值
* */
function get30DegRandom() {
    return ((Math.random() > 0.5 ? '' : '-') + Math.ceil(Math.random() * 30));
}

var ImgFigure = React.createClass({
    /*
    *  imgFigure的点击处理函数
    * */
    handleClick: function (e) {

        if (this.props.arrange.isCenter) {
            this.props.inverse();
        } else {
            this.props.center();
        }

        e.stopPropagation();
        e.preventDefault();
    },
    render: function () {

        var styleObj = {};

        //如果props属性中指定了这张图片的位置，则使用
        if(this.props.arrange.pos) {
            styleObj = this.props.arrange.pos;
        }

        //如果图片的旋转角度有值并且不为0，添加旋转角度
        if (this.props.arrange.rotate) {
            (['MozTransform', 'msTransform', 'WebkitTransform', 'transform']).forEach(function (value) {
                styleObj[value] = 'rotate(' + this.props.arrange.rotate + 'deg)';
            }.bind(this));
        }

        if (this.props.arrange.isCenter) {
            styleObj.zIndex = 11;
        }

        var imgFigureClassName = 'img-figure';
        imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse' : '';

        return (
            <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick}>
                <img src={this.props.data.imageURL}
                     alt={this.props.data.title}
                />
                <figcaption>
                    <h2 className="img-title">{this.props.data.title}</h2>
                    <div className="img-back" onClick={this.handleClick}>
                        <p>
                            {this.props.data.desc}
                        </p>
                    </div>
                </figcaption>
            </figure>
        );
    }
});
//控制组件
var ControllerUnit = React.createClass({
    handleClick(e){
        //如果点击的是当前选中态的按钮，则翻转图片，否则将对应的图片居中
        if (this.props.arrange.isCenter) {
            this.props.inverse();
        } else {
            this.props.center();
        }

        e.preventDefault();
        e.stopPropagation();
    },
    render(){
        var controllerUnitClass = 'controller-unit';

        //如果对应的是居中的图片，显示控制按钮的居中态
        if (this.props.arrange.isCenter) {
            controllerUnitClass += ' is-center';

            //如果同时对应的是翻转图片，显示控制按钮的翻转态
            if (this.props.arrange.isInverse) {
                controllerUnitClass += ' is-inverse';
            }
        }


        return (
            <span className={controllerUnitClass} onClick={this.handleClick}></span>
        );
    }
});

var GalleryByReactApp = React.createClass({
    Constant: {
      centerPos: {
         left: 0,
         right: 0
      },
      hPosRange: {   //水平方向的取值范围
          leftSecX: [0, 0],
          rightSecX: [0, 0],
          y: [0, 0]
      },
      vPosRange: {   //垂直方向的取值范围
          x: [0, 0],
          topY: [0, 0]
      }
    },
    /*
    * 翻转图片
    * @param index 输入当前被执行inverse操作的图片对应的图片信息数组的index值
    * @return {Function} 这是一个闭包函数， 其内return一个真正被执行的函数
    * */
    inverse: function (index) {
        return function () {
            var imgsArr = this.state.imgsArr;

            imgsArr[index].isInverse = !imgsArr[index].isInverse;

            this.setState({
                imgsArr: imgsArr
            });
        }.bind(this);
    },
    /*
    * 重新布局所有图片
    * @param centerIndex 指定居中排布哪个图片
    * */
    rearrange: function(centerIndex) {
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
            topImgNum = Math.floor(Math.random() * 2),   //取一个或者不取
            topImgSpliceIndex = 0,

            imgsArrCenterArr = imgsArr.splice(centerIndex, 1);

        //首先居中 centerIndex 的图片, 居中的 centerIndex 的图片不需要旋转
        imgsArrCenterArr[0] = {
            pos: centerPos,
            rotate: 0,
            isCenter: true
        };

        //取出要布局上侧图片的状态信息
        topImgSpliceIndex = Math.ceil(Math.random() * (imgsArr.length - topImgNum));
        imgsArrTopArr = imgsArr.splice(topImgSpliceIndex, topImgNum);

        //布局位于上侧的图片
        imgsArrTopArr.forEach(function (value, index) {
            imgsArrTopArr[index] = {
                pos: {
                    top: getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]),
                    left: getRangeRandom(vPosRangeX[0], vPosRangeX[1])
                },
                rotate: get30DegRandom(),
                isCenter: false
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

            imgsArr[i] = {
                pos: {
                    top: getRangeRandom(hPosRangeY[0], hPosRangeY[1]),
                    left: getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1])
                },
                rotate: get30DegRandom(),
                isCenter: false
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
    /*
    * 利用rearrange函数， 居中对应index的图片
    * @param index,需要被居中的图片对应的图片信息数组的index值
    * @return {Function}
    * */
    center: function (index) {
        return function () {
            this.rearrange(index);
        }.bind(this);
    },
    getInitialState: function () {
        return {
            imgsArr: [
                /*{
                    pos: {
                        left: 0,
                        top: 0
                    },
                    rotate: 0,      //旋转角度
                    isInverse: false,    //图片正反面
                    isCenter: false     //图片是否居中
                }*/
            ]
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
                    },
                    rotate: 0,
                    isInverse: false,
                    isCenter: false
                };
            }

            imgFigures.push(<ImgFigure key={index} data={value} ref={'imgFigure' + index} arrange={this.state.imgsArr[index]} inverse={this.inverse(index)} center={this.center(index)}/>);

            controllerUnits.push(<ControllerUnit key={index} arrange={this.state.imgsArr[index]} inverse={this.inverse(index)} center={this.center(index)}/>);
        }.bind(this));


        return (
            <section className="stage" ref="stage">
                <section className="img-sec">
                    {imgFigures}
                </section>
                <nav className="controller-nav">
                    {controllerUnits}
                </nav>
            </section>
        );
    }
});

React.render(<GalleryByReactApp />, document.getElementById('content')); // jshint ignore:line

module.exports = GalleryByReactApp;

