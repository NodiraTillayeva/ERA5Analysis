// Uzbekistan boundary
var countries = ee.FeatureCollection("FAO/GAUL/2015/level0");
var uzbekistan = countries.filter(ee.Filter.eq('ADM0_NAME', 'Uzbekistan'));
var region = uzbekistan.geometry();

// Text inputs for start and end date
var startDateInput = ui.Textbox({placeholder: 'YYYY-MM-DD', value: '2017-01-01'});
var endDateInput = ui.Textbox({placeholder: 'YYYY-MM-DD', value: '2017-12-31'});

// Info label
var imageCountLabel = ui.Label();
var resolutionLabel = ui.Label('ERA5 TCW: ~27km resolution, Monthly');

// Apply button
var applyButton = ui.Button({
  label: 'Apply Date Range',
  style: {stretch: 'horizontal'},
  onClick: updateMap
});

// Control panel
var controlPanel = ui.Panel({
  widgets: [
    ui.Label('Enter Start and End Dates:'),
    ui.Label('Start Date:'), startDateInput,
    ui.Label('End Date:'), endDateInput,
    applyButton,
    imageCountLabel,
    resolutionLabel
  ],
  style: {width: '300px'}
});
ui.root.insert(0, controlPanel);
Map.setOptions('SATELLITE');
// Chart panel
var chartPanel = ui.Panel({style: {width: '400px', position: 'bottom-right'}});
ui.root.add(chartPanel);

// Visualization
var visParams = {
  min: 0,
  max: 30,
  palette: ['blue', 'green', 'yellow', 'red']
};

// TCW TIFF asset list (update this with your full list)
var tcw_ids = [
  'projects/ee-ntillayeva-ndvi/assets/tcw_2017-01-01',
  'projects/ee-ntillayeva-ndvi/assets/tcw_2017-02-01',
  'projects/ee-ntillayeva-ndvi/assets/tcw_2017-03-01',
  'projects/ee-ntillayeva-ndvi/assets/tcw_2017-04-01',
  'projects/ee-ntillayeva-ndvi/assets/tcw_2017-05-01',
  'projects/ee-ntillayeva-ndvi/assets/tcw_2017-06-01',
  'projects/ee-ntillayeva-ndvi/assets/tcw_2017-07-01',
  'projects/ee-ntillayeva-ndvi/assets/tcw_2017-08-01',
  'projects/ee-ntillayeva-ndvi/assets/tcw_2017-09-01',
  'projects/ee-ntillayeva-ndvi/assets/tcw_2017-10-01',
  'projects/ee-ntillayeva-ndvi/assets/tcw_2017-11-01',
  'projects/ee-ntillayeva-ndvi/assets/tcw_2017-12-01',
  // Add more as needed
];

var tcwCollection = ee.ImageCollection(
  tcw_ids.map(function(id) {
    var dateStr = id.split('/').slice(-1)[0].split('_')[1]; // '2017-05-01'
    var date = ee.Date(dateStr);
    return ee.Image(id).set('system:time_start', date.millis());
  })
);

// Update function
function updateMap() {
  var startDate = startDateInput.getValue();
  var endDate = endDateInput.getValue();

  var co = tcwCollection
              .filterDate(startDate, endDate)
              .filterBounds(region);

  var meanCO = co.mean();

  // Reset map layers
  Map.layers().reset();
  Map.centerObject(region, 6);
  Map.addLayer(meanCO.clip(region), visParams, 'Total Water Column (kg/m²)');

  // Show number of images
  co.size().evaluate(function(count) {
    imageCountLabel.setValue('Number of images found: ' + count);
  });

  // Update click-to-chart with buffer-based analysis
  Map.onClick(function(coords) {
    var pt = ee.Geometry.Point([coords.lon, coords.lat]);
    var regionBuffer = pt.buffer(15000);  // 15 km buffer
    var tsChart = createTimeSeriesChart(regionBuffer, co, coords);
    chartPanel.clear();
    chartPanel.add(ui.Label('Time Series (15 km radius buffer)'));
    chartPanel.add(tsChart);
  });

  // Show observatory circles
  addObservatoryMarkers();
}

// Time-series chart with buffer
function createTimeSeriesChart(geometry, collection, coords) {
  return ui.Chart.image.series({
    imageCollection: collection,
    region: geometry,
    reducer: ee.Reducer.mean(),
    scale: 25000,  // Match pixel resolution
    xProperty: 'system:time_start'
  })
  .setChartType('LineChart')
  .setOptions({
    title: 'Time Series at [' + coords.lon.toFixed(2) + ', ' + coords.lat.toFixed(2) + '] (15km buffer)',
    hAxis: {title: 'Date'},
    vAxis: {title: 'Total Water Column (kg/m²)', viewWindow: {min: 0, max: 30}},
    lineWidth: 2,
    pointSize: 4,
    interpolateNulls: true
  });
}

// Format coordinate label
function formatPoint(point) {
  var coords = point.coordinates().getInfo();
  return '[' + coords[0].toFixed(2) + ', ' + coords[1].toFixed(2) + ']';
}

// Observatory markers
function addObservatoryMarkers() {
  var observatories = [
    {
      name: 'Tashkent Observatory',
      coords: [69.2163, 41.3386]
    },
    {
      name: 'Maidanak Observatory',
      coords: [66.8953, 38.6733]
    },
    {
      name: 'Kitab Observatory',
      coords: [66.8878, 39.1350]
    },
    {
      name: 'Andijan Telescope',
      coords: [72.3505, 40.7509]
    }
  ];

  observatories.forEach(function(obs) {
    var point = ee.Geometry.Point(obs.coords);
    var buffer = point.buffer(15000); // 15 km radius

    Map.addLayer(buffer, {color: 'cyan'}, obs.name + ' (area)');
    Map.addLayer(point, {color: 'magenta'}, obs.name + ' (center)');
  });
}

// Initial load
updateMap();
