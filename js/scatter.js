// scatter.js - Energy Consumption vs Star Rating Scatter Plot

function createScatterPlot() {
    const margin = {top: 30, right: 100, bottom: 60, left: 70};
    const container = d3.select("#scatter-chart");
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
    d3.csv("data/Ex5_TV_energy.csv").then(function(data) {
        // Convert string values to numbers
        data.forEach(d => {
            d.rating = +d.rating || +d.Rating || +d.star_rating || +d.StarRating;
            d.consumption = +d.consumption || +d.Consumption || +d.power || +d.Power;
            d.size = +d.size || +d.Size || +d.screen_size || +d.ScreenSize;
            d.brand = d.brand || d.Brand || d.manufacturer || d.Manufacturer || "Unknown";
        });

        // Filter out invalid data
        data = data.filter(d => d.rating && d.consumption && d.size);

        if (data.length === 0) {
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
        const xScale = d3.scaleLinear()
            .domain([d3.min(data, d => d.rating) - 0.5, d3.max(data, d => d.rating) + 0.5])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.consumption) * 1.1])
            .range([height, 0]);

        const sizeScale = d3.scaleSqrt()
            .domain(d3.extent(data, d => d.size))
            .range([5, 15]);

        const colorScale = d3.scaleSequential(d3.interpolateViridis)
            .domain(d3.extent(data, d => d.size));

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
            .call(d3.axisBottom(xScale).ticks(10))
            .append("text")
            .attr("x", width / 2)
            .attr("y", 45)
            .attr("fill", "#333")
            .style("font-size", "14px")
            .style("font-weight", "600")
            .text("Energy Star Rating");

        // Y Axis
        svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(yScale))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -50)
            .attr("fill", "#333")
            .style("font-size", "14px")
            .style("font-weight", "600")
            .text("Power Consumption (W)");

        // Tooltip
        const tooltip = d3.select("#tooltip");

        // Circles
        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d.rating))
            .attr("cy", d => yScale(d.consumption))
            .attr("r", 0)
            .attr("fill", d => colorScale(d.size))
            .attr("opacity", 0.7)
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("opacity", 1)
                    .attr("stroke-width", 3);
                
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                
                tooltip.html(`
                    <strong>${d.brand}</strong><br/>
                    Rating: ${d.rating} stars<br/>
                    Consumption: ${d.consumption}W<br/>
                    Size: ${d.size}"
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("opacity", 0.7)
                    .attr("stroke-width", 2);
                
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .transition()
            .duration(1000)
            .attr("r", d => sizeScale(d.size));

        // Legend
        const legend = svg.append("g")
            .attr("transform", `translate(${width - 80}, 20)`);

        const sizeLegendData = [
            d3.min(data, d => d.size),
            d3.median(data, d => d.size),
            d3.max(data, d => d.size)
        ];

        sizeLegendData.forEach((size, i) => {
            const g = legend.append("g")
                .attr("transform", `translate(0, ${i * 25})`);
            
            g.append("circle")
                .attr("r", sizeScale(size))
                .attr("fill", colorScale(size))
                .attr("opacity", 0.7);
            
            g.append("text")
                .attr("x", 25)
                .attr("y", 5)
                .style("font-size", "12px")
                .text(`${Math.round(size)}"`);
        });

        legend.append("text")
            .attr("x", 0)
            .attr("y", -10)
            .style("font-size", "13px")
            .style("font-weight", "600")
            .text("Screen Size");
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
createScatterPlot();

// Recreate on window resize
window.addEventListener('resize', createScatterPlot);