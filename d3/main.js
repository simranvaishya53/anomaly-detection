var parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S");
var margin = {top: 150, right: 10, bottom: 150, left: 200},
             width = 1200 - margin.left - margin.right,
             height = 650 - margin.top - margin.bottom;
var svg = d3.select("#my_dataviz")
.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
.append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");




d3.csv("train_test.csv")
    .row(function(d){return {date:parseDate(d.Datetime), vibration:Number(d.vibration), anomaly:Number(d.anomaly), threshold1: Number(d.threshold1), threshold2: Number(d.threshold2)};})
    .get(function(error,data){
        
        
        
        console.log(data);
        var maxDate= d3.max(data, function(d){return d.date;});
        var minDate=d3.min(data, function(d){return d.date;});
        var maxPc = d3.max(data, function(d){return d.vibration;});
        var minPc = d3.min(data, function(d){return d.vibration;});
        

        
        var y = d3.scaleLinear()
                    .domain([minPc, maxPc+5])
                    .range([height,0]);

        var x = d3.scaleTime()
                    .domain([minDate, maxDate])
                    .range([0,width]);
                        
        yAxis = svg.append("g")
        .style("font-size", "13px")
        .call(d3.axisLeft(y));
                            
        xAxis = svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .style("font-size", "13px")
          .call(d3.axisBottom(x));

        svg.append("text")                             // x axis label
          .attr("text-anchor", "end")
          .attr("x", width/2)
          .attr("y", height+45 )
          .style("font-size", "20px")
          .text("Datetime ");
      
      
        svg.append("text")                              // Y axis label:
          .attr("text-anchor", "end")
          .attr("transform", "rotate(-90)")
          .attr("y",-40)
          .attr("x",-170)
          .style("font-size", "20px")
          .text("Vibration");
        
        var clip = svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", width )
            .attr("height", height )
            .attr("x", 0)
            .attr("y", 0);

        var brush = d3.brushX()                   // Add the brush feature using the d3.brush function
                   .extent( [ [0,0], [width,height] ] )  // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
                   .on("end", updateChart)
  
        var line = svg.append('g')
        .attr("clip-path", "url(#clip)")
    
        // LINE FOR THE MAIN GRAPH
        line.append("path")
        .datum(data)
        .attr("class", "line")  // I add the class line to be able to modify this line later on.
        .attr("fill", "none")
        .attr("stroke", "#75bcff")
        // .style("opacity", 0.3)
        .attr("d", d3.line()
            .x(function(d) { return x(d.date) })
            .y(function(d) { return y(d.vibration) })
            );

        line
        .append("g")
            .attr("class", "brush")
            .call(brush);

        // LINE FOR THRESHOLD 1
        line.append("path")
        .datum(data)
        .attr("class", "line")  
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 2.5)
        .attr("d", d3.line()
            .x(function(d) { return x(d.date) })
            .y(function(d) { return y(d.threshold1) })
            );

        line
        .append("g")
            .attr("class", "brush")
            .call(brush);

        //LINE FOR THRESHOLD 2
        line.append("path")
        .datum(data)
        .attr("class", "line")  
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 2.5)
        .attr("d", d3.line()
            .x(function(d) { return x(d.date) })
            .y(function(d) { return y(d.threshold2) })
            );

        line
        .append("g")
            .attr("class", "brush")
            .call(brush);

        var color = d3.scaleOrdinal()
        .domain(["1", "-1"])
        .range([ "none", "red"])

        var scatter = svg.append('g')
       .attr("clip-path", "url(#clip)")

  // Add circles
        scatter
            .selectAll("circle")
            .data(data)
            // .attr('class', 'dot')
            .enter()
            .append("circle")
            .attr("cx", function (d) { return x(d.date); } )
            .attr("cy", function (d) { return y(d.vibration); } )
            .attr("r", 2.8)
            .style("fill", function (d) { return color(d.anomaly) } )
           
            //.style("opacity", 0.5)

    // Add the brushing
        scatter
            .append("g")
            .attr("class", "brush")
            .call(brush);
            
        svg.append("circle").attr("cx",200)
        .attr("cy",130).attr("r", 8).style("fill", "red")
        .attr("transform", "translate(-120,-120)")
        
        svg.append("text").attr("x", 220)
        .attr("y", 130).text("Anomaly").style("font-size", "20px")
        .attr("alignment-baseline","middle")
        .attr("transform", "translate(-120,-120)")

      
        var idleTimeout
        function idled() { idleTimeout = null; }
    
        // A function that update the chart for given boundaries
        function updateChart() {
    
            // What are the selected boundaries?
            extent = d3.event.selection
    
            // If no selection, back to initial coordinate. Otherwise, update X axis domain
            if(!extent){
            if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
            x.domain([minDate,maxDate])
            }else{
            x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
            //line.select(".brush").call(brush.move, null)
            scatter.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
            }
    
            // Update axis and line position
            xAxis.transition().duration(1000).call(d3.axisBottom(x))
     
            line
            .select('.line')
            .transition().duration(1000)
            .attr("d", d3.line()
            .x(function(d) { return x(d.date) })
            .y(function(d) { return y(d.vibration)})
            )

            scatter
            .selectAll("circle")
            .transition().duration(1000)
            .attr("cx", function (d) { return x(d.date) } )
            .attr("cy", function (d) { return y(d.vibration) } )

        
        }

   
        
   
    });
    