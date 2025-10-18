// bar.js - 55-inch TV Energy Consumption by Screen Type Bar Chart

function createBarChart() {
    const margin = {top: 30, right: 30, bottom: 80, left: 70};
    const container = d3.select("#bar-chart");
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

    // Load data from CSV (55-inch TVs only by screen type)
    d3.csv("./Ex5/Ex5_TV_energy_55inchtv_byScreenType.csv").then(function(rawData) {
        // Parse the data - try different possible column names
        const data = rawData.map(d => ({
            technology: d.ScreenType || d.screenType || d.screen_type || d.Technology || d.technology || d.Type || d.type,
            avgConsumption: +(d.AverageConsumption || d.averageConsumption || d.avg_consumption || d.AvgPower || d.avgPower || d.Consumption || d.consumption || d.Power || d.power),
            count: +(d.Count || d.count || d.Number || d.number || d.Units || d.units) || 1
        }));

        // Filter out invalid data
        const validData = data.filter(d => d.technology && d.avgConsumption);

        if (validData.length === 0) {
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", height / 2)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("fill", "#666")
                .text("No valid data found in CSV file");
            return;
        }

        // Scales
        const xScale = d3.scaleBand()
            .domain(validData.map(d => d.technology))
            .range([0, width])
            .padding(0.3);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(validData, d => d.avgConsumption) * 1.2])
            .range([height, 0]);

        const colorScale = d3.scaleOrdinal()
            .domain(validData.map(d => d.technology))
            .range(["#667eea", "#764ba2", "#f093fb", "#ff6b6b", "#43e97b", "#f6d365"]);

        // Grid
        svg.append("g")
            .attr("class", "grid")
            .attr("opacity", 0.3)
            .call(d3.axisLeft(yScale)
                .tickSize(-width)
                .tickFormat(""));

        // X Axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .style("font-size", "13px")
            .style("font-weight", "600");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 50)
            .attr("fill", "#333")
            .style("font-size", "14px")
            .style("font-weight", "600")
            .style("text-anchor", "middle")
            .text("Screen Technology");

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
            .text("Average Power Consumption (W)");

        // Tooltip
        const tooltip = d3.select("#tooltip");

        // Bars
        svg.selectAll(".bar")
            .data(validData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.technology))
            .attr("width", xScale.bandwidth())
            .attr("y", height)
            .attr("height", 0)
            .attr("fill", d => colorScale(d.technology))
            .attr("rx", 5)
            .style("opacity", 0.85)
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                    .attr("y", yScale(d.avgConsumption) - 5)
                    .attr("height", height - yScale(d.avgConsumption) + 5);
                
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                
                tooltip.html(`
                    <strong>${d.technology}</strong><br/>
                    Avg Consumption: ${d.avgConsumption.toFixed(1)}W<br/>
                    Sample Size: ${d.count} TVs
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("opacity", 0.85)
                    .attr("y", yScale(d.avgConsumption))
                    .attr("height", height - yScale(d.avgConsumption));
                
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .transition()
            .duration(1000)
            .delay((d, i) => i * 100)
            .attr("y", d => yScale(d.avgConsumption))
            .attr("height", d => height - yScale(d.avgConsumption));

        // Value labels on bars
        svg.selectAll(".label")
            .data(validData)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", d => xScale(d.technology) + xScale.bandwidth() / 2)
            .attr("y", d => yScale(d.avgConsumption) - 10)
            .attr("text-anchor", "middle")
            .style("font-size", "13px")
            .style("font-weight", "600")
            .style("fill", "#333")
            .style("opacity", 0)
            .text(d => `${d.avgConsumption.toFixed(0)}W`)
            .transition()
            .delay(1000)
            .duration(500)
            .style("opacity", 1);

        // Title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "15px")
            .style("font-weight", "600")
            .style("fill", "#333")
            .text("55-inch TVs Only");
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
createBarChart();

// Recreate on window resize
window.addEventListener('resize', createBarChart);