/**
 * dom操作类
 */
define(function(){
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
});