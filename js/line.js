// line.js - Electricity Spot Prices Line Chart (1998-2024)

function createLineChart() {
    const margin = {top: 30, right: 120, bottom: 60, left: 70};
    const container = d3.select("#line-chart");
    const containerWidth = container.node().getBoundingClientRect().width;
    const width = containerWidth - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Clear any existing SVG
    container.selectAll("svg").remove();

    const svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Load data from CSV
    d3.csv("./Ex5/Ex5_ARE_Spot_Prices.csv").then(function(rawData) {
        // Parse the data
        rawData.forEach(d => {
            // Try to parse year/date
            d.year = +d.Year || +d.year || +d.Date || +d.date;
            
            // Parse state columns - handle different possible column names
            d.NSW = +d.NSW || +d.nsw || 0;
            d.VIC = +d.VIC || +d.vic || +d.Victoria || 0;
            d.QLD = +d.QLD || +d.qld || +d.Queensland || 0;
            d.SA = +d.SA || +d.sa || +d['South Australia'] || 0;
            d.WA = +d.WA || +d.wa || +d['Western Australia'] || 0;
            
            // If there's an average column
            d.Average = +d.Average || +d.average || +d.avg || 0;
        });

        // Filter valid data
        rawData = rawData.filter(d => d.year && !isNaN(d.year));

        if (rawData.length === 0) {
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", height / 2)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("fill", "#666")
                .text("No valid data found in CSV file");
            return;
        }

        // Determine which states have data
        const states = ["NSW", "VIC", "QLD", "SA", "WA"];
        const availableStates = states.filter(state => 
            rawData.some(d => d[state] && d[state] > 0)
        );

        // If no state data, check for Average
        if (availableStates.length === 0 && rawData.some(d => d.Average > 0)) {
            availableStates.push("Average");
        }

        // Transform data for D3
        const data = availableStates.map(state => ({
            state: state,
            values: rawData.map(d => ({
                year: d.year,
                price: d[state]
            })).filter(d => d.price > 0)
        }));

        // Scales
        const xScale = d3.scaleLinear()
            .domain(d3.extent(rawData, d => d.year))
            .range([0, width]);

        const allPrices = data.flatMap(d => d.values.map(v => v.price));
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(allPrices) * 1.1])
            .range([height, 0]);

        const colorScale = d3.scaleOrdinal()
            .domain(availableStates)
            .range(["#667eea", "#764ba2", "#f093fb", "#4facfe", "#43e97b", "#f6d365"]);

        // Grid
        svg.append("g")
            .attr("class", "grid")
            .attr("opacity", 0.2)
            .call(d3.axisLeft(yScale)
                .tickSize(-width)
                .tickFormat(""));

        // X Axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format("d")).ticks(10))
            .selectAll("text")
            .style("font-size", "12px");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 45)
            .attr("fill", "#333")
            .style("font-size", "14px")
            .style("font-weight", "600")
            .style("text-anchor", "middle")
            .text("Year");

        // Y Axis
        svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(yScale))
            .selectAll("text")
            .style("font-size", "12px");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -50)
            .attr("fill", "#333")
            .style("font-size", "14px")
            .style("font-weight", "600")
            .style("text-anchor", "middle")
            .text("Spot Price ($/MWh)");

        // Line generator
        const line = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.price))
            .curve(d3.curveMonotoneX);

        // Tooltip
        const tooltip = d3.select("#tooltip");

        // Create focus elements for hover
        const focus = svg.append("g")
            .style("display", "none");

        focus.append("line")
            .attr("class", "x-hover-line")
            .attr("y1", 0)
            .attr("y2", height)
            .style("stroke", "#999")
            .style("stroke-width", 1)
            .style("stroke-dasharray", "3,3");

        // Draw lines
        const paths = svg.selectAll(".line")
            .data(data)
            .enter()
            .append("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", d => colorScale(d.state))
            .attr("stroke-width", 3)
            .attr("d", d => line(d.values))
            .style("opacity", 0.8)
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("stroke-width", 5)
                    .style("opacity", 1);
                
                paths.filter(data => data.state !== d.state)
                    .transition()
                    .duration(200)
                    .style("opacity", 0.2);
            })
            .on("mouseout", function() {
                paths.transition()
                    .duration(200)
                    .attr("stroke-width", 3)
                    .style("opacity", 0.8);
            });

        // Animate lines
        const totalLength = paths.nodes().map(node => node.getTotalLength());
        paths.attr("stroke-dasharray", (d, i) => totalLength[i] + " " + totalLength[i])
            .attr("stroke-dashoffset", (d, i) => totalLength[i])
            .transition()
            .duration(2000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);

        // Add dots at end of each line
        svg.selectAll(".end-dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "end-dot")
            .attr("cx", d => xScale(d.values[d.values.length - 1].year))
            .attr("cy", d => yScale(d.values[d.values.length - 1].price))
            .attr("r", 0)
            .attr("fill", d => colorScale(d.state))
            .attr("stroke", "white")
            .attr("stroke-width", 2)
            .transition()
            .delay(2000)
            .duration(300)
            .attr("r", 5);

        // Interactive overlay
        const bisect = d3.bisector(d => d.year).left;

        svg.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("mouseover", () => focus.style("display", null))
            .on("mouseout", () => {
                focus.style("display", "none");
                tooltip.transition().duration(500).style("opacity", 0);
            })
            .on("mousemove", function(event) {
                const x0 = xScale.invert(d3.pointer(event)[0]);
                const year = Math.round(x0);
                
                focus.select(".x-hover-line")
                    .attr("transform", `translate(${xScale(year)},0)`);
                
                let tooltipHtml = `<strong>Year: ${year}</strong><br/>`;
                data.forEach(d => {
                    const dataPoint = d.values.find(v => v.year === year);
                    if (dataPoint) {
                        tooltipHtml += `${d.state}: ${dataPoint.price.toFixed(2)}/MWh<br/>`;
                    }
                });
                
                tooltip.html(tooltipHtml)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px")
                    .transition()
                    .duration(200)
                    .style("opacity", 1);
            });

        // Legend
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width + 20}, 20)`);

        data.forEach((d, i) => {
            const g = legend.append("g")
                .attr("class", "legend-item")
                .attr("transform", `translate(0, ${i * 25})`)
                .style("cursor", "pointer")
                .on("click", function() {
                    const isActive = d3.select(this).classed("inactive");
                    d3.select(this).classed("inactive", !isActive);
                    
                    const targetPath = paths.filter(p => p.state === d.state);
                    targetPath.transition()
                        .duration(300)
                        .style("opacity", isActive ? 0.8 : 0.1);
                });
            
            g.append("line")
                .attr("x1", 0)
                .attr("x2", 30)
                .attr("y1", 0)
                .attr("y2", 0)
                .attr("stroke", colorScale(d.state))
                .attr("stroke-width", 3);
            
            g.append("text")
                .attr("x", 40)
                .attr("y", 5)
                .style("font-size", "13px")
                .style("font-weight", "500")
                .text(d.state);
        });

        legend.append("text")
            .attr("x", 0)
            .attr("y", -15)
            .style("font-size", "13px")
            .style("font-weight", "600")
            .text(availableStates.includes("Average") ? "Data" : "States");

        legend.append("text")
            .attr("x", 0)
            .attr("y", data.length * 25 + 15)
            .style("font-size", "11px")
            .style("fill", "#999")
            .text("Click to toggle");

    }).catch(function(error) {
        console.error("Error loading data:", error);
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("fill", "#666")
            .text("Error loading data. Check console for details.");
    });
}

// Create chart on load
createLineChart();

// Recreate on window resize
window.addEventListener('resize', createLineChart);