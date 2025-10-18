// donut.js - Energy Consumption by Screen Technology Donut Chart

function createDonutChart() {
    const container = d3.select("#donut-chart");
    const containerWidth = container.node().getBoundingClientRect().width;
    const width = Math.min(containerWidth, 600);
    const height = 500;
    const margin = 40;
    const radius = Math.min(width, height) / 2 - margin;

    // Clear any existing SVG
    container.selectAll("svg").remove();

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width/2}, ${height/2})`);

    // Load data from CSV (All sizes by screen type)
    d3.csv("./Ex5/Ex5_TV_energy_Allsizes_byScreenType.csv").then(function(rawData) {
        // Parse the data - try different possible column names
        const data = rawData.map(d => ({
            technology: d.ScreenType || d.screenType || d.screen_type || d.Technology || d.technology || d.Type || d.type,
            consumption: +(d.TotalConsumption || d.totalConsumption || d.total_consumption || d.Consumption || d.consumption || d.Energy || d.energy || d.Power || d.power)
        }));

        // Filter out invalid data
        const validData = data.filter(d => d.technology && d.consumption);

        if (validData.length === 0) {
            svg.append("text")
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("fill", "#666")
                .text("No valid data found in CSV file");
            return;
        }

        // Color scale
        const color = d3.scaleOrdinal()
            .domain(validData.map(d => d.technology))
            .range(["#667eea", "#764ba2", "#f093fb", "#4facfe", "#43e97b", "#f6d365"]);

        // Pie generator
        const pie = d3.pie()
            .value(d => d.consumption)
            .sort(null);

        // Arc generator
        const arc = d3.arc()
            .innerRadius(radius * 0.5)
            .outerRadius(radius);

        const arcHover = d3.arc()
            .innerRadius(radius * 0.5)
            .outerRadius(radius * 1.08);

        // Tooltip
        const tooltip = d3.select("#tooltip");

        // Create arcs
        const arcs = svg.selectAll("arc")
            .data(pie(validData))
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
                
                const total = d3.sum(validData, d => d.consumption);
                const percentage = ((d.data.consumption / total) * 100).toFixed(1);
                
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                
                tooltip.html(`
                    <strong>${d.data.technology}</strong><br/>
                    Consumption: ${d.data.consumption.toLocaleString()} kWh<br/>
                    Percentage: ${percentage}%
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
                const [x, y] = arc.centroid(d);
                return `translate(${x * 1.5}, ${y * 1.5})`;
            })
            .attr("text-anchor", "middle")
            .style("font-size", "13px")
            .style("font-weight", "600")
            .style("fill", "#333")
            .text(d => d.data.technology)
            .style("opacity", 0)
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
            .text("Total Energy");

        const total = d3.sum(validData, d => d.consumption);
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("y", 15)
            .style("font-size", "24px")
            .style("font-weight", "bold")
            .style("fill", "#667eea")
            .text(total.toLocaleString());

        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("y", 35)
            .style("font-size", "14px")
            .style("fill", "#666")
            .text("kWh");

        // Legend
        const legend = svg.append("g")
            .attr("transform", `translate(${radius + 50}, ${-radius + 20})`);

        validData.forEach((d, i) => {
            const g = legend.append("g")
                .attr("transform", `translate(0, ${i * 30})`);
            
            g.append("rect")
                .attr("width", 20)
                .attr("height", 20)
                .attr("fill", color(d.technology))
                .attr("opacity", 0.85);
            
            g.append("text")
                .attr("x", 30)
                .attr("y", 15)
                .style("font-size", "13px")
                .text(d.technology);
        });
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