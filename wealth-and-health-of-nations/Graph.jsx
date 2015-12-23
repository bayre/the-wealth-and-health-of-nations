Graph = React.createClass({
    
    updateGraph: function(props) {
//	var data = props.data;

//	var max = _.max(_.pluck(data, "qty"));
//	var yScale = d3.scale.linear()
//	                     .domain([0, max])
//	                     .range([0, props.height - 35]);

	// Various accessors that specify the four dimensions of data to visualize.
	function x(d) { return d.income; }
	function y(d) { return d.lifeExpectancy; }
	function radius(d) { return d.population; }
	function color(d) { return d.region; }
	function key(d) { return d.name; }

	// Chart dimensions are specified in getDefaultProps
	// and called in componentDidMount

	var height = props.height;
	var width = props.width;
	var margin = {top: props.marginTop,
		      right: props.marginRight,
		      bottom: props.marginBottom,
		      left: props.marginLeft};

	// Various scales. These domains make assumptions of data, naturally.
	var xScale = d3.scale.log().domain([300, 1e5]).range([0, width]),
	    yScale = d3.scale.linear().domain([10, 85]).range([height, 0]),
	    radiusScale = d3.scale.sqrt().domain([0, 5e8]).range([0, 40]),
	    colorScale = d3.scale.category10();

	// The x & y axes.
	var xAxis = d3.svg.axis().orient("bottom")
		.scale(xScale).ticks(12, d3.format(",d"));
	var yAxis = d3.svg.axis().scale(yScale).orient("left");

	var svg = d3.select("svg")
         	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Add the x-axis.
	svg.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(xAxis);

	// Add the y-axis.
	svg.append("g")
	    .attr("class", "y axis")
	    .call(yAxis);

	// Add an x-axis label.
	svg.append("text")
	    .attr("class", "x label")
	    .attr("text-anchor", "end")
	    .attr("x", width)
	    .attr("y", height - 6)
	    .text("income per capita, inflation-adjusted (dollars)");

	// Add a y-axis label.
	svg.append("text")
	    .attr("class", "y label")
	    .attr("text-anchor", "end")
	    .attr("y", 6)
	    .attr("dy", ".75em")
	    .attr("transform", "rotate(-90)")
	    .text("life expectancy (years)");


	// Add the year label; the value is set on transition.
	var label = svg.append("text")
		.attr("class", "year label")
		.attr("text-anchor", "end")
		.attr("y", height - 24)
		.attr("x", width)
		.text(1800);

	// Load the data.
	d3.json("data/nations.json", function(nations) {

	    // A bisector since many nation's data is sparsely-defined.
	    var bisect = d3.bisector(function(d) { return d[0]; });

	    // Finds (and possibly interpolates) the value for the specified year.
	    function interpolateValues(values, year) {
		var i = bisect.left(values, year, 0, values.length - 1),
		    a = values[i];
		if (i > 0) {
		    var b = values[i - 1],
			t = (year - a[0]) / (b[0] - a[0]);
		    return a[1] * (1 - t) + b[1] * t;
		}
		return a[1];
	    }
	    
	    // Interpolates the dataset for the given (fractional) year.
	    function interpolateData(year) {
		return nations.map(function(d) {
		    return {
			name: d.name,
			region: d.region,
			income: interpolateValues(d.income, year),
			population: interpolateValues(d.population, year),
			lifeExpectancy: interpolateValues(d.lifeExpectancy, year)
		    };
		});
	    }

	    // Positions the dots based on data.
	    function position(dot) {
		dot .attr("cx", function(d) { return xScale(x(d)); })
		    .attr("cy", function(d) { return yScale(y(d)); })
		    .attr("r", function(d) { return radiusScale(radius(d)); });
	    }

	    // Defines a sort order so that the smallest dots are drawn on top.
	    function order(a, b) {
		return radius(b) - radius(a);
	    }
	    
	    // Add a dot per nation. Initialize the data at 1800, and set the colors.
	    var dot = svg.append("g")
	            .attr("class", "dots")
	            .selectAll(".dot")
	            .data(interpolateData(1800))
	            .enter().append("circle")
	            .attr("class", "dot")
	            .style("fill", function(d) { return colorScale(color(d)); })
	            .call(position)
	            .sort(order);

	});
    },
    
    componentDidMount: function() {
	//this is invoked once when the component is first rendered
	var el = this.getDOMNode(); //this is the div we are rendering

	var marginLeft = this.props.marginLeft;
	var marginRight = this.props.marginRight;
	var marginTop = this.props.marginTop;
	var marginBottom = this.props.marginBottom;
	
	//create the SVG container and set the origin"
	var svg = d3.select(el)
		.append("svg")
		.attr("width", this.props.width + marginLeft + marginRight)
		.attr("height", this.props.height + marginTop + marginBottom);
//	        .append("g")
//		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	this.updateGraph(this.props);
    },

    componentWillUpdate: function(nextProps) {
	//this is invoked every time the props change
	this.updateGraph(nextProps);
    },

    getDefaultProps: function() {
	//this is a protection for the case that not all props are passed
	var margin = {top: 19.5, right: 19.5, bottom: 19.5, left: 39.5};

	return {
	    width: 960 - margin.right,
	    height: 500 - margin.top - margin.bottom,
	    marginTop: margin.top,
	    marginBottom: margin.bottom,
	    marginRight: margin.right,
	    marginLeft: margin.left
	}
    },


    render: function() {
	return (
	    <div className="#chart"></div>
	);
    }
});
