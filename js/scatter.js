function drawScatter() {
  const container = d3.select("#scatter");
  container.selectAll("*").remove();

  const width = container.node().clientWidth;
  const height = 400;
  const margin = { top: 30, right: 30, bottom: 50, left: 60 };

  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  d3.csv("data/TV_energy.csv").then(data => {
    data.forEach(d => {
      d.star_rating = +d.star_rating;
      d.energy_consumption = +d.energy_consumption;
    });

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.star_rating))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.energy_consumption)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const color = d3.scaleSequential(d3.interpolateBlues)
      .domain(d3.extent(data, d => d.energy_consumption));

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.star_rating))
      .attr("cy", d => y(d.energy_consumption))
      .attr("r", 6)
      .attr("fill", d => color(d.energy_consumption))
      .attr("opacity", 0.8);
  });
}

drawScatter();
window.addEventListener("resize", drawScatter);
