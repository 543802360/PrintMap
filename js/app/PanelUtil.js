var DomUtil = (function(){
    /**
     * 构造函数，可以不用
     * @constructor
     */
    function DomUtil(){

    }

    /**
     * 根据id获取元素
     * @param id
     * @returns {HTMLElement}
     */
    DomUtil.prototype.get = function(id){
        return typeof id === 'string' ? document.getElementById(id) : id;
    };

    /**
     * 创建新元素
     * @param tagName:标签名称
     * @param className：类名称
     * @param container：父容器
     * @returns {HTMLElement}
     */
    DomUtil.prototype.create = function(tagName, className, container, id){
        var el = document.createElement(tagName);
        el.className = className;
        if(id){
            el.id = id;
        }
        if(container){
            container.appendChild(el);
        }
        return el;
    };

    /***
     * 移除元素
     * @param el
     */
    DomUtil.prototype.remove = function(el){
        var parent = el.parentNode;
        if(parent){
            parent.removeChild(el);
        }
    };

    /**
     * 设置单个 CSS 属性
     * @param selector:指定元素
     * @param name：规定CSS属性的名称。该参数可包含任何CSS属性，比如"color"
     * @param value:规定CSS属性的值。该参数可以包含任何CSS属性值，比如"red"。
     */
    DomUtil.prototype.setSingleStyle = function(selector, name, value){
        $(selector).css(name, value);
    };

    /***
     * 设置多个 CSS 属性/值对
     * @param selector：指定匹配元素
     * @param style：样式键值对。规定要设置为样式属性的“名称/值对”对象。
     该参数可包含若干对 CSS 属性名称/值。比如 {"color":"red","font-weight":"bold"}
     */
    DomUtil.prototype.setStyle = function(selector, style){
        $(selector).css(style)
    };

    /**
     * 为元素添加类
     * @param selector
     * @param name
     */
    DomUtil.prototype.addClass = function(container, name){
        container.classList.add(name);
        return container;
    };

    /**
     * 从元素中移除类
     * @param selector
     * @param name
     */
    DomUtil.prototype.removeClass = function(selector, name){
        $(selector).removeClass(name);

    };

    /**
     * 获取Dom元素Class
     * @param el
     * @returns {*}
     */
    DomUtil.prototype.getClass = function(el){
        return el.className.baseVal === undefined ? el.className : el.className.baseVal;
    }

    return new DomUtil();
})();

var PanelUtil = (function(){
    /**
     * 浮动面板构造封装类
     * @param className
     * @constructor
     */
    function Panel(className){
        //创建通用panel模板并设置初始化样式
        var that = this;
        this._className = className;
        this._container = DomUtil.create('div', 'emsgis3d-floatpanel', document.body);
        this._container.setAttribute("draggable", "true");

        //设置面板默认样式
        DomUtil.setStyle('.emsgis3d-floatpanel', {
            'display' : 'block',
            'position' : 'absolute',
            '-moz-box-sizing' : 'content-box',
            '-webkit-box-sizing' : 'content-box',
            'box-sizing' : 'content-box',
            'top' : '100px',
            'left' : '200px',
            'width' : 'auto',
            'height' : 'auto',
            'max-width' : '800px', /* Includes space needed for scrollbar */
            'max-height' : '650px',
            'margin-top' : '5px',
            'background-color' : 'rgba(38, 38, 38, 0.85)',
            'color' : '#ffffff',
            'border' : '1px solid #444',
            'padding' : '6px',
            'overflow' : 'auto',
            'border-radius' : '10px',
            '-moz-user-select' : 'none',
            '-webkit-user-select' : 'none',
            '-ms-user-select' : 'none',
            'user-select' : 'none',
            '-webkit-transform' : 'translate(0, -20%)',
            '-moz-transform' : 'translate(0, -20%)',
            'transform' : 'translate(0, -20%)',
            'visibility' : 'hidden',
            'opacity' : '1',
            'z-index' : '1000',
            '-webkit-transition' : 'visibility 0s 0.2s, opacity 0.2s ease-in, -webkit-transform 0.2s ease-in',
            '-moz-transition' : 'visibility 0s 0.2s, opacity 0.2s ease-in, -moz-transform 0.2s ease-in',
            'transition' : 'visibility 0s 0.2s, opacity 0.2s ease-in, transform 0.2s ease-in',
            '-webkit-transform' : 'translate(0, 0)',
            '-moz-transform' : 'translate(0, 0)',
            'transform' : 'translate(0, 0)',
            '-webkit-transition' : 'opacity 0.2s ease-out, -webkit-transform 0.2s ease-out',
            '-moz-transition' : 'opacity 0.2s ease-out, -moz-transform 0.2s ease-out',
            'transition' : 'opacity 0.2s ease-out, transform 0.2s ease-out'
        });
        //添加唯一标识类
        DomUtil.addClass(this._container, className);
        //添加关闭按钮
        this._closeButton = DomUtil.create('a', 'emsgis3d-floatpanel-close-button', this._container);
        $('.emsgis3d-floatpanel-close-button').css({
            'position' : 'absolute',
            'top' : '0',
            'right' : '0',
            'width' : 'auto',
            'height' : 'auto',
            'font-size' : '20px',
            'color' : 'white',
            'padding' : '2px',
            'margin-right' : '6px'
        });
        $('.emsgis3d-floatpanel-close-button').html('&#215;');
        $('.emsgis3d-floatpanel-close-button').attr('href', '#close');
        $('.emsgis3d-floatpanel-close-button').click(function(event){
            console.log("点击关闭DOM:");
            console.log(event.target.parentElement);
            event.target.parentElement.style.visibility = "hidden";
        });
        //添加标题Div
        this._titleContainer = DomUtil.create('div', 'emsgis3d-floatpanel-title', this._container);
        $('.emsgis3d-floatpanel-title').css({
            'margin' : '5px',
            'width' : '100%',
            'max-height' : '30px',
            'text-align' : 'left',
            'font-size' : '18px',
            'font-weight' : 'bolder',
            'padding-left' : '15px',
            'padding-right' : '15px',
            'padding-bottom' : '5px'
        });

        //添加水平分割线
        this._spliter = DomUtil.create('hr', 'emsgis3d-floatpanel-spliter', this._container);
        $('.emsgis3d-floatpanel-spliter').css({
            'margin-top' : '0',
            'margin-bottom' : '0'
        });

        //添加面板内容容器
        this._panelContentContainer = DomUtil.create('div', 'emsgis3d-floatpanel-content', this._container);
        DomUtil.setStyle('.emsgis3d-floatpanel-content', {
            'margin' : '5px',
            'width' : '100%',
            'height' : '100%',
            'padding-left' : '10px',
            'padding-right' : '10px',
            'padding-top' : '10px',
            'padding-bottom' : '5px'
        });

        //为面板添加拖拽事件监听
        this._container.addEventListener('dragstart', function(event){
            var style = window.getComputedStyle(event.target, null);
            event.dataTransfer.setData("text/plain", (parseInt(style.getPropertyValue("left"), 10) - event.clientX) + ","
            + (parseInt(style.getPropertyValue("top"), 10) - event.clientY) + "," + event.target.className);
            console.log("拖动对象：");
            console.log(event.target);
            return true;
        }, false);

        this._container.addEventListener('dragend', function(event){
            event.dataTransfer.clearData("text/plain");
            event.target = null;
            return false;
        }, false);
        document.body.addEventListener("drop", function(event){
            event.preventDefault();
            var data = event.dataTransfer.getData("text/plain").split(',');
            var dom = document.getElementsByClassName(data[2])[0];
            dom.style.left = (event.clientX + parseInt(data[0], 10)) + "px";
            dom.style.top = (event.clientY + parseInt(data[1], 10)) + "px";
            console.log(data[2]);

        }, false);
        document.body.addEventListener("dragover", function(event){
            event.preventDefault();
            return false;
        }, false);
    }

    /*Panel.prototype.ondrop = function(fn){
     event.preventDefault();
     var offset = event.dataTransfer.getData("text/plain").split(',');
     this.container.style.left = (event.clientX + parseInt(offset[0], 10)) + "px";
     this.container.style.top = (event.clientY + parseInt(offset[1], 10)) + "px";
     };*/

    /**
     * 显示面板
     */
    Panel.prototype.show = function(){
        this._container.style.visibility = "visible";
    };
    /**
     * 隐藏面板，而不是销毁
     */
    Panel.prototype.close = function(){
        this._container.style.visibility = "hidden";
    };
    /**
     * 设置面板位置
     * @param top：距离顶部像素数
     * @param left：距离左侧像素数
     */
    Panel.prototype.setPosition = function(top, left){
        this._container.style.left = left;
        this._container.style.top = top;
    };

    Panel.prototype.setTitle = function(title){
        /*var elClassName = "." + this._className + " " + ".emsgis3d-floatpanel-title";
         $(elClassName).html(title);*/
        this._titleContainer.innerHTML = title;
    };

    /**
     * 定义Panel属性
     */
    Object.defineProperties(Panel.prototype, {
        //面板容器
        container : {
            get : function(){
                return this._container;
            }
        },
        //面板内容容器
        contentContainer : {
            get : function(){
                return this._panelContentContainer;
            }
        },
        closeButton : {
            get : function(){
                return this._closeButton;
            }
        },
        enableCloseButton : {
            set : function(value){
                if(value){
                    this._closeButton.style.visibility = "visible";
                } else {
                    this._closeButton.style.visibility = "hidden";
                }
            },
            get : function(){
                return this._closeButton.style.visibility;
            }
        },
        enableSpliter : {
            set : function(value){
                this._spliter.style.visibility = value;
            },
            get : function(){
                return this._spliter.style.visibility;
            }
        },
        enableTitle : {
            set : function(value){
                this._titleContainer.style.visibility = value;
            },
            get : function(){
                return this._titleContainer.style.visibility;
            }
        },
        draggable : {
            get : function(){

            },
            set : function(value){
                this._container.setAttribute("draggable", value);
            }
        },
        title : {
            get : function(){
                return this._titleContainer.innerHTML;
            },
            set : function(value){
                this._titleContainer.innerHTML = value;
            }
        }
    });
    return {
        'create' : function(className){
            return new Panel(className);
        }
    }
})();