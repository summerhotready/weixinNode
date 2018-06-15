var uploadCustomFileList = [];
console.log("add js")
// 这里是简单的调用，其余api请参考文档
_weui2.default.uploader('#uploaderCustom', {
    url: 'http://localhost:8080/upload',
    auto: false,
    onQueued: function onQueued() {
        console.log("upload")
        uploadCustomFileList.push(this);
    }
});

// 手动上传按钮
document.getElementById("uploaderCustomBtn").addEventListener('click', function () {
    uploadCustomFileList.forEach(function (file) {
       console.log("click upload")
    });
});

// 缩略图预览
document.querySelector('#uploaderCustomFiles').addEventListener('click', function (e) {
    console.log("click uploaderCustomFiles")
    var target = e.target;

    while (!target.classList.contains('weui-uploader__file') && target) {
        target = target.parentNode;
    }
    if (!target) return;

    var url = target.getAttribute('style') || '';
    var id = target.getAttribute('data-id');

    if (url) {
        url = url.match(/url\((.*?)\)/)[1].replace(/"/g, '');
    }
    var gallery = _weui2.default.gallery(url, {
        onDelete: function onDelete() {
            _weui2.default.confirm('确定删除该图片？', function () {
                var index;
                for (var i = 0, len = uploadCustomFileList.length; i < len; ++i) {
                    var file = uploadCustomFileList[i];
                    if (file.id == id) {
                        index = i;
                        break;
                    }
                }
                if (index !== undefined) uploadCustomFileList.splice(index, 1);

                target.remove();
                gallery.hide();
            });
        }
    });
});