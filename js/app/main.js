var app = {};
app.map = null;
app.toolbar = null;
app.tool = null;
app.symbols = null;
app.printer = null;
require([
    "esri/map",
    "esri/dijit/Print",
    "esri/tasks/PrintTask",
    "esri/tasks/PrintParameters",
    "esri/tasks/PrintTemplate",
    "esri/symbols/TextSymbol",
    "esri/symbols/Font",
    "esri/graphic",
    "esri/geometry/Point",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/Color",
    "esri/config",
    "dojo/domReady!"
], function(Map,
            Print,
            PrintTask,
            PrintParameters,
            PrintTemplate,
            TextSymbol,
            Font,
            Graphic,
            Point,
            SimpleMarkerSymbol,
            SimpleLineSymbol,
            Color,
            esriConfig){
    esriConfig.defaults.io.proxyUrl = "http://127.0.0.1:8080/java/proxy.jsp";
    //初始化地图
    app.map = new Map("map", {
        center : [110, 32], // long, lat
        basemap : "hybrid",
        zoom : 3,
        showAttribution : false/*,
         nav : true*/

    });
    //宗地检索面板
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
        panel.title = "宗地图配置项";
        panel.contentContainer.appendChild(content);
        return panel;

    })();
    $('#menu-search').click(function(){
        searchPanel.show();
    });
    //宗地图整饰要素
    $('#menu-config').click(function(){
        configPanel.show();
    });
    //导出至PDF
    $('#menu-export2pdf').click(function(){

    });
    //打印宗地图
    $('#menu-print').click(function(){
        var printTask = new PrintTask("https://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task");
        var template = new PrintTemplate();
        /*var dpi = document.getElementById("dpi").value;*/
        var dpi = 300;
        template.exportOptions = {
            width : 800,
            height : 600,
            dpi : Number(dpi)
        };
        template.format = "PDF";
        template.layout = "MAP_ONLY";
        template.preserveScale = false;
        var params = new PrintParameters();
        params.map = app.map;
        params.template = template;
        printTask.execute(params, function(evt){
            window.open(evt.url, "_blank");
        });
    });
});
