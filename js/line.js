function drawLine() {
  const container = d3.select("#line");
  container.selectAll("*").remove();

  const width = container.node().clientWidth;
  const height = 400;
  const margin = { top: 30, right: 40, bottom: 50, left: 60 };

  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  d3.csv("data/ARE_Spot_Prices.csv").then(data => {
    data.forEach(d => {
      d.year = +d.year;
      d.average_price = +d.average_price;
    });

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.average_price)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const line = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.average_price))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#2563eb")
      .attr("stroke-width", 3)
      .attr("d", line);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));
  });
}

drawLine();
window.addEventListener("resize", drawLine);
