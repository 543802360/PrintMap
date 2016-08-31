var app = {};
app.parcelConfig = null;
app.printLayers = [];
app.parcelPointGraphicLayer = null;
app.parcelPolylineGraphicLayer = null;
app.parcelPolygonGraphicLayer = null;
app.parcelTextGraphicLayer = null;
app.webroot = "http://127.0.0.1:6080";
require([
    "esri/map",
    "esri/layers/FeatureLayer",
    "esri/layers/GraphicsLayer",
    "esri/layers/LabelLayer",
    "esri/dijit/Print",
    "esri/dijit/Scalebar",
    "esri/dijit/OverviewMap",
    "esri/dijit/HomeButton",
    "esri/tasks/PrintTask",
    "esri/tasks/PrintParameters",
    "esri/tasks/PrintTemplate",
    "esri/symbols/TextSymbol",
    "esri/symbols/Font",
    "esri/graphic",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/TextSymbol",
    "esri/Color",
    "esri/config",
    "esri/dijit/Print",
    "esri/tasks/PrintTemplate",
    "esri/request",
    "esri/config",
    "esri/tasks/query",
    "esri/tasks/QueryTask",
    "esri/tasks/RelationshipQuery",
    "esri/tasks/RelationParameters",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/geometry/Extent",
    "esri/geometry/Point",
    "esri/geometry/Polygon",
    "esri/geometry/Polyline",
    "esri/geometry/webMercatorUtils",
    "esri/tasks/FindTask",
    "esri/tasks/FindParameters",
    "esri/geometry/scaleUtils",
    "esri/tasks/GeometryService",
    "dojo/_base/array",
    "dojo/dom",
    "dojo/number",
    "dojo/parser",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "dojo/domReady!"
], function(Map,
            FeatureLayer,
            GraphicsLayer,
            LabelLayer,
            Print,
            Scalebar,
            OverviewMap,
            HomeButton,
            PrintTask,
            PrintParameters,
            PrintTemplate,
            TextSymbol,
            Font,
            Graphic,
            SimpleMarkerSymbol,
            SimpleLineSymbol,
            SimpleFillSymbol,
            TextSymbol,
            Color,
            esriConfig,
            Print,
            PrintTemplate,
            esriRequest,
            esriConfig,
            Query,
            QueryTask,
            RelationshipQuery,
            RelationParameters,
            SimpleMarkerSymbol,
            Extent,
            Point,
            Polygon,
            Polyline,
            webMercatorUtils,
            FindTask,
            FindParameters,
            scaleUtils,
            GeometryService,
            array,
            dom,
            number,
            parser){
    // 跨域配置
    esriConfig.defaults.io.corsEnabledServers.push("127.0.0.1");
    esriConfig.defaults.io.corsEnabledServers.push("127.0.0.1:6080");
    //初始化地图
    app.map = new Map("map", {
        center : [107, 33],
        zoom : 4,
        minZoom : 4,
        maxZoom : 24,
        showAttribution : false,
        isZoomSlider : true,
        showLabels : true
    });
    //添加影像底图图层
    var baseLayer = new esri.layers.ArcGISTiledMapServiceLayer(
        "http://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer");
    var hbVector = new esri.layers.ArcGISTiledMapServiceLayer(
        "http://www.tiandituhubei.com:6080/arcgis/rest/services/SLDT_L7_L20_HB/MapServer");
    var hbVectorLabel = new esri.layers.ArcGISTiledMapServiceLayer(
        "http://www.tiandituhubei.com:6080/arcgis/rest/services/SLZJ_L7_L20_HB/MapServer");
    //几何服务（裁剪与空间几何关系计算）
    var geometryService = new GeometryService(app.webroot + "/arcgis/rest/services/Utilities/Geometry/GeometryServer");
    /*app.map.addLayers([baseLayer, hbVector, hbVectorLabel]);*/
    app.map.addLayers([baseLayer]);

    //注册鼠标事件监听
    app.map.on("load", function(){
        app.map.on("mouse-move", function(event){
            //the map is in web mercator but display coordinates in geographic (lat, long)
            var mp = webMercatorUtils.webMercatorToGeographic(event.mapPoint);
            var lng = mp.x.toFixed(3),
                lat = mp.y.toFixed(3);
            app.esriMousePosition.setValue(lat, lng);
        });
        app.map.on("mouse-drag", function(event){
            var mp = webMercatorUtils.webMercatorToGeographic(event.mapPoint);
            var lng = mp.x.toFixed(3),
                lat = mp.y.toFixed(3);
            app.esriMousePosition.setValue(lat, lng);
        });
    });
    //添加地图dijit
    (function(){
        //比例尺
        var scalebar = new Scalebar({
            map : app.map,
            attachTo : "bottom-left",
            scalebarUnit : 'metric',
            scalebarStyle : 'line'
        });
        //鹰眼图
        var overviewMapDijit = new OverviewMap({
            map : app.map,
            baseLayer : baseLayer,
            expandFactor : 1.2,
            attachTo : "bottom-right",
            color : " #D84E13",
            visible : true,
            opacity : .40
        });
        overviewMapDijit.startup();
        //
        var home = new HomeButton({
            map : app.map
        }, "HomeButton");
        home.startup();
        //添加MousePosition
        app.esriMousePosition = (function(){
            function MousePosition(){
                this._container = DomUtil.create('div', "esriMousePosition", document.getElementsByClassName('map')[0], 'esriMousePosition');
                DomUtil.setStyle('.esriMousePosition', {
                    'position' : 'absolute',
                    'bottom' : '25px',
                    'left' : '200px',
                    'width' : 'auto',
                    'height' : '20px',
                    'background-color' : 'transparent',
                    'font-size' : '16px',
                    'font-weight' : 'bolder',
                    'font-style' : 'normal',
                    'color' : 'yellow',
                    'text-align' : 'center',
                    'z-index' : '30'
                });
            }

            MousePosition.prototype.setValue = function(lat, lng){
                $('#esriMousePosition').text("纬度:" + lat + "，" + "经度:" + lng);
            };

            return new MousePosition();
        })();
    })();

    //宗地样式
    app.parcelStyle = {
        pointSymbol : new SimpleMarkerSymbol({
            "color" : [255, 255, 255, 64],
            "size" : 12,
            "angle" : -30,
            "xoffset" : 0,
            "yoffset" : 0,
            "type" : "esriSMS",
            "style" : "esriSMSCircle",
            "outline" : {
                "color" : [0, 0, 0, 255],
                "width" : 1,
                "type" : "esriSLS",
                "style" : "esriSLSSolid"
            }
        }),
        polylineSymbol : new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([255, 0, 0]), 3),
        polygonSymbol : new SimpleFillSymbol(SimpleFillSymbol.STYLE_NULL, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25])),
        font : (function(){
            var _font = new Font();
            _font.setSize("13pt");
            _font.setWeight(Font.WEIGHT_NORMAL);
            _font.setFamily('宋体');
            return _font;
        })(),
        textSymbol : null
    };
    //分别创建宗地点、线、面图层
    app.parcelPointGraphicLayer = new GraphicsLayer();
    app.parcelPolygonGraphicLayer = new GraphicsLayer();
    app.parcelPolylineGraphicLayer = new GraphicsLayer();
    app.parcelTextGraphicLayer = new GraphicsLayer();

    app.map.addLayers([app.parcelPointGraphicLayer, app.parcelPolylineGraphicLayer, app.parcelPolygonGraphicLayer, app.parcelTextGraphicLayer]);
    // 宗地检索面板
    var searchPanel = (function(){
        var panel = PanelUtil.create("search-panel"),
            content = document.getElementById("search-panel");
        panel.title = "宗地检索";
        panel.contentContainer.appendChild(content);
        return panel;
    })();
    //整饰面板
    var configPanel = (function(){
        var panel = PanelUtil.create("config-panel"),
            content = document.getElementById("config-panel");
        panel.title = "宗地图整饰项";
        panel.contentContainer.appendChild(content);
        return panel;

    })();
    ///打印地图
    parser.parse();
    app.printUrl = app.webroot + "/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task";

    //导出地图PDF
    var printMap_PDF = function(){
        //定义制图模板
        var template = new PrintTemplate();
        template.layoutOptions = {
            titleText : app.parcelConfig.parcelTitle,
            legendLayers : [baseLayer, app.parcelPointGraphicLayer, app.parcelPolylineGraphicLayer, app.parcelPolygonGraphicLayer, app.parcelTextGraphicLayer],
            customTextElements : [{mapper : app.parcelConfig.parcelMapper}, {inspector : app.parcelConfig.parcelInspector}, {landID : '地籍号：14'},
                {landOwner : app.parcelConfig.parcelOwner}, {mapNumber : '所在图幅号：21.00-28.00'},
                {parcelArea : '宗地面积：234 平方米'}, {buildingArea : '建筑物面积：157 平方米'}]
        };
        template.format = "PDF";
        template.layout = "parcelTmp";
        template.preserveScale = true;
        template.outScale = app.parcelConfig.parcelScale;
        template.showAttribution = false;
        template.showLabels = true;
        //打印参数
        var params = new PrintParameters();
        params.map = app.map;
        params.template = template;
        //打印任务
        var printTask = new PrintTask(app.printUrl, params, false);
        printTask.execute(params, function(complete){
            $('#printModal').modal('hide');
            window.open(complete.url, "_blank");
        }, function(error){
            $('#printModal').modal('hide');
            alert("打印宗地图失败！！" + '\n' + error);
        });
    }
    //导出地图PNG
    var printMap_PNG = function(){
        //定义制图模板
        var template = new PrintTemplate();
        /* exportOptions只对MAP_ONLY有效
         template.exportOptions = {
         width : 800,
         height : 600,
         dpi : dpi
         };*/
        template.layoutOptions = {
            titleText : app.parcelConfig.parcelTitle,
            legendLayers : [baseLayer, app.parcelPointGraphicLayer, app.parcelPolylineGraphicLayer, app.parcelPolygonGraphicLayer, app.parcelTextGraphicLayer],
            customTextElements : [{mapper : app.parcelConfig.parcelMapper}, {inspector : app.parcelConfig.parcelInspector}, {landID : '地籍号：14'},
                {landOwner : app.parcelConfig.parcelOwner}, {mapNumber : '所在图幅号：21.00-28.00'},
                {parcelArea : '宗地面积：234 平方米'}, {buildingArea : '建筑物面积：157 平方米'}]
        };
        template.format = "PNG32";
        template.layout = "parcelTmp";
        template.preserveScale = true;
        template.outScale = app.parcelConfig.parcelScale;
        template.showAttribution = false;
        template.showLabels = true;
        //打印参数
        var params = new PrintParameters();
        params.map = app.map;
        params.template = template;
        //打印任务
        var printTask = new PrintTask(app.printUrl, params, false);
        printTask.execute(params, function(complete){
            $('#printModal').modal('hide');
            window.open(complete.url, "_blank");
        }, function(error){
            $('#printModal').modal('hide');
            alert("打印宗地图失败！！" + '\n' + error);
        });
    };

    var queryByName = function(kind, value){
        //构建查询任务
        var queryTask = new QueryTask(app.webroot + "/arcgis/rest/services/hck_parcel_demo1/FeatureServer/1");
        var query = new Query();
        var whereStr = kind + " = '" + value + "'";
        /*
         query.where = "CITY_NAME = 'Shanghai'";
         */
        query.where = whereStr;
        query.outSpatialReference = {wkid : 102100};
        query.returnGeometry = true;
        query.outFields = ["*"];
        queryTask.execute(query,
            function(complete){
                console.log(complete);
                showQueryRes(complete);
            },
            function(error){
                console.log(error.error);
            });
    };
    /**
     * 更新宗地样式（面、线、标注）
     */
    var updateParcelStyle = function(){
        var parcelTitle = $('#parcel-map-title').val(),//宗地图标题
            parcelScale = $('#parcelScale').val(),//宗地比例尺
            parcelMapper = $('#parcelMapper').val(),//宗地图制图员
            parcelInspector = $('#parcelInspector').val(),//宗地图核查员
            parcelOwner = $('#parcelOwner').val(),//宗地权属人
            parcelDatetime = $('#parcelDatetime').val(),//日期
            parcelLineKind = $('#line-kind').val(),//线条类型
            parcelLineWidth = $('#line-width').val(),//线条宽度
            parcelLineColor = $('#line-color').val(),//线条颜色
            fontSize = $('#font-size').val(),//字体大小
            fontColor = $('#font-color').val(),//字体颜色
            fontWeight = $('#font-width').val();//字体粗细
        app.parcelConfig = {
            parcelTitle : parcelTitle,
            parcelScale : Number(parcelScale),
            parcelMapper : "制图员：" + parcelMapper,
            parcelOwner : "土地权利人：" + parcelOwner,
            parcelDatetime : parcelDatetime,
            parcelInspector : "检查员：" + parcelInspector
        };
        //线型
        switch(parcelLineKind){
            case 'solid':
                app.parcelStyle.polylineSymbol = new SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_SOLID,
                    new Color("#" + parcelLineColor),
                    Number(parcelLineWidth)
                );
                app.parcelStyle.polygonSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_NULL,
                    app.parcelStyle.polylineSymbol, new Color([255, 255, 0, 0.25])
                );
                break;
            case 'dash':
                app.parcelStyle.polylineSymbol = new SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_DASH,
                    new Color("#" + parcelLineColor),
                    Number(parcelLineWidth)
                );
                app.parcelStyle.polygonSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_NULL,
                    app.parcelStyle.polylineSymbol, new Color([255, 255, 0, 0.25])
                );
                break;
            case 'dot':
                app.parcelStyle.polylineSymbol = new SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_DOT,
                    new Color("#" + parcelLineColor),
                    Number(parcelLineWidth)
                );
                app.parcelStyle.polygonSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_NULL,
                    app.parcelStyle.polylineSymbol, new Color([255, 255, 0, 0.25])
                );
                break;
            default :
                break;
        }
        //字体
        switch(fontWeight){
            case 'normal':
                var _font = new Font();
                _font.setSize(fontSize + "pt");
                _font.setWeight(Font.STYLE_NORMAL);
                _font.setFamily('宋体');
                app.parcelStyle.font = _font;
                break;
            case 'bolder':
                var _font = new Font();
                _font.setSize(fontSize + "pt");
                _font.setWeight(Font.WEIGHT_BOLDER);
                _font.setFamily('宋体');
                app.parcelStyle.font = _font;
                break;
            case 'lighter':
                var _font = new Font();
                _font.setSize(fontSize + "pt");
                _font.setWeight(Font.WEIGHT_LIGHTER);
                _font.setFamily('宋体');
                app.parcelStyle.font = _font;
                break;
            default :
                break;
        }

        //更新图层样式
        app.parcelPolygonGraphicLayer.graphics.forEach(function(graphic){
            graphic.setSymbol(app.parcelStyle.polygonSymbol);
        });
        app.parcelPolylineGraphicLayer.graphics.forEach(function(graphic){
            graphic.setSymbol(app.parcelStyle.polylineSymbol);
        });
        app.parcelTextGraphicLayer.graphics.forEach(function(graphic){
            var _color = new Color("#" + fontColor);
            var _textSymbol = new TextSymbol();
            _textSymbol.setText(graphic.symbol.text);
            _textSymbol.setFont(app.parcelStyle.font);
            _textSymbol.setColor(_color);
            graphic.setSymbol(_textSymbol);
        });
        app.parcelPolylineGraphicLayer.redraw();
        app.parcelPolygonGraphicLayer.redraw();
        app.parcelTextGraphicLayer.redraw();
    };

    $(document).ready(function(){
        //日期
        $('#parcelDatetime').datetimepicker({
            format : 'yyyy-mm-dd',
            language : 'zh-CN',
            minView : 'month',
            autoclose : true
        });
        //禁用 BootStrap Modal 点击空白时自动关闭
        $('#printModal').modal({
            backdrop : 'static',
            keyboard : false,
            show : false
        });
        $('#queryModal').modal({
            backdrop : 'static',
            keyboard : false,
            show : false
        });
        //选择宗地编号为检索依据
        $('#parcelID').click(function(){
            $('#parcelQueryKind').html("宗地编号" + "<span class=" + "\"" + "caret" + "\"" + ">");
        });
        //选择宗地类型为检索依据
        $('#parcelKind').click(function(){
            $('#parcelQueryKind').html("宗地类型" + "<span class=" + "\"" + "caret" + "\"" + ">");
        });
        //选择宗地权利人为检索依据
        $('#parcelOwn').click(function(){
            $('#parcelQueryKind').html("宗地权利人" + "<span class=" + "\"" + "caret" + "\"" + ">");
        });
        //宗地检索对话框
        $('#menu-search').click(function(){
            searchPanel.show();
        });
        //宗地图整饰对话框
        $('#menu-config').click(function(){
            configPanel.show();
        });
        //打印预览
        $('#menu-preview').click(function(){
            if(app.parcelConfig){
                printMap_PNG();
                $('#printModal').modal('show');
            } else {
                alert("请先配置宗地图打印参数！");
            }
        });
        //打印宗地图
        $('#menu-print').click(function(){
            if(app.parcelConfig){
                printMap_PDF();
                $('#printModal').modal('show');
            } else {
                alert("请先配置宗地图打印参数！");
            }
        });
        //宗地查询事件
        $('#btn-query-parcel').click(function(){
            //获取检索类型和检索条件
            var parcelQueryCondition = $('#parcelQueryCondition').val();
            var parcelQueryKind = $('#parcelQueryKind').text().trim();
            if(parcelQueryKind != "请选择检索类型"){
                if(parcelQueryCondition){
                    /*   queryByName(parcelName);*/
                    //清除上次查询结果
                    app.parcelPointGraphicLayer.clear();
                    app.parcelPolygonGraphicLayer.clear();
                    app.parcelPolylineGraphicLayer.clear();
                    app.parcelTextGraphicLayer.clear();
                    $('#queryModal').modal('show');
                    switch(parcelQueryKind){
                        case '宗地编号':
                            parcelQuery('zddm', parcelQueryCondition);
                            break;
                        case '宗地类型':
                            parcelQuery('d1', parcelQueryCondition);
                            break;
                        case '宗地权利人':
                            parcelQuery('qsr', parcelQueryCondition);
                            break;
                        default :
                            break;
                    }

                } else {
                    alert("请输入宗地检索条件！");
                }
            }
            else {
                alert("请选择宗地检索类型！");
            }

        });
        //宗地图配置事件：更新宗地图样式
        $('#btn-parcel-config-ok').click(function(){
            updateParcelStyle();
            configPanel.close();
        });
        $('#btn-parcel-config-apply').click(function(){
            updateParcelStyle();
        });
        $('#btn-parcel-config-cancle').click(function(){
            configPanel.close();
        });

    });
    /**
     * 根据字段和字段值查询宗地
     * @param kind
     * @param value
     */
    var parcelQuery = function(kind, value){
        var queryTask = new QueryTask(app.webroot + "/arcgis/rest/services/hck_parcel_demo1/FeatureServer/1");
        var query = new Query();
        /*
         var whereStr = kind + " = '" + value + "'";
         */
        var whereStr = kind + " like '%" + value + "%'";
        query.where = whereStr;
        query.outSpatialReference = {wkid : 102100};
        query.returnGeometry = true;
        query.outFields = ["*"];
        queryTask.execute(query,
            function(complete){//查询成功
                if(complete.features.length != 0){
                    $('#queryModal').modal('hide');
                    showParcelQueryRes(complete);
                } else {
                    $('#queryModal').modal('hide');
                    alert('未找到查询结果，请检查检索条件是否正确！');
                }
            },
            function(error){
                $('#queryModal').modal('hide');
                console.log(error.error);
                alert('未找到查询结果，请检查检索条件是否正确！');
            });
    };
    /**
     * 显示宗地查询结果
     * @param qs
     */
    var showParcelQueryRes = function(qs){
        switch(qs.geometryType){
            case 'esriGeometryPolygon'://多边形
                qs.features.forEach(function(feature){
                    feature.setSymbol(app.parcelStyle.polygonSymbol);
                    app.parcelPolygonGraphicLayer.add(feature);
                    //为宗地块添加注记
                    geometryService.labelPoints([feature.geometry], function(labelPoints){
                        array.forEach(labelPoints, function(labelPoint){
                            // 创建TextSymbol
                            var textSymbol = new TextSymbol(feature.attributes.qsr + "-" + feature.attributes.zddm,
                                app.parcelStyle.font, new Color([255, 255, 0]));
                            var labelPointGraphic = new Graphic(labelPoint, textSymbol);
                            app.parcelTextGraphicLayer.add(labelPointGraphic);
                        });
                    });
                });
                //缩放至宗地块
                app.map.setExtent(qs.features[0].geometry.getExtent());
                //单一宗地时，进行相邻查询
                if(qs.features.length == 1){
                    parcelSpaQuery(qs.features[0].geometry);
                }

                break;
            case 'esriGeometryPolyline'://多段线
                qs.features.forEach(function(feature){
                    feature.setSymbol(app.parcelStyle.polylineSymbol);
                    app.parcelPolylineGraphicLayer.add(feature);
                });
                app.map.setExtent(qs.features[0].geometry.getExtent());
                break;
            case 'esriGeometryPoint'://点
                qs.features.forEach(function(feature){
                    feature.setSymbol(app.parcelStyle.pointSymbol);
                    app.parcelPointGraphicLayer.add(feature);
                });
                var localLat = qs.features[0].geometry.getLatitude();
                var localLng = qs.features[0].geometry.getLongitude();
                var localPoint = new Point(localLng, localLat);
                app.map.setScale(2000);
                app.map.centerAt(localPoint);
                break;
            default :
                break;
        }

        /*  //获取点范围并zoomTo
         var localLat = app.pointGraphicLayer.graphics[0].geometry.getLatitude();
         var localLng = app.pointGraphicLayer.graphics[0].geometry.getLongitude();
         var localPoint = new Point(localLng, localLat);
         app.map.setScale(2000);
         app.map.centerAt(localPoint);*/

    };

    /**
     * 空间查询（相邻）
     * @param geometry
     * @param relationShip
     */
    var parcelSpaQuery = function(geometry){
        //获取主宗地Extent，并外扩0.5倍构建裁剪矩形
        var mainExtent = geometry.getExtent(),
            deltaX = mainExtent.xmax - mainExtent.xmin,
            deltaY = mainExtent.ymax - mainExtent.ymin,
            cutExtent = new Extent(mainExtent.xmin - deltaX / 2, mainExtent.ymin - deltaY / 2, mainExtent.xmax + deltaX / 2, mainExtent.ymax + deltaY / 2, app.map.spatialReference),
            cutGeometry = Polygon.fromExtent(cutExtent);
        var cutLine = new Polyline(app.map.spatialReference);
        cutLine.paths = cutGeometry.rings;
        //创建空间查询任务
        var queryTask = new QueryTask(app.webroot + "/arcgis/rest/services/hck_parcel_demo1/FeatureServer/1");
        var query = new Query();
        query.geometry = geometry;
        query.outFields = ["*"];
        query.outSpatialReference = app.map.spatialReference;
        query.spatialRelationship = Query.SPATIAL_REL_TOUCHES;//相邻
        query.returnGeometry = true;
        queryTask.execute(query,
            function(complete){
                //相邻多边形查询结果
                var touchesGeometries = [];
                complete.features.forEach(function(feature){
                    touchesGeometries.push(feature.geometry);
                });
                geometryService.cut(touchesGeometries, cutLine,
                    function(cutResult){
                        console.log(cutResult);
                        //注意：裁剪结果包含所有多边形（裁剪矩形范围内外均包含）
                        if(cutResult.geometries.length != 0){
                            //获取裁剪范围内的多边形
                            var relationParams = new RelationParameters();
                            relationParams.geometries1 = cutResult.geometries;
                            relationParams.geometries2 = [cutGeometry];
                            relationParams.relation = RelationParameters.SPATIAL_REL_WITHIN;
                            geometryService.relation(relationParams,
                                function(complete){
                                    //将裁剪范围内的多边形转换为多段线
                                    var polylineArray = [];
                                    complete.forEach(function(obj){
                                        var _polyline = new Polyline(app.map.spatialReference);
                                        _polyline.paths = cutResult.geometries[obj.geometry1Index].rings;
                                        polylineArray.push(_polyline);
                                        /*var gh = new Graphic(cutResult.geometries[obj.geometry1Index]);
                                         gh.setSymbol(app.parcelStyle.polygonSymbol);
                                         app.parcelPolygonGraphicLayer.add(gh);*/
                                    });
                                    cutPolylines(polylineArray, cutLine);
                                },
                                function(error){
                                    console.log(error);
                                    alert("获取宗地裁剪块失败，请核查！" + "\n" + error);
                                });
                        }
                    });
            },
            function(error){
                console.log(error);
                alert("获取相邻宗地块失败，请检查！" + "\n" + error);
            });
        /**
         * 裁剪多边形
         * @param geometries
         * @param cutGeometry
         */
        function cutPolylines(geometries, cutGeometry){
            geometryService.cut(geometries, cutLine,
                function(complete){
                    complete.geometries.forEach(function(geometry){
                        if(geometry.paths[0].length > 2){
                            var gh = new Graphic(geometry);
                            gh.setSymbol(app.parcelStyle.polylineSymbol);
                            app.parcelPolylineGraphicLayer.add(gh);
                        }
                    });
                    console.log(complete);
                }, function(error){

                });
        }
    };

    //获取地图比例尺
    app.scaleChange = function(value){
        app.map.setScale(Number(value));
        app.scaleUtils = scaleUtils;
        var scale = scaleUtils.getScale(app.map);
        console.log("当前地图比例尺：" + scale);
    };
    //同服务多图层查询
    var findTaskByName = function(parcelName){
        //构建查询任务
        var findTask = new FindTask(app.webroot + "/arcgis/rest/services/hkc_parcel/MapServer/");
        var findParams = new FindParameters();
        findParams.returnGeometry = true;
        findParams.layerIds = [0, 1, 2, 3];
        findParams.searchFields = ["Layer"];
        findParams.searchText = parcelName;
        findTask.execute(findParams, function(complete){
            console.log(complete);
            parseParcelFindResult(complete);
        }, function(error){
            alert("查询失败！" + "\n" + error)
        });
    };
    var parseParcelFindResult = function(findResult){
        if(findResult.length == 0){
            alert("未找到您的查询结果！");
        } else {

            findResult.forEach(function(item){
                switch(item.layerName){
                    case 'hkc_point':
                        item.feature.setSymbol(app.parcelStyle.pointSymbol);
                        app.parcelPointGraphicLayer.add(item.feature);
                        break;
                    case 'hkc_annotation':
                        break;
                    case 'hkc_polyline':
                        item.feature.setSymbol(app.parcelStyle.polylineSymbol);
                        app.parcelPolylineGraphicLayer.add(item.feature);
                        break;
                    case 'hkc_polygon':
                        item.feature.setSymbol(app.parcelStyle.polygonSymbol);
                        app.parcelPolygonGraphicLayer.add(item.feature);
                        break;
                    default :
                        break;
                }
            });
            var localPoint = new Point(5.468, 28.859);
            app.map.setScale(2000);
            app.map.centerAt(localPoint);
        }
    };

});
