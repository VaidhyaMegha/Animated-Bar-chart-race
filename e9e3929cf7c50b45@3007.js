// https://observablehq.com/@d3/bar-chart-race-explained@3007
export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["clinical trial data.csv",new URL("./files/aec3792837253d4c6168f9bbecdf495140a5f9bb1cdb12c7c8113cec26332634a71ad29b446a1e8236e0a45732ea5d0b4e86d9d1568ff5791412f093ec06f4f1",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){
    return(
md`# Bar Chart Race For Clinical Trial Data `
)});
  main.variable(observer()).define(["md"], function(md){return(
md` Bar Chart Race :

 The bar chart race is an animated chart and it displays top "n" values as per year wise.Eg:The generated bar chart race is displaying top 12 "cond" values with columns (trial_count ,cond,start_year) values for clinical trial data. The chart consists of four parts. From bottom to top in z-order: the bars, the x-axis, the labels, and the ticker showing the current date. It have some good features. 1.You can make the animation faster or slower by adjusting the duration in milliseconds(By entering the millisecods in "Duration" text box below the bar chart race). 2.Selecting the top "n" values for displaying bar chart race. 3.Good visualization with different colors for each value.Please refer the below link for generating bar chart race.

Link:https://observablehq.com/@d3/bar-chart-race-explained`
)});
  main.variable(observer()).define(["md"], function(md){return(
md` Clinical Trial Registry Data :

The Cinical trial data file(clinical trial data.csv) is taken from "ClinicalTrials.gov". ClinicalTrials.gov is a database of privately and publicly funded clinical studies conducted around the world. It is a Web-based resource that provides patients, their family members, health care professionals, researchers, and the public with easy access to information on publicly and privately supported clinical studies on a wide range of diseases and conditions. The Web site is maintained by the National Library of Medicine (NLM) at the National Institutes of Health (NIH).The file contains data from 2004 to 2019 with columns "cond","start_year","trial_count".The column "cond" contains diseases names,"start_year" contains year and "trial_count" conatins number of trials.`
)});
  main.define("data", ["d3","FileAttachment"], async function(d3,FileAttachment){return(
d3.csvParse(await FileAttachment("clinical trial data.csv").text(), d3.autoType)
)});
  main.define("viewof replay", ["html"], function(html){return(
html`<button>Replay`
)});
  main.define("replay", ["Generators", "viewof replay"], (G, _) => G.input(_));
  main.variable(observer("title")).define("title", ["md"], function(md){return(
md`## Top 12 clinical trial data's cond as per trial_count and start_year

It will take 2 or 3 mins to generate bar chart.Please wait.`
)});
  main.variable(observer("chart")).define("chart", ["replay","d3","width","height","bars","axis","labels","ticker","keyframes","duration","x","invalidation"], async function*(replay,d3,width,height,bars,axis,labels,ticker,keyframes,duration,x,invalidation)
{
  replay;
  console.log("Duration", duration);
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height]);

  const updateBars = bars(svg);
  const updateAxis = axis(svg);
  const updateLabels = labels(svg);
  const updateTicker = ticker(svg);

  yield svg.node();

  for (const keyframe of keyframes) {
    const transition = svg.transition()
        .duration(duration)
        .ease(d3.easeLinear);

    // Extract the top bar’s value.
    x.domain([0, keyframe[1][0].value]);

    updateAxis(keyframe, transition);
    updateBars(keyframe, transition);
    updateLabels(keyframe, transition);
    updateTicker(keyframe, transition);

    invalidation.then(() => svg.interrupt());
    await transition.end();
  }
}
);  
main.variable(observer()).define("durationObject", ["DOM", "html"], function(dom, html){
  var text = dom.input('text');
  text.id = "duration";
  text.value = "250"; //default value for duration
  var button = html`<button id='subDuration'>CLICK ME</button>`;
  return html`Duration: ${text} ${button}`;
})

main.define("Durationbutton", ["Generators", "durationObject"], function(G) {
  var button = document.getElementById("subDuration");
  return G.input(button);
})

main.variable().define("duration", ["Durationbutton", "durationObject"], function(button){
  var textBox = document.getElementById("duration");
  button;
  return textBox.value;
});
  main.define(["data"], function(data){return(
data
)});
  main.define(["d3","data"], function(d3,data){return(
d3.group(data, d => d.name)
)});
  main.define("n", function(){return(
12
)});
  main.define("names", ["data"], function(data){return(
new Set(data.map(d => d.name))
)}); 
  main.define("datevalues", ["d3","data"], function(d3,data){return(
Array.from(d3.rollup(data, ([d]) => d.value, d => +d.date, d => d.name))
  .map(([date, data]) => [new Date(date+'-01-01'), data])
  .sort(([a], [b]) => d3.ascending(a, b))
)});
  main.define("rank", ["names","d3","n"], function(names,d3,n){return(
function rank(value) {
  const data = Array.from(names, name => ({name, value: value(name) || 0}));
  data.sort((a, b) => d3.descending(a.value, b.value));
  for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(n, i);
  return data;
}
)});
  main.define(["rank","datevalues"], function(rank,datevalues){return(
rank(name => datevalues[0][1].get(name))
)}); 
  main.define("k", function(){return(
10
)}); 
  main.define("keyframes", ["d3","datevalues","k","rank"], function(d3,datevalues,k,rank)
{
  const keyframes = [];
  let ka, a, kb, b;
  for ([[ka, a], [kb, b]] of d3.pairs(datevalues)) {
    for (let i = 0; i < k; ++i) {
      const t = i / k;
      keyframes.push([
        new Date(ka * (1 - t) + kb * t),
        rank(name => a.get(name) * (1 - t) + b.get(name) * t)
      ]);
    }
  }
  keyframes.push([new Date(kb), rank(name => b.get(name))]);
  return keyframes;
}
); 
  main.define("nameframes", ["d3","keyframes"], function(d3,keyframes){return(
d3.groups(keyframes.flatMap(([, data]) => data), d => d.name)
)});
  main.define("prev", ["nameframes","d3"], function(nameframes,d3){return(
new Map(nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])))
)});
  main.define("next", ["nameframes","d3"], function(nameframes,d3){return(
new Map(nameframes.flatMap(([, data]) => d3.pairs(data)))
)}); 
  main.define("bars", ["n","color","y","x","prev","next"], function(n,color,y,x,prev,next){return(
function bars(svg) {
  let bar = svg.append("g")
      .attr("fill-opacity", 0.6)
    .selectAll("rect");

  return ([date, data], transition) => bar = bar
    .data(data.slice(0, n), d => d.name)
    .join(
      enter => enter.append("rect")
        .attr("fill", color)
        .attr("height", y.bandwidth())
        .attr("x", x(0))
        .attr("y", d => y((prev.get(d) || d).rank))
        .attr("width", d => x((prev.get(d) || d).value) - x(0)),
      update => update,
      exit => exit.transition(transition).remove()
        .attr("y", d => y((next.get(d) || d).rank))
        .attr("width", d => x((next.get(d) || d).value) - x(0))
    )
    .call(bar => bar.transition(transition)
      .attr("y", d => y(d.rank))
      .attr("width", d => x(d.value) - x(0)));
}
)}); 
  main.define("labels", ["n","x","prev","y","next","textTween"], function(n,x,prev,y,next,textTween){return(
function labels(svg) {
  let label = svg.append("g")
      .style("font", "bold 12px var(--sans-serif)")
      .style("font-variant-numeric", "tabular-nums")
      .attr("text-anchor", "end")
    .selectAll("text");

  return ([date, data], transition) => label = label
    .data(data.slice(0, n), d => d.name)
    .join(
      enter => enter.append("text")
        .attr("transform", d => `translate(${x((prev.get(d) || d).value)},${y((prev.get(d) || d).rank)})`)
        .attr("y", y.bandwidth() / 2)
        .attr("x", -6)
        .attr("dy", "-0.25em")
        .text(d => d.name)
        .call(text => text.append("tspan")
          .attr("fill-opacity", 0.7)
          .attr("font-weight", "normal")
          .attr("x", -6)
          .attr("dy", "1.15em")),
      update => update,
      exit => exit.transition(transition).remove()
        .attr("transform", d => `translate(${x((next.get(d) || d).value)},${y((next.get(d) || d).rank)})`)
        .call(g => g.select("tspan").tween("text", d => textTween(d.value, (next.get(d) || d).value)))
    )
    .call(bar => bar.transition(transition)
      .attr("transform", d => `translate(${x(d.value)},${y(d.rank)})`)
      .call(g => g.select("tspan").tween("text", d => textTween((prev.get(d) || d).value, d.value))))
}
)});
  main.define("textTween", ["d3","formatNumber"], function(d3,formatNumber){return(
function textTween(a, b) {
  const i = d3.interpolateNumber(a, b);
  return function(t) {
    this.textContent = formatNumber(i(t));
  };
}
)});  
  main.define("formatNumber", ["d3"], function(d3){return(
d3.format(",d")
)}); 
  main.define("axis", ["margin","d3","x","width","barSize","n","y"], function(margin,d3,x,width,barSize,n,y){return(
function axis(svg) {
  const g = svg.append("g")
      .attr("transform", `translate(0,${margin.top})`);

  const axis = d3.axisTop(x)
      .ticks(width / 160)
      .tickSizeOuter(0)
      .tickSizeInner(-barSize * (n + y.padding()));

  return (_, transition) => {
    g.transition(transition).call(axis);
    g.select(".tick:first-of-type text").remove();
    g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
    g.select(".domain").remove();
  };
}
)}); 
  main.define("ticker", ["barSize","width","margin","n","formatDate","keyframes"], function(barSize,width,margin,n,formatDate,keyframes){return(
function ticker(svg) {
  const now = svg.append("text")
      .style("font", `bold ${barSize}px var(--sans-serif)`)
      .style("font-variant-numeric", "tabular-nums")
      .attr("text-anchor", "end")
      .attr("x", width - 6)
      .attr("y", margin.top + barSize * (n - 0.45))
      .attr("dy", "0.32em")
      .text(formatDate(keyframes[0][0]));

  return ([date], transition) => {
    transition.end().then(() => now.text(formatDate(date)));
  };
}
)});
  main.define("formatDate", ["d3"], function(d3){return(
d3.utcFormat("%Y")
)});
  main.define("color", ["d3","data"], function(d3,data)
{
  const scale = d3.scaleOrdinal(d3.schemeTableau10);
  if (data.some(d => d.category !== undefined)) {
    const categoryByName = new Map(data.map(d => [d.name, d.category]))
    scale.domain(Array.from(categoryByName.values()));
    return d => scale(categoryByName.get(d.name));
  }
  return d => scale(d.name);
}
); 
  main.define("x", ["d3","margin","width"], function(d3,margin,width){return(
d3.scaleLinear([0, 1], [margin.left, width - margin.right])
)});
  main.define("y", ["d3","n","margin","barSize"], function(d3,n,margin,barSize){return(
d3.scaleBand()
    .domain(d3.range(n + 1))
    .rangeRound([margin.top, margin.top + barSize * (n + 1 + 0.1)])
    .padding(0.1)
)});  
  main.define("height", ["margin","barSize","n"], function(margin,barSize,n){return(
margin.top + barSize * n + margin.bottom
)});
  main.define("barSize", function(){return(
48
)});
  main.define("margin", function(){return(
{top: 16, right: 6, bottom: 6, left: 0}
)}); 
  main.define("d3", ["require"], function(require){return(
require("d3@5", "d3-array@2")
)}); 
  return main;
}
