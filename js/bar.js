function drawBar() {
  const container = d3.select("#bar");
  container.selectAll("*").remove();

  const width = container.node().clientWidth;
  const height = 400;
  const margin = { top: 30, right: 30, bottom: 50, left: 60 };

  console.log("Bar chart width:", width); // Debug: check width

  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  d3.csv("data/TV_energy_55inchtv_byScreenType.csv")
    .then(data => {
      console.log("CSV loaded:", data); // Debug: check if data loads

      data.forEach(d => {
        d.energy_consumption = +d.energy_consumption;
      });

      console.log("Parsed data:", data); // Debug: check parsing

      const x = d3.scaleBand()
        .domain(data.map(d => d.technology))
        .range([margin.left, width - margin.right])
        .padding(0.3);

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.energy_consumption)])
        .nice()
        .range([height - margin.bottom, margin.top]);

      const color = d3.scaleOrdinal()
        .domain(data.map(d => d.technology))
        .range(["#3b82f6", "#06b6d4", "#22c55e", "#f97316", "#ef4444"]);

      // Add axes first (to ensure they show even if bars don't)
      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

      // Draw bars
      svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.technology))
        .attr("y", d => y(d.energy_consumption))
        .attr("width", x.bandwidth())
        .attr("height", d => height - margin.bottom - y(d.energy_consumption))
        .attr("fill", d => color(d.technology))
        .attr("rx", 5)
        .attr("opacity", 0.9)
        .on("mouseover", function(event, d) {
          d3.select(this).attr("opacity", 1).attr("fill", "#1e40af");
        })
        .on("mouseout", function(event, d) {
          d3.select(this).attr("opacity", 0.9).attr("fill", color(d.technology));
        });

      console.log("Bars drawn:", svg.selectAll(".bar").size()); // Debug: count bars
    })
    .catch(error => {
      console.error("Error loading CSV:", error); // Debug: catch errors
    });
}

drawBar();
window.addEventListener("resize", drawBar);