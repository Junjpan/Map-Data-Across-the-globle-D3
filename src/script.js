const margin = { top: 20, right: 50, bottom: 20, left: 50 };
const width = 1200;
const height = 1200;
const center_width = (width - margin.right - margin.left) / 2;
const center_height = (height - margin.top - margin.bottom) / 2;
var svg = d3
  .select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .call(
    d3
      .zoom()
      .scaleExtent([1, 5])
      .on("zoom", function() {
        svg.attr("transform", d3.event.transform);
      })
  )
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const dataSet_url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json";

const map_url =
  "https://raw.githubusercontent.com/Sufflavus/CodepenExamples/master/14_MeteoriteLanding/world-50m.json";

d3
  .queue()
  .defer(d3.json, map_url)
  .defer(d3.json, dataSet_url)
  .await(ready);

//create a Projection using geoMercator and center it and then create a path, this two syntax will be used all the time when you create a shape in the map .there are multiple projection in D3, Mercator is just one of them
var projection = d3
  .geoMercator()
  .translate([center_width, center_height])
  .scale(130);

//create a path(geopath)
var path = d3.geoPath().projection(projection);

function ready(err, map, Mdata) {
  if (err) {
    throw err;
  }
  //console.log(map)
  //console.log(data)

  //typojson.feature alwasy convert the raw typojson data into usable geo data
  var countries = topojson.feature(map, map.objects.countries).features;
  //console.log(countries);
  //draw the country shape,it mean we need to draw a path for each country

  svg
    .selectAll(".country")
    .data(countries)
    .enter()
    .append("path")
    .attr("class", "country")
    .attr("d", path)
    .on("mouseover", function(d) {
      //add the class selected
      d3.select(this).classed("selected", true);
    })
    .on("mouseout", function(d) {
      //remove the class selected
      d3.select(this).classed("selected", false);
    });
  //since some coordinates data is null which will triger some problem for readding the data
  var tooltip = d3.select("#map").append("div");

  var meterorData = Mdata.features.map(function(d) {
    return d.properties;
  });
  //console.log(meterorData);

  //set up color range
  const minMass = d3.min(meterorData, d => Number(d.mass));
  const maxMass = d3.max(meterorData, d => Number(d.mass));
  //console.log(minMass,maxMass)
  const color = d3
    .scaleThreshold()
    .domain(d3.range(minMass, maxMass, (maxMass - minMass) / 10))
    .range(d3.schemeCategory10);
  console.log(color.domain()[2])
  console.log(color(575000));

  svg
    .selectAll(".meteor")
    .data(meterorData)
    .enter()
    .append("circle")
    .classed("meteor", true)
    .attr("fill",d => {
      return color(d.mass);
    })
    .attr("r", d => {
      return Math.sqrt(Math.sqrt(d.mass) / 4);
    })
    //use the projection function we set up in the early of the coding
    .attr("cx", d => {
      var coords = projection([d.reclong, d.reclat]);
      return coords[0];
    })
    .attr("cy", d => {
      var coords = projection([d.reclong, d.reclat]);
      return coords[1];
    })
    .on("mouseover", d => {
      tooltip
        .classed("tooltip", true)
        .style("top", d3.event.pageY + 10 + "px")
        .style("left", d3.event.pageX + "px").html(`<p>Name: ${d.name} </p>
                <p>Mass: ${d.mass} </p>
                <p>Year: ${new Date(d.year).getFullYear()} <p>
                <p>Long: ${d.reclong} <p>
                <p>Lat:  ${d.reclat} <p>`);
    })
    .on("mouseout", d => {
      tooltip.classed("tooltip", false);
    });
}
