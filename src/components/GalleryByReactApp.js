'use strict';

var React = require('react/addons');

// CSS
require('normalize.css');
require('../styles/main.scss');

//获取图片相关的数据
var imageDatas = require('../data/imagesData.json');

//利用自执行函数，将图片名信息转成图片URL路径信息
imageDatas = (function getImageURL(arr){
    for(var i=0,len=arr.length;i<len;i++){
        var singleImgData = arr[i];

        singleImgData.imageURL = require('../images/' + singleImgData.fileName);

        arr[i] = singleImgData;
    }
    return arr;
})(imageDatas);


var GalleryByReactApp = React.createClass({
  render: function() {
    return (
        <section className="stage">
            <section className="img-sec">

            </section>
            <nav className="controller-nav">

            </nav>
        </section>
    );
  }
});
React.render(<GalleryByReactApp />, document.getElementById('content')); // jshint ignore:line

module.exports = GalleryByReactApp;
