// scatter.js - Energy Consumption vs Star Rating Scatter Plot

function createScatterPlot() {
    const margin = {top: 30, right: 100, bottom: 60, left: 70};
    const container = d3.select("#scatter-chart");
    const containerWidth = container.node().getBoundingClientRect().width;
    const width = containerWidth - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    container.selectAll("svg").remove();

    const svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    d3.csv("data/Ex5_TV_energy.csv").then(function(data) {
        // Parse using actual column names
        data.forEach(d => {
            d.brand = d.brand;
            d.screensize = +d.screensize;
            d.energy_consumpt = +d.energy_consumpt;
            d.star2 = +d.star2;
            d.screen_tech = d.screen_tech;
        });

        // Filter valid data
        data = data.filter(d => d.star2 && d.energy_consumpt && d.screensize);

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
            .domain([d3.min(data, d => d.star2) - 0.5, d3.max(data, d => d.star2) + 0.5])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.energy_consumpt) * 1.1])
            .range([height, 0]);

        const sizeScale = d3.scaleSqrt()
            .domain(d3.extent(data, d => d.screensize))
            .range([4, 12]);

        const colorScale = d3.scaleSequential(d3.interpolateViridis)
            .domain(d3.extent(data, d => d.screensize));

        // Grid
        svg.append("g")
            .attr("class", "grid")
            .attr("opacity", 0.3)
            .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(""));

        // X Axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .style("font-size", "12px");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 45)
            .attr("fill", "#333")
            .style("font-size", "14px")
            .style("font-weight", "600")
            .style("text-anchor", "middle")
            .text("Energy Star Rating");

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
            .text("Energy Consumption (kWh/year)");

        const tooltip = d3.select("#tooltip");

        // Draw circles
        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d.star2))
            .attr("cy", d => yScale(d.energy_consumpt))
            .attr("r", 0)
            .attr("fill", d => colorScale(d.screensize))
            .attr("opacity", 0.7)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .transition().duration(200)
                    .attr("opacity", 1)
                    .attr("stroke-width", 3);
                
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                
                tooltip.html(`
                    <strong>${d.brand}</strong><br/>
                    Screen: ${d.screen_tech}<br/>
                    Size: ${d.screensize}"<br/>
                    Rating: ${d.star2} stars<br/>
                    Consumption: ${d.energy_consumpt} kWh/year
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                d3.select(this)
                    .transition().duration(200)
                    .attr("opacity", 0.7)
                    .attr("stroke-width", 1.5);
                
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .transition()
            .duration(800)
            .delay((d, i) => i * 2)
            .attr("r", d => sizeScale(d.screensize));

        // Legend
        const legend = svg.append("g")
            .attr("transform", `translate(${width - 80}, 20)`);

        const legendData = [
            d3.min(data, d => d.screensize),
            d3.median(data, d => d.screensize),
            d3.max(data, d => d.screensize)
        ];

        legendData.forEach((size, i) => {
            const g = legend.append("g")
                .attr("transform", `translate(0, ${i * 30})`);
            
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