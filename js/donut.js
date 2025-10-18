// donut.js - Energy Consumption by Screen Technology Donut Chart

function createDonutChart() {
    const container = d3.select("#donut-chart");
    const containerWidth = container.node().getBoundingClientRect().width;
    const width = Math.min(containerWidth, 600);
    const height = 450;
    const margin = 40;
    const radius = Math.min(width, height) / 2 - margin - 20;

    // Clear any existing SVG
    container.selectAll("svg").remove();

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width/2}, ${height/2})`);

    // Load data from CSV (All sizes by screen type)
    d3.csv("data/Ex5_TV_energy_Allsizes_byScreenType.csv").then(function(rawData) {
        // Parse the data using actual column names
        const data = rawData.map(d => ({
            technology: d.Screen_Tech,
            consumption: +d["Mean(Labelled energy consumption (kWh/year))"]
        })).filter(d => d.technology && d.consumption);

        if (data.length === 0) {
            svg.append("text")
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("fill", "#666")
                .text("No valid data found in CSV file");
            return;
        }

        // Color scale
        const color = d3.scaleOrdinal()
            .domain(data.map(d => d.technology))
            .range(["#667eea", "#764ba2", "#f093fb", "#4facfe", "#43e97b", "#f6d365"]);

        // Pie generator
        const pie = d3.pie()
            .value(d => d.consumption)
            .sort(null);

        // Arc generator
        const arc = d3.arc()
            .innerRadius(radius * 0.55)
            .outerRadius(radius);

        const arcHover = d3.arc()
            .innerRadius(radius * 0.55)
            .outerRadius(radius * 1.08);

        // Tooltip
        const tooltip = d3.select("#tooltip");

        // Create arcs
        const arcs = svg.selectAll("arc")
            .data(pie(data))
            .enter()
            .append("g")
            .attr("class", "arc");

        arcs.append("path")
            .attr("d", arc)
            .attr("fill", d => color(d.data.technology))
            .attr("stroke", "white")
            .attr("stroke-width", 3)
            .style("opacity", 0.85)
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(300)
                    .attr("d", arcHover)
                    .style("opacity", 1);
                
                const total = d3.sum(data, d => d.consumption);
                const percentage = ((d.data.consumption / total) * 100).toFixed(1);
                
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                
                tooltip.html(`
                    <strong>${d.data.technology}</strong><br/>
                    Avg: ${d.data.consumption.toFixed(1)} kWh/year<br/>
                    ${percentage}% of total
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                d3.select(this)
                    .transition()
                    .duration(300)
                    .attr("d", arc)
                    .style("opacity", 0.85);
                
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .transition()
            .duration(1000)
            .attrTween("d", function(d) {
                const interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
                return function(t) {
                    return arc(interpolate(t));
                };
            });

        // Add labels
        arcs.append("text")
            .attr("transform", d => {
                const centroid = arc.centroid(d);
                return `translate(${centroid[0]}, ${centroid[1]})`;
            })
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-weight", "600")
            .style("fill", "#fff")
            .style("opacity", 0)
            .text(d => d.data.technology)
            .transition()
            .delay(1000)
            .duration(500)
            .style("opacity", 1);

        // Center label
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("y", -10)
            .style("font-size", "16px")
            .style("font-weight", "600")
            .style("fill", "#333")
            .text("All TV Sizes");

        const avgTotal = d3.mean(data, d => d.consumption);
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("y", 20)
            .style("font-size", "22px")
            .style("font-weight", "bold")
            .style("fill", "#667eea")
            .text(avgTotal.toFixed(0));

        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("y", 40)
            .style("font-size", "13px")
            .style("fill", "#666")
            .text("kWh/year (avg)");

    }).catch(function(error) {
        console.error("Error loading data:", error);
        svg.append("text")
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("fill", "#666")
            .text("Error loading data. Check console for details.");
    });
}

// Create chart on load
createDonutChart();

// Recreate on window resize
window.addEventListener('resize', createDonutChart);