function drawDonut() {
  const container = d3.select("#donut");
  container.selectAll("*").remove();

  const width = container.node().clientWidth;
  const height = 400;
  const radius = Math.min(width, height) / 2 - 40;

  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  d3.csv("data/TV_energy_Allsizes_byScreenType.csv").then(data => {
    data.forEach(d => {
      d.energy_consumption = +d.energy_consumption;
    });

    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.technology))
      .range(["#2563eb", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"]);

    const pie = d3.pie().value(d => d.energy_consumption);
    const arc = d3.arc().innerRadius(radius * 0.6).outerRadius(radius);

    svg.selectAll("path")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", d => color(d.data.technology))
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .transition()
      .duration(1000)
      .attrTween("d", function(d) {
        const i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
        return t => {
          d.endAngle = i(t);
          return arc(d);
        };
      });

    svg.selectAll("text")
      .data(pie(data))
      .enter()
      .append("text")
      .text(d => d.data.technology)
      .attr("transform", d => `translate(${arc.centroid(d)})`)
      .style("text-anchor", "middle")
      .style("font-size", "12px");
  });
}

drawDonut();
window.addEventListener("resize", drawDonut);

