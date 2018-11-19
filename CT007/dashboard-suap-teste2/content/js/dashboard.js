/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.77365323675872, "KoPercent": 0.22634676324128564};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.03666817564508828, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0038461538461538464, 500, 1500, "Visualizar-Processo"], "isController": false}, {"data": [0.10714285714285714, 500, 1500, "Login-Submit"], "isController": false}, {"data": [0.0, 500, 1500, "Visualizar-Processos"], "isController": false}, {"data": [0.005076142131979695, 500, 1500, "Visualizar-Alunos"], "isController": false}, {"data": [0.056768558951965066, 500, 1500, "Diarios"], "isController": false}, {"data": [0.013959390862944163, 500, 1500, "Index"], "isController": false}, {"data": [0.25793650793650796, 500, 1500, "Login-Open"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2209, 5, 0.22634676324128564, 9816.731100045257, 1, 19288, 13652.0, 14294.5, 15463.7, 11.42493625516553, 1336.51333897835, 2.998948792080642], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["Visualizar-Processo", 390, 0, 0.0, 10654.392307692311, 1321, 13279, 12573.7, 12798.4, 13107.33, 2.0648249134361865, 181.95324929484906, 0.5605677011086522], "isController": false}, {"data": ["Login-Submit", 126, 1, 0.7936507936507936, 4456.531746031747, 538, 9544, 8782.9, 9182.65, 9535.36, 3.1655905333768812, 1.990074554681808, 1.3865896964424793], "isController": false}, {"data": ["Visualizar-Processos", 321, 0, 0.0, 13095.355140186912, 3102, 19288, 14820.6, 15230.199999999999, 18757.899999999994, 1.6658449881937778, 679.9617605299178, 0.47990651515348093], "isController": false}, {"data": ["Visualizar-Alunos", 394, 1, 0.25380710659898476, 10561.507614213197, 1, 16417, 12583.5, 12811.5, 15572.650000000001, 2.0753116918004118, 174.13558753805617, 0.5249079376721745], "isController": false}, {"data": ["Diarios", 458, 1, 0.2183406113537118, 9027.323144104801, 2, 12347, 11543.4, 11756.3, 12055.69, 2.4274803495995716, 170.5877768265067, 0.6163524325155163], "isController": false}, {"data": ["Index", 394, 1, 0.25380710659898476, 10456.568527918776, 1, 16776, 13274.5, 14020.25, 15827.400000000005, 2.0763069139966275, 142.04509149715432, 0.49271736338005906], "isController": false}, {"data": ["Login-Open", 126, 1, 0.7936507936507936, 2771.2539682539677, 24, 6379, 5393.3, 5968.649999999999, 6373.33, 4.154302670623145, 24.481034145235743, 0.555800259643917], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Percentile 1
            case 8:
            // Percentile 2
            case 9:
            // Percentile 3
            case 10:
            // Throughput
            case 11:
            // Kbytes/s
            case 12:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 4, 80.0, 0.1810774105930285], "isController": false}, {"data": ["403/Forbidden", 1, 20.0, 0.04526935264825713], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2209, 5, "502/Bad Gateway", 4, "403/Forbidden", 1, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["Login-Submit", 126, 1, "403/Forbidden", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["Visualizar-Alunos", 394, 1, "502/Bad Gateway", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Diarios", 458, 1, "502/Bad Gateway", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Index", 394, 1, "502/Bad Gateway", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Login-Open", 126, 1, "502/Bad Gateway", 1, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
